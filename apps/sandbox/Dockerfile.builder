# Dockerfile.builder
FROM oven/bun:1

RUN apt-get update && apt-get install -y curl openssl build-essential git python3 unzip \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY apps/worker/package.json .

RUN bun install

COPY apps/worker .

COPY packages/db/prisma/schema.prisma ./prisma/schema.prisma

RUN bunx prisma generate

CMD ["bun", "run", "index.ts"]
