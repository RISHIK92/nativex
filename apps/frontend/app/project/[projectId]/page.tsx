"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAction } from "@/app/hooks/useActions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BACKEND_URL, WORKER_API_URL, WORKER_URL } from "@/config";
import axios from "axios";
import {
  Send,
  ArrowLeft,
  Loader2,
  Smartphone,
  User,
  Sparkles,
  RotateCcw,
  MoreHorizontal,
  ArrowDown,
  Info,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { usePort } from "@/app/hooks/usePort";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { useRouter, useSearchParams } from "next/navigation";
import { parseArtifact, containsArtifact } from "@/utils/artifactParser";
import { ArtifactAccordion } from "@/components/ArtifactAccordion";
import { CopyButton } from "@/components/CopyButton";

export default function ChatWindow({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { getToken } = useAuth();
  const { projectId } = React.use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new");
  const { actions, prompts, status } = useAction(projectId);
  const { port, status: containerStatus } = usePort(projectId);
  const [viewMode, setViewMode] = useState<"live" | "preview">("live");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Combine and sort messages
  const allMessages = [
    ...prompts.map((prompt: any) => ({
      ...prompt,
      type: "USER",
      timestamp: prompt.createdAt,
    })),
    ...actions.map((action: any) => ({
      ...action,
      type: "AI",
      timestamp: action.createdAt,
    })),
  ].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
    setShowScrollButton(false);
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const isBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 50;

    setIsAtBottom(isBottom);
    setShowScrollButton(!isBottom);
  };

  useEffect(() => {
    if (isNew) {
      router.replace(`/project/${projectId}`);
    } else {
      async function activate() {
        const token = await getToken();
        await axios.post(
          `${BACKEND_URL}/project/${projectId}/activate`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      activate();
    }
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [actions, prompts]);

  const handleSendMessage = async () => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const token = await getToken();
      await axios.put(
        `${BACKEND_URL}/project/${projectId}`,
        {
          prompt: content,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
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

  // Calculate preview URL
  const previewUrl = port
    ? viewMode === "live"
      ? port
      : `${port.replace(/\/$/, "")}/proxy/8081`
    : null;

  const [iframeLoading, setIframeLoading] = useState(true);

  // Reset iframe loading state when preview URL changes
  useEffect(() => {
    if (previewUrl) {
      setIframeLoading(true);
    }
  }, [previewUrl]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Panel - Chat Interface */}
      <div className="w-1/4 flex flex-col border-r border-gray-200 bg-white relative z-10 shadow-xl">
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              onClick={() => (window.location.href = "/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-semibold text-gray-900 tracking-tight">
                AI Developer
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-900"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-900"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden relative">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto p-6 space-y-6 scroll-smooth"
          >
            {allMessages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start Building
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                  Describe your app idea and the AI will help you bring it to
                  life.
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

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <div className="sticky bottom-4 flex justify-center w-full pointer-events-none">
              <Button
                size="sm"
                className="rounded-full shadow-lg bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 pointer-events-auto transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                onClick={scrollToBottom}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>
          )}
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

            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button
                  onClick={() => setViewMode("live")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === "live"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    viewMode === "preview"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Preview
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  {viewMode === "live" ? "Live" : "Preview"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 p-6 bg-gray-100 flex flex-col gap-4 overflow-hidden">
          {viewMode === "preview" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3 text-sm text-blue-800 animate-in fade-in slide-in-from-top-2 flex-shrink-0">
              <Info className="w-4 h-4 flex-shrink-0 text-blue-600" />
              <span>
                Ensure{" "}
                <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-xs font-medium text-blue-900">
                  npm run web
                </code>{" "}
                is running in the terminal to view the mobile preview.
              </span>
            </div>
          )}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div
              className={`bg-white shadow-2xl overflow-hidden relative transition-all duration-500 ease-in-out ${
                viewMode === "preview"
                  ? "w-[375px] h-[812px] max-h-full rounded-[2rem] border-[8px] border-gray-900 ring-1 ring-gray-900/10"
                  : "w-full h-full rounded-xl border border-gray-200"
              }`}
            >
              {status === "READY" && previewUrl ? (
                <div className="relative w-full h-full">
                  {/* Iframe Loading Overlay */}
                  {iframeLoading && (
                    <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-4" />
                      <p className="text-gray-500 font-medium">
                        Loading Preview...
                      </p>
                    </div>
                  )}

                  <iframe
                    src={previewUrl}
                    width="100%"
                    height="100%"
                    className="border-none"
                    title="App Preview"
                    onLoad={() => setIframeLoading(false)}
                    sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                    allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; clipboard-read; clipboard-write;"
                  />
                </div>
              ) : (
                <LoadingOverlay status={status} />
              )}
            </div>
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
  const rawContent = message.content || "";

  // Try to parse the artifact
  const parsedArtifact = containsArtifact(rawContent)
    ? parseArtifact(rawContent)
    : null;

  return (
    <div
      className={`animate-in slide-in-from-bottom-2 duration-300 ${isLast ? "animate-in" : ""}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 border border-gray-200">
          <User className="w-4 h-4 text-gray-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-medium text-gray-900">You</span>
            <span className="text-xs text-gray-400">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl rounded-tl-none p-4 border border-gray-100 shadow-sm">
            {parsedArtifact ? (
              <ArtifactAccordion artifact={parsedArtifact} />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-normal">
                {message.content}
              </p>
            )}
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
  // Pre-process content to escape bolt tags so they render as text in markdown
  // This prevents ReactMarkdown from stripping them or trying to parse them as HTML
  const processContent = (text: string) => {
    if (!text) return "";
    let processed = text;
    // Escape bolt tags so they render as text if markdown fallback is used
    processed = processed.replace(/<(?=\/?bolt)/g, "&lt;");
    // Handle non-standard code block delimiters (''')
    processed = processed.replace(/^\s*'''/gm, "```");
    return processed;
  };

  const rawContent = message?.content || "";
  const processedContent = processContent(rawContent);

  // Try to parse the artifact
  const parsedArtifact = containsArtifact(rawContent)
    ? parseArtifact(rawContent)
    : null;

  return (
    <div
      className={`animate-in slide-in-from-bottom-2 duration-300 ${isLast ? "animate-in" : ""}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-medium text-gray-900">NativeX</span>
            {!isLoading && message && (
              <span className="text-xs text-gray-400">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          <div className="bg-amber-50/50 rounded-xl rounded-tl-none p-4 border border-amber-100 shadow-sm">
            {isLoading ? (
              <div className="flex items-center gap-3 py-1">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm text-gray-500 font-medium animate-pulse">
                  Thinking...
                </span>
              </div>
            ) : (
              <>
                {parsedArtifact ? (
                  <ArtifactAccordion artifact={parsedArtifact} />
                ) : (
                  <div className="text-sm text-gray-800 leading-relaxed markdown-content">
                    <ReactMarkdown
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        pre({ children }) {
                          return <>{children}</>;
                        },
                        code({
                          node,
                          inline,
                          className,
                          children,
                          ...props
                        }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline ? (
                            <div className="my-5 rounded-xl overflow-hidden border border-amber-200/50 shadow-sm bg-white">
                              <div className="bg-gray-50 px-4 py-2.5 text-xs flex items-center justify-between border-b border-gray-100">
                                <span className="font-medium text-gray-600">
                                  {match ? match[1] : "code"}
                                </span>
                                <CopyButton content={String(children)} />
                              </div>
                              <div className="bg-[#0d1117] p-4 overflow-x-auto">
                                <code
                                  className={`${className || ""} text-sm font-mono text-gray-200 leading-relaxed`}
                                  {...props}
                                >
                                  {children}
                                </code>
                              </div>
                            </div>
                          ) : (
                            <code
                              className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md text-xs font-mono border border-amber-200"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                        p({ children }) {
                          return <p className="mb-4 last:mb-0">{children}</p>;
                        },
                        ul({ children }) {
                          return (
                            <ul className="list-disc pl-4 mb-4 space-y-1">
                              {children}
                            </ul>
                          );
                        },
                        ol({ children }) {
                          return (
                            <ol className="list-decimal pl-4 mb-4 space-y-1">
                              {children}
                            </ol>
                          );
                        },
                        blockquote({ children }) {
                          return (
                            <blockquote className="border-l-4 border-amber-500 pl-4 italic my-4 text-gray-700 bg-amber-100/50 py-2 rounded-r">
                              {children}
                            </blockquote>
                          );
                        },
                      }}
                    >
                      {processedContent}
                    </ReactMarkdown>
                  </div>
                )}

                {!isLoading && (
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-amber-100">
                    <CopyButton
                      content={rawContent}
                      className="text-gray-500 hover:text-gray-900 hover:bg-amber-100"
                    />
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
