"use client";

import React, { useState } from "react";

import { useAuth } from "@clerk/nextjs";
import { SignIn } from "@clerk/nextjs";
import Prompt from "@/components/Prompt";
import Sidebar from "@/components/Sidebar";
import Appbar from "@/components/Appbar";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { FloatingElements } from "@/components/FloatingElement";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Show sign-in if user is not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        <div className="text-center relative z-10">
          <div className="mb-8">
            <AnimatedLogo size="large" />
          </div>

          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200",
                card: "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-2xl",
                headerTitle: "text-gray-900",
                headerSubtitle: "text-gray-600",
                socialButtonsBlockButton:
                  "bg-white border-gray-200 text-gray-900 hover:bg-gray-50",
                formFieldLabel: "text-gray-700",
                formFieldInput:
                  "bg-white border-gray-300 text-gray-900 focus:border-gray-900",
                footerActionLink: "text-gray-900 hover:underline",
              },
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 relative selection:bg-gray-900 selection:text-white">
      <Appbar onViewProjects={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 relative z-10">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-amber-500 opacity-20 blur-[100px]"></div>

        {/* Hero Section */}
        <div className="text-center mb-12 max-w-3xl relative">
          <h1 className="text-5xl md:text-5xl font-bold mb-6 tracking-tight text-gray-900 leading-tight">
            What do you want to build?
          </h1>

          <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
            Prompt, run, edit, and deploy full-stack native apps.
          </p>
        </div>

        {/* Prompt Section */}
        <div className="w-full max-w-3xl relative">
          <Prompt />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-900/0 to-amber-700/0 group-hover:from-gray-900/20 group-hover:to-amber-700/20 rounded-xl blur transition-all duration-500"></div>
      <div className="relative bg-white/70 border border-gray-200 rounded-xl p-8 text-center hover:bg-white/90 transition-all duration-300 hover:shadow-lg">
        <div className="mb-6 flex justify-center">{icon}</div>
        <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function CodeIcon() {
  return (
    <svg
      className="w-12 h-12 text-gray-900"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg
      className="w-12 h-12 text-amber-700"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"
      />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg
      className="w-12 h-12 text-gray-700"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  );
}
