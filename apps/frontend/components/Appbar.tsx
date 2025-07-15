"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { AnimatedLogo } from "./AnimatedLogo";

export default function Appbar() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  if (!isSignedIn) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <AnimatedLogo size="small" />
          </Button>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 border border-gray-200 shadow-sm",
                  userButtonPopoverCard: "bg-white border-gray-200 shadow-lg",
                  userButtonPopoverActionButton:
                    "text-gray-700 hover:bg-gray-100",
                },
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
