import { prismaClient } from "db/client";
import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware";

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
  res.json(project);
});

app.get("/projects", authMiddleware, async (req, res) => {
  const userId = req.userId;

  const project = await prismaClient.project.findMany({
    where: { userId },
  });
  res.json(project);
});

app.get("/prompts/:projectId", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const projectId = req.params.projectId;
  const prompts = await prismaClient.prompt.findMany({
    where: { projectId },
  });
  res.json({ prompts });
});

app.get("/actions/:projectId", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const projectId = req.params.projectId;
  const actions = await prismaClient.action.findMany({
    where: { projectId },
  });
  res.json({ actions });
});

app.listen(3002, () => {
  console.log("sever running on", 3002);
});
