
import React from 'react';
import { cn } from "@/lib/utils";

interface BeltDisplayProps {
  belt: string;
  danStage?: string;
  className?: string;
}

const getBeltColorClass = (belt: string) => {
  switch(belt) {
    case "Amarela": return "belt-yellow";
    case "Vermelha": return "belt-red";
    case "Laranja": return "belt-orange";
    case "Verde": return "belt-green";
    case "Roxa": return "belt-purple";
    case "Marrom": return "belt-brown";
    case "Preta": return "belt-black";
    default: return "belt-white";
  }
};

const BeltDisplay: React.FC<BeltDisplayProps> = ({ belt, danStage, className }) => {
  const beltClass = getBeltColorClass(belt);
  const hasDan = (belt === "Preta" || belt === "Dans") && danStage;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div className={cn("w-full h-6 rounded-md transition-all duration-300", beltClass)}>
        {hasDan && (
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: Number(danStage) }).map((_, i) => (
              <div 
                key={i} 
                className="w-2 h-2 mx-1 bg-karate-white rounded-full border border-black/20"
              />
            ))}
          </div>
        )}
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-foreground/20 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-foreground/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeltDisplay;
