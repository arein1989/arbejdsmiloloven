import { Hand } from "lucide-react";
import bfaByggeAsset from "@/assets/bfa-byg.png.asset.json";

type BfaLogoProps = {
  name:
    | "Velfærd og Offentlig administration"
    | "Bygge & anlæg"
    | "Handel, Finans og Kontor"
    | "Transport, service og Turisme, samt jord til bord"
    | "BFA Portalen";
  className?: string;
};

export function BfaLogo({ name, className = "" }: BfaLogoProps) {
  if (name === "Velfærd og Offentlig administration") {
    return (
      <div
        className={`flex items-center justify-center rounded-xl ${className}`}
        style={{ backgroundColor: "#3B9B9B" }}
      >
        <span className="text-2xl font-extrabold tracking-tight text-white">BFA</span>
      </div>
    );
  }

  if (name === "Bygge & anlæg") {
    return (
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl ${className}`}
        style={{ backgroundColor: "#1E3A8A" }}
      >
        <span className="text-xl font-extrabold tracking-tight text-white">BFA</span>
        <Wrench className="mt-0.5 h-4 w-4 text-white" strokeWidth={2.5} />
      </div>
    );
  }

  if (name === "Handel, Finans og Kontor") {
    return (
      <div
        className={`flex items-center justify-center rounded-full ${className}`}
        style={{ backgroundColor: "#6B7280" }}
      >
        <Hand className="h-8 w-8 text-white" strokeWidth={2} />
      </div>
    );
  }

  // Transport and Portal share the black BFA text logo
  const showTriangle = name === "Transport, service og Turisme, samt jord til bord";

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 80 40" className="h-full w-full">
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontSize="28"
          fontWeight="900"
          fill="#000000"
        >
          BFA
        </text>
        {showTriangle && (
          <polygon
            points="58,22 64,30 52,30"
            fill="#000000"
          />
        )}
      </svg>
    </div>
  );
}
