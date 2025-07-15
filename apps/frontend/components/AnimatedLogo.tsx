"use client";

import { useEffect, useState } from "react";

interface AnimatedLogoProps {
  size?: "small" | "large";
}

export function AnimatedLogo({ size = "small" }: AnimatedLogoProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const logoSize = size === "large" ? "w-20 h-20" : "w-10 h-10";
  const textSize = size === "large" ? "text-4xl" : "text-2xl";

  return (
    <div className="flex items-center gap-4">
      <div className={`${logoSize} relative`}>
        <svg
          viewBox="0 0 100 100"
          className={`w-full h-full transition-all duration-1000 ${isAnimating ? "rotate-180 scale-110" : ""}`}
        >
          {/* Outer ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="2"
            className={`transition-all duration-2000`}
            style={{
              strokeDasharray: "283",
              strokeDashoffset: isAnimating ? "283" : "0",
            }}
          />

          {/* Inner elements */}
          <g
            className={`transition-all duration-1000 ${isAnimating ? "scale-75" : "scale-100"}`}
          >
            {/* Mobile phone shape */}
            <rect
              x="35"
              y="25"
              width="30"
              height="50"
              rx="6"
              fill="none"
              stroke="url(#gradient2)"
              strokeWidth="2"
            />

            {/* Screen */}
            <rect
              x="39"
              y="32"
              width="22"
              height="36"
              rx="2"
              fill="url(#gradient3)"
              className={`transition-all duration-1000 ${isAnimating ? "opacity-100" : "opacity-70"}`}
            />

            {/* Code brackets */}
            <text
              x="50"
              y="55"
              textAnchor="middle"
              className="text-xs font-mono fill-white"
              style={{ fontSize: "8px" }}
            >
              {"</>"}
            </text>
          </g>

          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="100%" stopColor="#374151" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className={`${textSize} font-bold tracking-tight`}>
        <span className="text-gray-900">Native</span>
        <span className="text-amber-700">X</span>
      </div>
    </div>
  );
}
