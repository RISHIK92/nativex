import { prisma } from "./config/db";
import { systemPrompt } from "./systemPrompt";
import { ArtifactProcessor } from "./parser";
import Redis from "ioredis";
import { os } from "./os";

const redis = new Redis(process.env.REDIS_URL as string);
const system = os();

async function worker() {
  const projectId = process.env.PROJECT_ID || "";
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!projectId) {
    console.error("[Worker] ❌ No Project ID found in environment.");
    process.exit(1);
  }

  console.log(`[Worker] 🚀 Starting worker for Project: ${projectId}`);

  try {
    console.log("[Worker] 🔄 Updating Redis status to GENERATING...");
    await redis.set(`project:${projectId}:status`, "GENERATING");

    console.log("[Worker] 📂 Fetching prompt history from DB...");
    const allPrompts = await prisma.prompt.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });
    console.log(`[Worker] ✅ Found ${allPrompts.length} previous prompts.`);

    let artifactProcessor = new ArtifactProcessor(
      "",
      (filePath, fileContent) => {
        console.log(`[Worker] 📝 Writing file: ${filePath}`);
        return system.onFileUpdate(filePath, fileContent, projectId);
      },
      // Shell Command Callback
      (shellCommand) => {
        console.log(
          `[Worker] 🐚 AI suggested command: ${shellCommand} (Skipping execution)`
        );
        return null;
      }
    );

    let artifact = "";

    console.log("[Worker] 🤖 Sending request to Gemini AI...");
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.0-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...allPrompts.map((p: any) => ({
              role: p.type === "USER" ? "user" : "assistant",
              content: p.content,
            })),
          ],
          stream: true,
        }),
      }
    );

    console.log(`[Worker] 📡 AI Response Status: ${response.status}`);

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      console.error("[Worker] ❌ API Error Details:", errorText);
      await redis.set(`project:${projectId}:status`, "ERROR");
      return { error: "Failed to generate response" };
    }

    console.log("[Worker] 🌊 Streaming started...");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("[Worker] 🌊 Stream finished.");
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const raw = line.replace("data: ", "");
          if (raw === "[DONE]") continue;

          try {
            const json = JSON.parse(raw);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              artifactProcessor.append(delta);
              artifactProcessor.parse();
              artifact += delta;
            }
          } catch (err) {}
        }
      }

      chunkCount++;
      if (chunkCount % 50 === 0) {
        process.stdout.write(".");
      }
    }
    console.log("");

    console.log("[Worker] 💾 Saving system prompt to DB...");
    await prisma.prompt.create({
      data: {
        content: artifact,
        projectId,
        type: "SYSTEM",
      },
    });

    console.log("[Worker] ✅ Marking project as READY...");
    await redis.set(`project:${projectId}:status`, "READY");

    return { result: artifact };
  } catch (err) {
    await redis.set(`project:${projectId}:status`, "ERROR");
    console.error("[Worker] ❌ CRITICAL FAILURE:", err);
    process.exit(1);
  }
}

worker()
  .then(() => {
    console.log("[Worker] 👋 Exiting process with code 0.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[Worker] ❌ Unhandled Rejection:", err);
    process.exit(1);
  });
