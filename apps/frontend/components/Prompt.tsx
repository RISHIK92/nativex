"use client";

import { Button } from "./ui/button";
import { Button as MovingButton } from "./ui/moving-border";
import { Textarea } from "./ui/textarea";
import { Send, Sparkles, Loader2, Lightbulb } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { BACKEND_URL, WORKER_API_URL } from "@/config";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const suggestions = [
  "Create a task management app",
  "Create a Basic Amazon Homepage clone",
  "Create a fitness tracking app with workout plans in homepage",
];

export default function Prompt() {
  const { getToken } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await axios.post(
        `${BACKEND_URL}/project`,
        { prompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { project } = response.data;
      router.push(`/project/${project.id}?new=true`);
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col space-y-8">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-100 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white rounded-2xl shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 group-focus-within:shadow-[0_0_25px_rgba(245,158,11,0.2)]">
          <Textarea
            placeholder="How can I help you build today?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-900 placeholder:text-gray-400 resize-none text-lg p-6 rounded-2xl shadow-none"
            disabled={isLoading}
          />

          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-2">
              {/* Optional: Add attachment or other icons here */}
            </div>

            {prompt.trim().length > 0 ? (
              <MovingButton
                onClick={handleSubmit}
                borderRadius="0.75rem"
                className="bg-gray-900 text-white border-none text-sm font-medium flex items-center gap-2"
                containerClassName="h-10 w-auto min-w-[140px] p-[2px]"
                borderClassName="bg-[radial-gradient(#f59e0b_40%,transparent_60%)]" // Amber gradient
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Generate App</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </MovingButton>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isLoading}
                className="bg-gray-900 text-white hover:bg-gray-800 rounded-xl px-4 py-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-10 min-w-[140px]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Generate App</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Suggestions Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-sm text-gray-600 hover:text-gray-900 rounded-full transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
