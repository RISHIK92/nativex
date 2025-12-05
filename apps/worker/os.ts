import { prisma } from "./config/db";

export function os() {
  const BASE_WORKER_DIR = "/home/coder/project";

  async function onFileUpdate(
    filePath: string,
    fileContent: string,
    projectId: string
  ) {
    await Bun.write(`${BASE_WORKER_DIR}/${filePath}`, fileContent);
    await prisma.action.create({
      data: {
        projectId,
        content: `Updated file ${filePath}`,
      },
    });
  }

  async function onShellCommand(shellCommand: string, projectId: string) {
    //npm run build && npm run start
    const commands = shellCommand
      .split("&&")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0); // ← filters out empty parts

    for (const command of commands) {
      const result = Bun.spawnSync({
        cmd: ["sh", "-c", command],
        cwd: BASE_WORKER_DIR,
      });
      const stdout = result.stdout.toString();
      const stderr = result.stderr.toString();
      const output = stdout || stderr;

      await prisma.action.create({
        data: {
          projectId,
          content: `Ran command: ${command}\nOutput: ${output}`,
        },
      });
    }
  }
  return { onFileUpdate, onShellCommand };
}
