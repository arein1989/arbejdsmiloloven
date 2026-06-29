import bfaByggeAsset from "@/assets/bfa-byg.png.asset.json";
import bfaHfkAsset from "@/assets/bfa-hfk.png.asset.json";
import bfaTransportAsset from "@/assets/bfa-transport.png.asset.json";

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
      <div className={`flex items-center justify-center ${className}`}>
        <img
          src={bfaByggeAsset.url}
          alt="BFA Bygge & anlæg"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  if (name === "Handel, Finans og Kontor") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img
          src={bfaHfkAsset.url}
          alt="BFA Handel, Finans og Kontor"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  if (name === "Transport, service og Turisme, samt jord til bord") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img
          src={bfaTransportAsset.url}
          alt="BFA Transport, service og Turisme, samt jord til bord"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  // BFA Portalen fallback logo
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
      </svg>
    </div>
  );
}
