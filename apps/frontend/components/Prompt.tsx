"use client";

import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send, Sparkles, Loader2, Lightbulb } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { BACKEND_URL, WORKER_API_URL } from "@/config";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

const suggestions = [
  "Create a fitness tracking app with workout plans and progress charts",
  "Build a social media app for sharing photos with friends",
  "Design a task management app with team collaboration features",
  "Make a food delivery app with restaurant listings and order tracking",
  "Create a meditation app with guided sessions and progress tracking",
];

export default function Prompt() {
  const { getToken } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await axios.post(
        `${BACKEND_URL}/project`,
        { prompt: prompt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await axios.post(`${WORKER_API_URL}/prompt`, {
        projectId: response.data.id,
        prompt: prompt,
      });

      router.push(`/project/${response.data.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="relative group">
        <Textarea
          placeholder="Describe your mobile app idea in detail..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className="min-h-[160px] bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-500 resize-none text-lg leading-relaxed focus:border-amber-600 focus:ring-amber-600/20 transition-all duration-200 rounded-xl shadow-sm"
          disabled={isLoading}
        />

        {/* Enhanced character count */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <div className="text-xs text-gray-400">{prompt.length}/1000</div>
          <div
            className={`w-2 h-2 rounded-full ${prompt.length > 800 ? "bg-red-400" : prompt.length > 500 ? "bg-amber-500" : "bg-green-500"}`}
          ></div>
        </div>

        {/* Subtle glow effect on focus */}
        <div className="absolute -inset-1 bg-gradient-to-r from-gray-900/0 to-amber-700/0 group-focus-within:from-gray-900/10 group-focus-within:to-amber-700/10 rounded-xl blur transition-all duration-300 -z-10"></div>
      </div>

      {/* Suggestions */}
      {showSuggestions && prompt.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-gray-700">
              Try these ideas:
            </span>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>AI will generate your complete React Native app</span>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isLoading}
          className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
              Generate App
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
