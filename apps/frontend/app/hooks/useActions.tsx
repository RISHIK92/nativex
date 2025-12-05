"use client";

import { BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useState, useEffect } from "react";

interface Action {
  id: string;
  content: string;
  type: "USER" | "SYSTEM";
  createdAt: Date;
}

interface Prompt {
  id: string;
  content: string;
  type: "USER" | "SYSTEM";
  createdAt: Date;
}

export function useAction(projectId?: string) {
  const [actions, setActions] = useState<Action[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [status, setStatus] = useState<string>("PENDING");
  const { getToken } = useAuth();

  useEffect(() => {
    async function getActions() {
      const token = await getToken();
      const response = await axios.get(`${BACKEND_URL}/actions/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActions(response.data.actions);
      setPrompts(response.data.prompts);
      setStatus(response.data.result);
    }
    getActions();
    let interval = setInterval(getActions, 5000);
    return () => clearInterval(interval);
  }, []);

  return { actions, prompts, status };
}
