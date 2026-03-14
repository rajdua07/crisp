"use client";

import { useAppStore } from "@/lib/store";

function getActiveLabel(value: number): string {
  if (value <= 0.15) return "Casual";
  if (value <= 0.35) return "Relaxed";
  if (value <= 0.65) return "Balanced";
  if (value <= 0.85) return "Professional";
  return "Formal";
}

export function ToneSlider({ compact = false }: { compact?: boolean }) {
  const { toneFormality, setToneFormality } = useAppStore();

  return (
    <div className={compact ? "w-full" : "w-full max-w-xs"}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-dark-500 font-medium">
          Tone
        </span>
        <span className="text-xs text-dark-300 font-medium">
          {getActiveLabel(toneFormality)}
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={toneFormality}
          onChange={(e) => setToneFormality(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-dark-800 rounded-full appearance-none cursor-pointer accent-crisp-500
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-crisp-500
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-crisp-500/30
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-dark-950
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:hover:scale-110
          "
        />

        {/* Track fill */}
        <div
          className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-crisp-600 to-crisp-500 rounded-full pointer-events-none -translate-y-1/2"
          style={{ width: `${toneFormality * 100}%` }}
        />
      </div>

      {!compact && (
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-dark-600">Casual</span>
          <span className="text-[10px] text-dark-600">Formal</span>
        </div>
      )}
    </div>
  );
}
