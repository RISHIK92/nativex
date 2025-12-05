import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

(async () => await redisClient.connect())();

redisClient.on("ready", () => console.log("Redis Client Connected"));

redisClient.on("error", (err) => console.log("Redis Client Error", err));
