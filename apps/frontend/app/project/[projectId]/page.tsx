"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAction } from "@/app/hooks/useActions";
import { usePrompts } from "@/app/hooks/usePrompt";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { WORKER_API_URL, WORKER_URL } from "@/config";
import axios from "axios";
import {
  Send,
  ArrowLeft,
  Loader2,
  Smartphone,
  User,
  Sparkles,
  Copy,
  RotateCcw,
  MoreHorizontal,
} from "lucide-react";
import { AnimatedLogo } from "@/components/AnimatedLogo";

export default function ChatWindow({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = React.use(params);
  const { prompts } = usePrompts(projectId);
  const { actions } = useAction(projectId);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [prompts, actions]);

  const handleSendMessage = async () => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await axios.post(`${WORKER_API_URL}/prompt`, {
        projectId: projectId,
        prompt: content,
      });
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Combine and sort messages
  const allMessages = [
    ...prompts.map((p) => ({
      ...p,
      type: p.type as "USER" | "AI",
      timestamp: new Date(p.createdAt),
    })),
    ...actions.map((a) => ({
      ...a,
      type: "AI" as const,
      timestamp: new Date(a.createdAt),
    })),
  ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <AnimatedLogo size="small" />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {allMessages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-gray-500 text-sm">
                  Start a conversation about your app
                </p>
              </div>
            ) : (
              allMessages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLast={index === allMessages.length - 1}
                />
              ))
            )}

            {isLoading && (
              <div className="animate-in slide-in-from-bottom-2 duration-300">
                <AIMessageBubble isLoading={true} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Ask me anything about your app..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              className="min-h-[44px] max-h-[120px] resize-none bg-gray-50 border-gray-200 rounded-xl pr-12 text-sm focus:bg-white focus:border-amber-600 focus:ring-amber-600/20 transition-all duration-200"
              disabled={isLoading}
              rows={1}
            />

            <Button
              onClick={handleSendMessage}
              disabled={!content.trim() || isLoading}
              size="sm"
              className="absolute right-2 bottom-2 h-8 w-8 p-0 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-lg"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{content.length}/2000</span>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col">
        {/* Preview Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-amber-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Live Preview
                </h2>
                <p className="text-sm text-gray-500">
                  Project: {projectId.slice(0, 8)}...
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="text-gray-600 bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 p-6 bg-gray-100">
          <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <iframe
              src={`${WORKER_URL}`}
              width="100%"
              height="100%"
              className="border-none"
              title="App Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isLast }: { message: any; isLast: boolean }) {
  if (message.type === "USER") {
    return <UserMessageBubble message={message} isLast={isLast} />;
  } else {
    return <AIMessageBubble message={message} isLast={isLast} />;
  }
}

function UserMessageBubble({
  message,
  isLast,
}: {
  message: any;
  isLast: boolean;
}) {
  return (
    <div
      className={`animate-in slide-in-from-bottom-2 duration-300 ${isLast ? "animate-in" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">You</span>
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="bg-gray-100 rounded-lg rounded-tl-sm p-3 border border-gray-200">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIMessageBubble({
  message,
  isLast,
  isLoading,
}: {
  message?: any;
  isLast?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div
      className={`animate-in slide-in-from-bottom-2 duration-300 ${isLast ? "animate-in" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-gray-900 to-amber-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <Sparkles className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">NativeX</span>
            {!isLoading && message && (
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          <div className="bg-amber-50 rounded-lg rounded-tl-sm p-3 border border-amber-200">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm text-gray-600">
                  Generating response...
                </span>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {message?.content}
                </p>

                {!isLoading && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-amber-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-gray-600 hover:text-gray-800"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-gray-600 hover:text-gray-800"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
