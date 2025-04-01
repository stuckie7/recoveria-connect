
import React from 'react';

type FactorsDisplayProps = {
  factors: string[];
};

export const FactorsDisplay: React.FC<FactorsDisplayProps> = ({ factors }) => {
  if (factors.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-3">
      <p className="text-sm font-medium mb-1">Contributing Factors:</p>
      <ul className="text-sm text-muted-foreground">
        {factors.map((factor, index) => (
          <li key={index} className="flex items-center">
            <span className="mr-2">•</span>
            {factor}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FactorsDisplay;
