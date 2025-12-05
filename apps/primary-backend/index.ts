import { prismaClient } from "db/client";
import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware";
import { getPort, spawnJob } from "./services/queue";
import { getStatus } from "./services/status";

const app = express();

app.use(express.json());
app.use(cors());

app.post("/project", authMiddleware, async (req, res) => {
  const { prompt } = req.body;
  const userId = req.userId;

  const description = prompt.split("/n")[0];
  const project = await prismaClient.project.create({
    data: { description, userId },
  });
  await prismaClient.prompt.create({
    data: {
      content: prompt,
      projectId: project.id,
      type: "USER",
    },
  });
  const result = await spawnJob(project.id);
  return res.status(201).json({ project, result });
});

app.put("/project/:projectId", authMiddleware, async (req, res) => {
  const { prompt } = req.body;
  const projectId = req.params.projectId;

  if (!projectId) {
    return res.status(400).json({ error: "Project ID is required" });
  }

  const project = await prismaClient.prompt.create({
    data: {
      content: prompt,
      projectId,
      type: "USER",
    },
  });
  const result = await spawnJob(projectId as string);
  return res.status(201).json({ project, result });
});

app.post("/project/:projectId/activate", authMiddleware, async (req, res) => {
  const projectId = req.params.projectId;
  const result = await spawnJob(projectId as string, true);
  return res.status(201).json({ result });
});

app.get("/port/:projectId", authMiddleware, async (req, res) => {
  const projectId = req.params.projectId;
  const port = await getPort(projectId as string);
  res.json({ port });
});

app.get("/projects", authMiddleware, async (req, res) => {
  const userId = req.userId;

  const project = await prismaClient.project.findMany({
    where: { userId },
  });
  res.json(project);
});

app.get("/prompts/:projectId", authMiddleware, async (req, res) => {
  const projectId = req.params.projectId;
  const prompts = await prismaClient.prompt.findMany({
    where: { projectId },
  });
  res.json({ prompts });
});

app.get("/actions/:projectId", authMiddleware, async (req, res) => {
  const projectId = req.params.projectId;
  const actions = await prismaClient.action.findMany({
    where: { projectId },
  });
  const prompts = await prismaClient.prompt.findMany({
    where: { projectId },
  });
  const result = await getStatus(projectId as string);
  res.json({ actions, prompts, result: result });
});

app.listen(3002, () => {
  console.log("sever running on", 3002);
});
