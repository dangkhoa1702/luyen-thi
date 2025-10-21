import React from "react";
export default function ProgressBar({ value, text }: { value: number; text?: string }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden" role="progressbar" aria-valuenow={Math.round(pct*100)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-3 rounded-full" style={{ width: `${pct*100}%`, background: "linear-gradient(90deg,#22c55e,#16a34a)" }} />
      </div>
      {text && <div className="text-xs mt-1 opacity-70 text-gray-600 dark:text-gray-400">{text}</div>}
    </div>
  );
}
