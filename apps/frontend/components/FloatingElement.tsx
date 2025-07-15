"use client";

export function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:100px_100px] animate-pulse"></div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-gray-900 rounded-full animate-ping"></div>
      <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-amber-700 rounded-full animate-ping delay-1000"></div>
      <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-gray-700 rounded-full animate-ping delay-2000"></div>

      {/* Gradient orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-gray-900/5 to-amber-700/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-amber-700/5 to-gray-900/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Code symbols floating */}
      <div className="absolute top-1/3 right-1/3 text-gray-900/10 text-6xl font-mono animate-bounce">
        {"<"}
      </div>
      <div className="absolute bottom-1/3 left-1/3 text-amber-700/10 text-6xl font-mono animate-bounce delay-500">
        {">"}
      </div>
      <div className="absolute top-2/3 right-1/2 text-gray-700/10 text-4xl font-mono animate-bounce delay-1000">
        {"{ }"}
      </div>
    </div>
  );
}
