"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  content: string;
  className?: string;
}

export function CopyButton({ content, className }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-6 px-2 text-xs font-medium transition-all duration-200",
        isCopied
          ? "text-green-500 hover:text-green-600 bg-green-50"
          : "text-gray-400 hover:text-white hover:bg-white/10",
        className
      )}
      onClick={handleCopy}
    >
      {isCopied ? (
        <>
          <Check className="w-3 h-3 mr-1.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 mr-1.5" />
          Copy
        </>
      )}
    </Button>
  );
}
