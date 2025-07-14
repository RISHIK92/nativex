"use client";

import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { SendIcon } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { BACKEND_URL, WORKER_API_URL } from "@/config";
import { useRouter } from "next/navigation";

export default function Prompt() {
  const [prompt, setPrompt] = useState();
  const { getToken } = useAuth();
  const router = useRouter();

  return (
    <div className="w-full max-w-xl flex flex-col">
      <Textarea
        placeholder="Create a chess application"
        onChange={(e: any) => {
          setPrompt(e.target.value);
        }}
      />
      <Button
        className="self-end mt-2"
        onClick={async () => {
          const token = await getToken();
          const response = await axios.post(
            `${BACKEND_URL}/project`,
            {
              prompt: prompt,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log(response.data);
          await axios.post(`${WORKER_API_URL}/prompt`, {
            projectId: response.data.id,
            prompt: prompt,
          });
          router.push(`/project/${response.data.id}`);
        }}
      >
        <SendIcon />
      </Button>
    </div>
  );
}
