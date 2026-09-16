import { useState } from "react";
import frontAsset from "@/assets/thomas-weyse.jpeg.asset.json";

export function FlipCard() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative aspect-[3/4] w-full max-w-[380px] shrink-0 cursor-pointer select-none self-stretch md:aspect-auto md:w-[340px] md:max-w-none"
      style={{ perspective: "1200px" }}
      onClick={() => setFlipped((f) => !f)}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      role="button"
      aria-pressed={flipped}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
    >
      <div
        className="relative h-full w-full transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front – photo as background */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            borderRadius: "20px",
            backfaceVisibility: "hidden",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.35)",
          }}
        >
          <img
            src={frontAsset.url}
            alt="Thomas Weyse"
            className="h-full w-full object-cover object-top"
            style={{ borderRadius: "20px" }}
          />
        </div>

        {/* Back – text */}
        <div
          className="absolute inset-0 flex flex-col justify-center p-6 text-white"
          style={{
            borderRadius: "20px",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(180deg, #00A86B 0%, #007A4F 100%)",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.35)",
          }}
        >
          <h3 className="font-display text-xl font-semibold">Thomas Weyse</h3>
          <p className="mt-3 text-sm leading-relaxed">
            Mere end 20 års erfaring – jeg kan løfte opgaver inden for både det
            formelle, fysiske og psykosociale arbejdsmiljø.
          </p>
          <p className="mt-4 text-sm leading-relaxed">
            Hos AdWeyse er professionel arbejdsmiljøkommunikation
            omdrejningspunktet – fra rådgivning og oplæg til sparring og
            APV-processer.
          </p>
        </div>
      </div>
    </div>
  );
}
