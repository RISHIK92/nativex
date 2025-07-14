"use client";

import React, { useState } from "react";
import { useAction } from "@/app/hooks/useActions";
import { usePrompts } from "@/app/hooks/usePrompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WORKER_API_URL, WORKER_URL } from "@/config";
import axios from "axios";
import { Send } from "lucide-react";
import { Prompt } from "next/font/google";

export default function ChatWindow({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = React.use(params);
  const { prompts } = usePrompts(projectId);
  const { actions } = useAction(projectId);
  const [content, setContent] = useState();
  return (
    <div className="flex h-screen">
      <div className="w-1/5 h-screen flex flex-col justify-between">
        <div>
          Chat History
          {prompts
            .filter((prompt) => prompt.type === "USER")
            .map((prompt) => (
              <div key={prompt.id}>{prompt.content}</div>
            ))}
          {actions.map((action) => (
            <div key={action.id}>{action.content}</div>
          ))}
        </div>
        <div className="flex gap-2 pb-20">
          <Input
            onChange={(e: any) => {
              setContent(e.target.value);
            }}
          />
          <Button
            onClick={() => {
              axios.post(`${WORKER_API_URL}/prompt`, {
                projectId: projectId,
                prompt: content
              });
            }}
          >
            <Send />
          </Button>
        </div>
      </div>
      <div className="w-4/5">
        <iframe src={`${WORKER_URL}`} width={"100%"} height={"90%"} />
      </div>
    </div>
  );
}
