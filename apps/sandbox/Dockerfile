FROM codercom/code-server:4.96.4

USER root
RUN apt-get update \
    && apt-get install -y curl build-essential openssl git python3 unzip \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs net-tools \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
RUN rm -rf /etc/sudoers.d/nopasswd

ENV BUN_INSTALL=/usr/local
RUN curl -fsSL https://bun.sh/install | bash

WORKDIR /usr/src/worker
COPY apps/worker .
COPY packages/db/prisma/schema.prisma ./prisma/schema.prisma

RUN bun add ioredis 
RUN bun install
RUN bunx prisma generate

WORKDIR /home/coder/expo-template
RUN npx create-expo-app@latest .

WORKDIR /usr/src/worker

COPY apps/sandbox/entrypoint.sh /usr/src/entrypoint.sh
COPY apps/sandbox/autokill.sh /usr/src/autokill.sh

RUN chmod +x /usr/src/entrypoint.sh
RUN chmod +x /usr/src/autokill.sh

RUN chown -R coder:coder /usr/src/worker

WORKDIR /home/coder/project

EXPOSE 8080
EXPOSE 8081

ENTRYPOINT [ "/usr/src/entrypoint.sh" ]