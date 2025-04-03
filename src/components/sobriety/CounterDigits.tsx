
import React from 'react';
import { cn } from "@/lib/utils";

interface CounterDigitsProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  padLength?: number;
  animateDigits: boolean;
}

const CounterDigits: React.FC<CounterDigitsProps> = ({
  value,
  label,
  icon,
  padLength = 2,
  animateDigits
}) => {
  // Format a digit with leading zero if needed
  const formatDigit = (value: number, padLength: number = 2) => {
    return value.toString().padStart(padLength, '0');
  };

  // Create digit elements for the counter
  const createDigits = (value: number, padLength: number = 2) => {
    const digits = formatDigit(value, padLength).split('');
    
    return (
      <div className="flex items-center justify-center">
        {digits.map((digit, index) => (
          <div 
            key={`digit-${index}`}
            className={cn(
              "relative w-14 h-20 mx-0.5 rounded-lg overflow-hidden",
              "bg-gradient-to-br from-recovery-blue-dark to-recovery-purple-dark",
              "shadow-lg border border-white/10 backdrop-blur-sm",
              animateDigits ? "animate-scale-in" : "opacity-0"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-white">
              {digit}
            </span>
            <span className="absolute inset-0 bg-white/5 flex items-center justify-center"></span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="text-center">
      <div className="text-md text-gray-600 mb-2 font-medium flex items-center justify-center">
        {icon}
        <span>{label}</span>
      </div>
      {createDigits(value, padLength)}
    </div>
  );
};

export default CounterDigits;
