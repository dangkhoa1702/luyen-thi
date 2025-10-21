import React from "react";
export default function Sparkline({ points }: { points: number[] }) {
  const w=220,h=60,p=6;
  const validPoints = points.filter(pt => isFinite(pt));
  if (validPoints.length < 2) {
    return <div style={{width: '100%', height: h}} className="flex items-center justify-center text-xs opacity-50 border border-gray-200 dark:border-gray-700 rounded-md">Not enough data</div>;
  }
  const xs=validPoints.map((_,i)=>p+i*((w-2*p)/Math.max(1,validPoints.length-1)));
  const ys=validPoints.map(v=>h-p-v*(h-2*p));
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={xs.map((x,i)=>`${x},${ys[i]}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
