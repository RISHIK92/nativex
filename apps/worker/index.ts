import express from "express";
import cors from "cors";
import { prismaClient } from "db/client";
import { systemPrompt } from "./systemPrompt";
import { ArtifactProcessor } from "./parser";
import { onFileUpdate, onShellCommand } from "./os";

const app = express();
app.use(express.json());
app.use(cors());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post("/prompt", async (req, res) => {
  const { prompt, projectId } = req.body;

  console.log(projectId, prompt, "sdc");

  await prismaClient.prompt.create({
    data: {
      content: prompt,
      projectId,
      type: "USER",
    },
  });

  const allPrompts = await prismaClient.prompt.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  let artifactProcessor = new ArtifactProcessor(
    "",
    (filePath, fileContent) => onFileUpdate(filePath, fileContent, projectId),
    (shellCommand) => onShellCommand(shellCommand, projectId)
  );

  let artifact = "";

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
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

  if (!response.ok || !response.body) {
    console.error("Groq request failed");
    return res.status(500).json({ error: "Failed to generate response" });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

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
        } catch (err) {
          console.error("Stream parse error", err);
        }
      }
    }
  }

  await prismaClient.prompt.create({
    data: {
      content: artifact,
      projectId,
      type: "SYSTEM",
    },
  });

  res.json({ status: "ok", result: artifact });
});

app.listen(9090, () => {
  console.log("Server running on http://localhost:9090");
});
