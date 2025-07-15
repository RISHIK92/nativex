"use client";

import type React from "react";

import { useAuth } from "@clerk/nextjs";
import { SignIn } from "@clerk/nextjs";
import Prompt from "@/components/Prompt";
import Sidebar from "@/components/Sidebar";
import Appbar from "@/components/Appbar";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { FloatingElements } from "@/components/FloatingElement";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-amber-700 rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  // Show sign-in if user is not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 flex items-center justify-center relative overflow-hidden">
        <FloatingElements />

        <div className="text-center relative z-10">
          <div className="mb-8">
            <AnimatedLogo size="large" />
          </div>

          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200",
                card: "bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl",
                headerTitle: "text-gray-900",
                headerSubtitle: "text-gray-600",
                socialButtonsBlockButton:
                  "bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100",
                formFieldLabel: "text-gray-700",
                formFieldInput:
                  "bg-white border-gray-300 text-gray-900 focus:border-amber-600",
                footerActionLink: "text-amber-700 hover:text-amber-800",
              },
            }}
          />
        </div>
      </div>
    );
  }

  // Show main app for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 text-gray-900 relative overflow-hidden">
      <FloatingElements />

      <Appbar />
      <Sidebar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 pt-20">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-5xl">
          <div className="mb-8">
            <AnimatedLogo size="large" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-gray-900">
            Build Native Apps
            <br />
            <span className="bg-gradient-to-r from-gray-900 to-amber-700 bg-clip-text text-transparent">
              With AI Power
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 font-light max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into production-ready mobile applications using
            advanced AI technology
          </p>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2 group">
              <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse"></div>
              <span className="group-hover:text-gray-900 transition-colors">
                React Native
              </span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="w-2 h-2 bg-amber-700 rounded-full animate-pulse delay-300"></div>
              <span className="group-hover:text-gray-900 transition-colors">
                AI Generated
              </span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="w-2 h-2 bg-gray-700 rounded-full animate-pulse delay-700"></div>
              <span className="group-hover:text-gray-900 transition-colors">
                Production Ready
              </span>
            </div>
          </div>
        </div>

        {/* Prompt Section */}
        <div className="w-full max-w-4xl mb-20">
          <div className="relative">
            {/* Subtle glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-900/10 to-amber-700/10 rounded-3xl blur-xl"></div>

            <div className="relative bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl p-8 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2 text-gray-900">
                  What do you want to build?
                </h2>
                <p className="text-gray-600">
                  Describe your mobile app idea and watch it come to life
                </p>
              </div>

              <Prompt />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-full">
          <FeatureCard
            icon={<MobileIcon />}
            title="Cross Platform"
            description="Build once, deploy everywhere. iOS and Android from a single codebase"
          />
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
