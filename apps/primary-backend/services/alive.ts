import { Redis } from "ioredis";

const redis = new Redis({
  host: "localhost",
  port: 6381,
});

export function isAlive() {
  return redis.ping();
}
