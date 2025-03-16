import React from "react";

interface ColorSwatchProps {
  color: string;
  hexCode: string;
  name: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, hexCode, name }) => (
  <div className="flex flex-col items-center my-4">
    <div 
      className={`w-48 h-16 rounded-full ${color} flex items-center justify-center shadow-md`}
    >
      <span className={`font-medium ${
        hexCode === '#021024' || hexCode === '#052659' 
          ? 'text-white' 
          : 'text-healthBlue-950'
      }`}>
        {hexCode}
      </span>
    </div>
    <span className="mt-2 text-sm text-healthBlue-900 dark:text-healthBlue-200">{name}</span>
  </div>
);

export const ColorPaletteShowcase: React.FC = () => {
  return (
    <div className="p-8 bg-white dark:bg-healthBlue-950 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6 text-healthBlue-950 dark:text-healthBlue-200">HealthMetrics Blue Palette</h2>
      <div className="flex flex-wrap justify-center gap-6">
        <ColorSwatch 
          color="bg-healthBlue-950" 
          hexCode="#021024" 
          name="Very Dark Navy Blue" 
        />
        <ColorSwatch 
          color="bg-healthBlue-900" 
          hexCode="#052659" 
          name="Deep Navy Blue" 
        />
        <ColorSwatch 
          color="bg-healthBlue-700" 
          hexCode="#5483B3" 
          name="Medium Blue" 
        />
        <ColorSwatch 
          color="bg-healthBlue-500" 
          hexCode="#7DA0CA" 
          name="Light Blue" 
        />
        <ColorSwatch 
          color="bg-healthBlue-200" 
          hexCode="#C1E8FF" 
          name="Very Light Blue" 
        />
      </div>
    </div>
  );
}; 