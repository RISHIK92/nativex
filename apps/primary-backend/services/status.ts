import Redis from "ioredis";

const redis = new Redis({ host: "localhost", port: 6381 });

export async function getStatus(projectId: string) {
  const status = await redis.get(`project:${projectId}:status`);

  return status || "PENDING";
}
