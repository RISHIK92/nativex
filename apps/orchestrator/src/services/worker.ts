import { Worker } from "bullmq";
import Redis from "ioredis";
import {
  startDevEnvironment,
  runAIBuilder,
  waitForProjectInit,
} from "../processors/orchestrator";

const redis = new Redis({ host: "localhost", port: 6381 });

const worker = new Worker(
  "spawn",
  async (job) => {
    const { projectId, activate } = job.data;
    console.log(activate, "activation");

    await redis.set(`project:${projectId}:status`, "BOOTING");

    const { url } = await startDevEnvironment(projectId as string);

    await redis.set(`project:${projectId}:url`, url);

    if (activate) {
      await waitForProjectInit(projectId as string);
      await redis.set(`project:${projectId}:status`, "READY");
    }

    if (!activate) {
      runAIBuilder(projectId as string);
    }

    return { success: true, url };
  },
  {
    connection: { host: "localhost", port: 6381 },
  }
);
