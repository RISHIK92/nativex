import { Queue, QueueEvents } from "bullmq";
import Redis from "ioredis";

const queue = new Queue("spawn", {
  connection: { host: "localhost", port: 6381 },
});

const queueEvents = new QueueEvents("spawn", {
  connection: { host: "localhost", port: 6381 },
});

const redis = new Redis({ host: "localhost", port: 6381 });

await queueEvents.waitUntilReady();

async function spawnJob(projectId: string, activate?: boolean) {
  const job = await queue.add("spawn-container", { projectId, activate });

  return job;
}

async function getPort(projectId: string) {
  const port = await redis.get(`project:${projectId}:url`);
  return port;
}

export { spawnJob, getPort };
