"use client";

import { BACKEND_URL } from "@/config";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { useState, useEffect } from "react";

interface Prompt {
  id: string;
  content: string;
  type: "USER" | "SYSTEM";
  createdAt: Date;
}

export function usePrompts(projectId?: string) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const { getToken } = useAuth();

  useEffect(() => {
    async function getPrompts() {
      const token = await getToken();
      const prompts = await axios.get(`${BACKEND_URL}/prompts/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPrompts(prompts.data.prompts);
    }
    getPrompts();
    let interval = setInterval(getPrompts, 50000);
    return () => clearInterval(interval);
  }, []);

  return { prompts };
}
