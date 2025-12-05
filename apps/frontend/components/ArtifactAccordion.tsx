"use client";

import React from "react";
import { ParsedArtifact } from "@/utils/artifactParser";
import { CopyButton } from "@/components/CopyButton";
import { FileCode, Terminal, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ArtifactAccordionProps {
  artifact: ParsedArtifact;
}

export function ArtifactAccordion({ artifact }: ArtifactAccordionProps) {
  const fileActions = artifact.actions.filter((a) => a.type === "file");
  const shellActions = artifact.actions.filter((a) => a.type === "shell");

  return (
    <div className="my-6 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="bg-gray-50/50 px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm tracking-tight">
          {artifact.title}
        </h3>
      </div>

      <div className="p-0">
        {fileActions.length > 0 && (
          <div className="border-b border-gray-100 last:border-0">
            <Accordion type="single" collapsible className="w-full">
              {fileActions.map((action, index) => (
                <AccordionItem
                  key={index}
                  value={`file-${index}`}
                  className="border-b border-gray-100 last:border-0"
                >
                  <AccordionTrigger className="px-5 py-3 hover:bg-gray-50/50 hover:no-underline transition-colors group">
                    <div className="flex items-center gap-3 text-left w-full overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <FileCode className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900 transition-colors">
                          {action.filePath}
                        </p>
                        <p className="text-xs text-gray-400">
                          {action.filePath.split(".").pop()?.toUpperCase() ||
                            "FILE"}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pb-0">
                    <div className="relative group">
                      <div className="absolute right-4 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CopyButton content={action.content} />
                      </div>
                      <div className="bg-[#0d1117] p-0 overflow-x-auto">
                        <div className="px-5 py-4 min-w-full inline-block">
                          <pre className="text-sm font-mono text-gray-300 leading-relaxed">
                            <code>{action.content}</code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {shellActions.length > 0 && (
          <div className="p-5 bg-gray-50/30">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Terminal className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Shell Commands
              </span>
            </div>

            <div className="space-y-3">
              {shellActions.map((action, index) => (
                <div
                  key={index}
                  className="group relative border border-gray-200 rounded-lg bg-[#0d1117] overflow-hidden shadow-sm"
                >
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <CopyButton content={action.command} />
                  </div>
                  <div className="px-4 py-3 font-mono text-sm flex items-start gap-3 overflow-x-auto">
                    <span className="text-green-500 flex-shrink-0 select-none">
                      $
                    </span>
                    <span className="text-gray-100">{action.command}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
