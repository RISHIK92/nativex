"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { AnimatedLogo } from "./AnimatedLogo";

export default function Appbar({
  onViewProjects,
}: {
  onViewProjects?: () => void;
}) {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  if (!isSignedIn) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 grid grid-cols-3 items-center">
        {/* Left Section */}
        <div className="flex justify-start">
          {onViewProjects && (
            <Button
              variant="ghost"
              onClick={onViewProjects}
              className="text-gray-500 hover:text-gray-900 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              View Projects
            </Button>
          )}
        </div>

        {/* Center Section - Logo */}
        <div className="flex justify-center">
          <button
            onClick={() => router.push("/")}
            className="hover:opacity-80 transition-opacity"
          >
            <AnimatedLogo size="small" />
          </button>
        </div>

        {/* Right Section - User Profile */}
        <div className="flex justify-end">
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "w-8 h-8 ring-2 ring-gray-100 transition-all hover:ring-gray-200",
                userButtonPopoverCard:
                  "bg-white border-gray-200 shadow-xl rounded-xl",
                userButtonPopoverActionButton:
                  "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              },
            }}
          />
        </div>
      </div>
    </nav>
  );
}
