"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Terminal,
  Cpu,
  Zap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface LoadingOverlayProps {
  status: string;
}

export function LoadingOverlay({ status }: LoadingOverlayProps) {
  const [logs, setLogs] = useState<string[]>([]);

  if (status === "READY") return null;

  useEffect(() => {
    // Simulate terminal logs based on status
    let interval: NodeJS.Timeout;
    const addLog = (log: string) => {
      setLogs((prev) => [...prev.slice(-4), log]);
    };

    if (status === "BOOTING") {
      addLog("> Initializing sandbox environment...");
      interval = setInterval(() => {
        const msgs = [
          "> Spawning isolated container...",
          "> Allocating system resources...",
          "> Mounting workspace volumes...",
          "> Configuring network policies...",
          "> Starting development server...",
        ];
        addLog(msgs[Math.floor(Math.random() * msgs.length)]);
      }, 800);
    } else if (status === "GENERATING") {
      addLog("> AI Agent connected...");
      interval = setInterval(() => {
        const msgs = [
          "> Analyzing project requirements...",
          "> Synthesizing component architecture...",
          "> Writing application logic...",
          "> Optimizing build configuration...",
          "> Injecting dependencies...",
        ];
        addLog(msgs[Math.floor(Math.random() * msgs.length)]);
      }, 600);
    } else if (status === "COMPLETED") {
      addLog("> Build successful.");
      addLog("> Finalizing deployment...");
    } else if (status === "PENDING") {
      addLog("> Request queued...");
      interval = setInterval(() => {
        const msgs = [
          "> Waiting for available worker...",
          "> Checking system capacity...",
          "> Preparing build environment...",
        ];
        addLog(msgs[Math.floor(Math.random() * msgs.length)]);
      }, 1000);
    } else if (status === "ERROR") {
      addLog("> System capacity reached...");
      addLog("> Unable to allocate resources...");
    }

    return () => clearInterval(interval);
  }, [status]);

  return (
    <div className="absolute inset-0 bg-white flex flex-col items-center justify-center overflow-hidden z-50">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Central Orb/Core */}
      <div className="relative mb-12">
        <motion.div
          className="w-32 h-32 rounded-full bg-amber-500/10 blur-3xl absolute inset-0"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="relative w-24 h-24 bg-white rounded-2xl border border-gray-200 flex items-center justify-center shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent"></div>

          {status === "BOOTING" && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Cpu className="w-10 h-10 text-amber-600" />
            </motion.div>
          )}

          {status === "PENDING" && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-10 h-10 text-gray-400" />
            </motion.div>
          )}

          {status === "GENERATING" && (
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Zap className="w-10 h-10 text-amber-500" />
            </motion.div>
          )}

          {status === "COMPLETED" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </motion.div>
          )}

          {status === "ERROR" && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <AlertCircle className="w-10 h-10 text-red-600" />
            </motion.div>
          )}

          {/* Scanning Line */}
          <motion.div
            className="absolute top-0 left-0 w-full h-1 bg-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>

      {/* Status Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          {status === "BOOTING" && "System Initializing"}
          {status === "GENERATING" && "Generating Application"}
          {status === "COMPLETED" && "Setup Complete"}
          {status === "PENDING" && "Queued for Processing"}
          {status === "ERROR" && "Service Unavailable"}
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          {status === "ERROR"
            ? "Please try again later as our containers are full"
            : "Building your environment in real-time"}
        </p>
      </motion.div>

      {/* Terminal Output */}
      <div className="w-96 bg-white/80 backdrop-blur-md rounded-lg border border-gray-200 p-4 font-mono text-xs text-gray-800 shadow-xl overflow-hidden">
        <div className="flex items-center gap-2 mb-3 border-b border-gray-200 pb-2">
          <Terminal className="w-3 h-3 text-gray-400" />
          <span className="text-gray-500">build_log.txt</span>
        </div>
        <div className="space-y-1 h-24 flex flex-col justify-end">
          <AnimatePresence mode="popLayout">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="truncate"
              >
                <span className="opacity-50 mr-2 text-gray-400">
                  {new Date().toLocaleTimeString([], { hour12: false })}
                </span>
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="w-2 h-4 bg-green-500/50"
          />
        </div>
      </div>
    </div>
  );
}
