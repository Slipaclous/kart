"use client";

interface CircuitMapSVGProps {
  type: "genk" | "portimao" | "sarno" | "wackersdorf";
  className?: string;
}

export default function CircuitMapSVG({ type, className = "" }: CircuitMapSVGProps) {
  // Tracés vectoriels stylisés de circuits de karting
  const circuits = {
    genk: "M 15 35 C 10 20, 25 10, 45 12 C 60 15, 65 28, 55 38 C 50 43, 40 40, 35 48 C 30 55, 38 68, 52 68 C 70 68, 85 52, 85 35 C 85 18, 70 8, 50 8 C 25 8, 8 22, 15 35 Z",
    portimao: "M 20 20 L 70 15 C 85 15, 88 35, 75 42 L 55 48 C 45 52, 48 65, 60 68 L 78 68 C 88 68, 88 82, 70 82 L 30 82 C 12 82, 10 65, 22 55 L 35 45 C 42 38, 38 28, 20 20 Z",
    sarno: "M 10 50 L 10 25 C 10 12, 25 10, 45 10 L 80 10 C 90 10, 92 25, 82 32 L 60 38 C 50 42, 50 55, 62 58 L 85 58 C 92 58, 92 75, 80 80 L 35 80 C 18 80, 10 68, 10 50 Z",
    wackersdorf: "M 25 20 C 35 8, 65 8, 75 22 C 82 32, 75 45, 62 48 C 50 50, 45 58, 52 65 C 60 72, 75 70, 78 80 C 80 88, 65 90, 48 90 C 25 90, 15 72, 18 55 C 20 42, 12 30, 25 20 Z",
  };

  const pathD = circuits[type] || circuits.sarno;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full stroke-neutral-700 hover:stroke-[#e10600] transition-colors duration-500"
      >
        {/* Track outline */}
        <path
          d={pathD}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-35"
        />
        {/* Active racing line with dash animation */}
        <path
          d={pathD}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-[#e10600] [stroke-dasharray:12_24] animate-[dash_12s_linear_infinite]"
        />
      </svg>
    </div>
  );
}
