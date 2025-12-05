import Docker from "dockerode";
import path from "path";
import fs from "fs";

const docker = new Docker();

const HOST_ROOT =
  process.platform === "darwin"
    ? "/Users/rishikchowdarykaruturi/projects"
    : "/home/user/projects";

const BASE_DOMAIN = "nativex.rishik.codes";
const NETWORK_NAME = "nativex-net";

const MAX_WAIT_TIME = 600000;
const POLL_INTERVAL = 500;

async function ensureNetwork() {
  try {
    await docker.getNetwork(NETWORK_NAME).inspect();
  } catch (e) {
    console.log(`Creating network ${NETWORK_NAME}...`);
    await docker.createNetwork({ Name: NETWORK_NAME, Driver: "bridge" });
  }
}

export async function waitForProjectInit(projectId: string) {
  const hostDir = path.join(HOST_ROOT, projectId);
  const doneFlag = path.join(hostDir, ".init-done");
  const startTime = Date.now();

  console.log(`⏳ Waiting for ${doneFlag}...`);

  while (Date.now() - startTime < MAX_WAIT_TIME) {
    try {
      const files = fs.readdirSync(hostDir);
      if (files.includes(".init-done")) {
        console.log("✅ Project initialized.");
        return true;
      }
    } catch (err) {}
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }
  console.error("❌ Timeout waiting for project initialization.");
  return false;
}

function ensureProjectDir(projectId: string) {
  const hostDir = path.join(HOST_ROOT, projectId);
  if (!fs.existsSync(hostDir)) {
    fs.mkdirSync(hostDir, { recursive: true });
    fs.chmodSync(hostDir, "777");
  }
  return hostDir;
}

export async function startDevEnvironment(projectId: string) {
  await ensureNetwork();
  const containerName = `editor-${projectId}`;
  const projectUrl = `http://${projectId}.${BASE_DOMAIN}`;

  ensureProjectDir(projectId);

  const existing = docker.getContainer(containerName);

  try {
    const data = await existing.inspect();

    if (data.State.Running) {
      console.log(`✅ Container ${containerName} is already running.`);
      return { url: projectUrl };
    }

    console.log(
      `🔄 Container ${containerName} exists but is stopped. Starting...`
    );
    await existing.start();
    return { url: projectUrl };
  } catch (error: any) {
    if (error.statusCode !== 404) {
      console.error("❌ Error inspecting container:", error);
      throw error;
    }
  }

  console.log(`🆕 Creating new container ${containerName}...`);

  try {
    const container = await docker.createContainer({
      Image: "nativex-editor",
      name: containerName,
      HostConfig: {
        Binds: [`${HOST_ROOT}/${projectId}:/home/coder/project`],
        NetworkMode: NETWORK_NAME,
      },
      Labels: {
        "traefik.enable": "true",

        [`traefik.http.routers.editor-${projectId}.rule`]: `Host(\`${projectId}.${BASE_DOMAIN}\`)`,
        [`traefik.http.routers.editor-${projectId}.entrypoints`]: "web",

        [`traefik.http.routers.editor-${projectId}-secure.rule`]: `Host(\`${projectId}.${BASE_DOMAIN}\`)`,
        [`traefik.http.routers.editor-${projectId}-secure.entrypoints`]:
          "websecure",

        [`traefik.http.routers.editor-${projectId}-secure.tls`]: "true",
        [`traefik.http.routers.editor-${projectId}-secure.tls.certresolver`]:
          "myresolver",

        [`traefik.http.services.editor-${projectId}.loadbalancer.server.port`]:
          "8080",
      },
    });

    await container.start();

    return { url: projectUrl };
  } catch (err) {
    console.error("❌ Failed to create container:", err);
    throw err;
  }
}

export async function runAIBuilder(projectId: string) {
  await ensureNetwork();
  ensureProjectDir(projectId);
  console.log(`Running AI Builder for project ${projectId}...`);

  const isReady = await waitForProjectInit(projectId);
  if (!isReady) {
    console.log("❌ Skipping AI Builder because project failed to init.");
    return;
  }

  const builder = await docker.createContainer({
    Image: "nativex-builder",
    AttachStdout: true,
    AttachStderr: true,
    Env: [
      `PROJECT_ID=${projectId}`,
      `DATABASE_URL=postgresql://postgres:my_password@host.docker.internal:5436/postgres`,
      `REDIS_URL=redis://host.docker.internal:6381`,
      `GEMINI_API_KEY=AIzaSyBbroWJnzj3geX-SPBOrnQNwE1Y-RCEUuU`,
    ],
    HostConfig: {
      Binds: [`${HOST_ROOT}/${projectId}:/home/coder/project`],
      NetworkMode: NETWORK_NAME,
    },
  });

  await builder.start();

  // Pipe logs to console for debugging
  const stream = await builder.logs({
    follow: true,
    stdout: true,
    stderr: true,
  });
  builder.modem.demuxStream(stream, process.stdout, process.stderr);
}
