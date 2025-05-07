import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { createAvatar } from '@dicebear/core';
import * as style from '@dicebear/avataaars'; // Correct way to import the style object
import './AvatarCreator.css'; // We'll create this CSS file
import { type AvatarConfig } from '../App'; // Import config type

// Helper to get option values from schema
const getOptions = (key: string): string[] => {
  const prop = (style.schema.properties as any)?.[key];
  // Check for enum directly on the property (for colors) or in items (for arrays)
  if (prop && Array.isArray(prop.enum)) {
      return prop.enum;
  }
  if (prop && prop.items && Array.isArray(prop.items.enum)) {
      // For skinColor, the enum might be hex codes. For others, they are names.
      return prop.items.enum;
  }
  return [];
};

// Get available options for the dropdowns
const topOptions = getOptions('top');
const accessoriesTypesFromSchema = getOptions('accessories');
console.log('Schema Accessories Types:', accessoriesTypesFromSchema);
const accessoriesOptions = ['Blank', ...accessoriesTypesFromSchema.filter(opt => opt !== 'Blank')];
const facialHairTypesFromSchema = getOptions('facialHair');
console.log('Schema Facial Hair Types:', facialHairTypesFromSchema);
// Manually add 'Blank' if not present, as it's often used for none
const facialHairOptions = ['Blank', ...facialHairTypesFromSchema.filter(opt => opt !== 'Blank')];
const clotheTypeOptions = getOptions('clothing'); // Changed from clotheType, to match Dicebear schema
const graphicTypeOptions = getOptions('clothingGraphic'); // Changed from graphicType
const eyesOptions = getOptions('eyes');
const eyebrowsOptions = getOptions('eyebrows');
const mouthOptions = getOptions('mouth');

// Hair Color Logic
const schemaHairColors = getOptions('hairColor');
console.log('Schema Hair Colors:', schemaHairColors);
const hairColorNameMap: Record<string, string> = {
  'Auburn': 'A55728',
  'Black': '2C1B18',
  'Blonde': 'B58143',
  'BlondeGolden': 'D6B370',
  'Brown': '724133',
  'BrownDark': '4A312C',
  'PastelPink': 'F59797',
  'Platinum': 'ECDCBF',
  'Red': 'C93305',
  'SilverGray': '929598'
};
const hairColorDisplayOptions = Object.keys(hairColorNameMap);
const hairColorOptions = hairColorDisplayOptions; // For the dropdown

// Facial Hair Color Logic
const schemaFacialHairColors = getOptions('facialHairColor');
console.log('Schema Facial Hair Colors:', schemaFacialHairColors);
const facialHairColorNameMap = hairColorNameMap; // Reuse hair colors for now
const facialHairColorDisplayOptions = Object.keys(facialHairColorNameMap);
const facialHairColorOptions = facialHairColorDisplayOptions; // For the dropdown

// Attempt to get skinColor from schema, then fallback to a manual list of HEX codes if schema is empty or not what we expect for dropdown names
const schemaSkinColors = getOptions('skinColor');
console.log('Schema Skin Colors:', schemaSkinColors); // Log what the schema provides

// Define a mapping from user-friendly names to hex codes for skin colors
const skinColorNameMap: Record<string, string> = {
  'Light': 'FFDBAC',
  'Pale': 'F8D7C0',
  'Tanned': 'E0AC69',
  'Yellow': 'FCE38A',
  'Brown': 'D08B5B',
  'DarkBrown': 'A0522D',
  'Black': '704214' // Example, adjust as needed
};
const skinColorDisplayOptions = Object.keys(skinColorNameMap);

// Define a mapping for clothesColor names to hex codes
const clothesColorNameMap: Record<string, string> = {
  'Black': '262E33',
  'Blue01': '65C9FF', 
  'Blue02': '5096C1',
  'Blue03': '25557C',
  'Gray01': 'E6E6E6',
  'Gray02': '929598',
  'Heather': '3C4F5C',
  'PastelBlue': 'B1E2FF',
  'PastelGreen': 'A7FFC4',
  'PastelOrange': 'FFDEB5',
  'PastelRed': 'FFAFB9',
  'PastelYellow': 'FFFFB1',
  'Pink': 'FF488E',
  'Red': 'FF5A5A',
  'White': 'FFFFFF'
};
const clothesColorDisplayOptions = Object.keys(clothesColorNameMap);

// Accessories Color Logic (reusing clothes map for now)
const schemaAccessoriesColor = getOptions('accessoriesColor');
console.log('Schema Accessories Colors:', schemaAccessoriesColor);
const accessoriesColorNameMap = clothesColorNameMap; // Reuse clothes colors
const accessoriesColorDisplayOptions = Object.keys(accessoriesColorNameMap);
const accessoriesColorOptions = accessoriesColorDisplayOptions;

// Use clothesColor schema for consistency, if available, otherwise fallback to manual
const schemaClothesColors = getOptions('clothesColor');
console.log('Schema Clothes Colors:', schemaClothesColors); // Log what the schema provides for clothesColor
const clothesColorOptions = clothesColorDisplayOptions;

// Log options on mount for debugging
console.log('Top Options:', topOptions);
console.log('Clothe Type Options:', clotheTypeOptions);
console.log('Accessories Options:', accessoriesOptions);
console.log('Hair Color Options:', hairColorOptions);
// Add more logs as needed

interface AvatarCreatorProps {
  initialOptions: AvatarConfig; // Changed prop name
  initialName: string; 
  onSave: (options: AvatarConfig, name: string) => void; // Changed signature
  onBack: () => void;
}

const AvatarCreator: React.FC<AvatarCreatorProps> = ({ 
  initialOptions, 
  initialName, 
  onSave, 
  onBack 
}) => {
  const [name, setName] = useState(initialName || 'Racer 1'); 
  // Initialize state for each option from initialOptions or defaults
  const [seed, setSeed] = useState(initialOptions.seed || 'default-seed');
  const [topType, setTopType] = useState<string>(initialOptions.top?.[0] || topOptions[0] || 'ShortHairShortFlat'); // Corrected case
  
  // Hair Color State
  const findHairColorName = (hexOrName?: string): string | undefined => {
    if (!hexOrName) return undefined;
    const entry = Object.entries(hairColorNameMap).find(([_, hex]) => hex === hexOrName.replace('#', ''));
    if (entry) return entry[0];
    if (hairColorDisplayOptions.includes(hexOrName)) return hexOrName;
    return undefined;
  };
  const initialHairColorName = findHairColorName(initialOptions.hairColor?.[0]) || hairColorDisplayOptions[1] || 'Black'; // Default to Black
  const [hairColorName, setHairColorName] = useState<string>(initialHairColorName);
  
  // Facial Hair Color State
  const findFacialHairColorName = (hexOrName?: string): string | undefined => {
    if (!hexOrName) return undefined;
    const entry = Object.entries(facialHairColorNameMap).find(([_, hex]) => hex === hexOrName.replace('#', ''));
    if (entry) return entry[0];
    if (facialHairColorDisplayOptions.includes(hexOrName)) return hexOrName;
    return undefined;
  };
  // Default facial hair color to current hair color name if not specified
  const initialFacialHairColorName = findFacialHairColorName(initialOptions.facialHairColor?.[0]) || initialHairColorName; 
  const [facialHairColorName, setFacialHairColorName] = useState<string>(initialFacialHairColorName);

  const [accessoriesType, setAccessoriesType] = useState<string>(initialOptions.accessories?.[0] || 'Blank'); // Default accessories to Blank
  // Accessories Color State
  const findAccessoriesColorName = (hexOrName?: string): string | undefined => {
    if (!hexOrName) return undefined;
    const entry = Object.entries(accessoriesColorNameMap).find(([_, hex]) => hex === hexOrName.replace('#', ''));
    if (entry) return entry[0];
    if (accessoriesColorDisplayOptions.includes(hexOrName)) return hexOrName;
    return undefined;
  };
  // Default accessories color, maybe Black or Grey?
  const initialAccessoriesColorName = findAccessoriesColorName(initialOptions.accessoriesColor?.[0]) || 'Black'; 
  const [accessoriesColorName, setAccessoriesColorName] = useState<string>(initialAccessoriesColorName);

  const [facialHairType, setFacialHairType] = useState<string>(initialOptions.facialHair?.[0] || 'Blank'); // Default explicitly to Blank
  const [clotheType, setClotheType] = useState<string>(initialOptions.clotheType?.[0] || clotheTypeOptions[0] || 'BlazerShirt');
  const [graphicType, setGraphicType] = useState<string>(initialOptions.graphicType?.[0] || graphicTypeOptions[0] || 'Pizza'); // Corrected case
  const [eyesType, setEyesType] = useState<string>(initialOptions.eyes?.[0] || eyesOptions[0] || 'Default'); // Corrected case
  const [eyebrowsType, setEyebrowsType] = useState<string>(initialOptions.eyebrows?.[0] || eyebrowsOptions[0] || 'Default'); // Corrected case
  const [mouthType, setMouthType] = useState<string>(initialOptions.mouth?.[0] || mouthOptions[0] || 'Default'); // Corrected case
  
  const findClothesColorName = (hexOrName?: string): string | undefined => {
    if (!hexOrName) return undefined;
    const entry = Object.entries(clothesColorNameMap).find(([_, hex]) => hex === hexOrName.replace('#', ''));
    if (entry) return entry[0];
    if (clothesColorDisplayOptions.includes(hexOrName)) return hexOrName;
    return undefined;
  };
  const initialClothesColorName = findClothesColorName(initialOptions.clothesColor?.[0]) || clothesColorDisplayOptions[0] || 'Black';
  const [clothesColorName, setClothesColorName] = useState<string>(initialClothesColorName);

  // Initialize skinColor state with a display name, default to 'Light'
  // Check if initialOptions.skinColor is a hex code and find its name, or use the name directly if it's already a name
  const findSkinColorName = (hexOrName?: string): string | undefined => {
    if (!hexOrName) return undefined;
    const entry = Object.entries(skinColorNameMap).find(([_, hex]) => hex === hexOrName.replace('#', ''));
    if (entry) return entry[0]; // Found by hex
    if (skinColorDisplayOptions.includes(hexOrName)) return hexOrName; // It was already a name
    return undefined;
  };
  const initialSkinColorName = findSkinColorName(initialOptions.skinColor?.[0]) || skinColorDisplayOptions[0] || 'Light';
  const [skinColorName, setSkinColorName] = useState<string>(initialSkinColorName);

  // Ensure facialHairColorName updates if hairColorName changes and they were the same
  useEffect(() => {
    if (facialHairColorName === findFacialHairColorName(initialOptions.facialHairColor?.[0]) || facialHairColorName === initialHairColorName && initialOptions.facialHairColor?.[0] === undefined) {
        if (initialOptions.facialHairColor?.[0] === undefined) { 
            setFacialHairColorName(hairColorName);
        }
    }
  }, [hairColorName, initialOptions.facialHairColor, initialHairColorName, facialHairColorName]);

  const avatarSvg = useMemo(() => {
    console.log("--- Recalculating avatarSvg ---");

    // --- Calculate options directly here --- 
    const selectedFacialHairColorHex = facialHairColorNameMap[facialHairColorName] || hairColorNameMap[hairColorName] || '2C1B18';
    const selectedAccessoriesColorHex = accessoriesColorNameMap[accessoriesColorName] || '262E33';
    
    const dynamicOptions: Record<string, any> = {
        seed: seed,
        size: 200, 
        top: [topType],
        clothing: [clotheType],
        clothingGraphic: [graphicType],
        eyes: [eyesType],
        eyebrows: [eyebrowsType],
        mouth: [mouthType],
        hairColor: [hairColorNameMap[hairColorName] || '2C1B18'], 
        clothesColor: [clothesColorNameMap[clothesColorName] || '262E33'], 
        skinColor: [skinColorNameMap[skinColorName] || 'FFDBAC'], 
    };

    if (facialHairType !== 'Blank') {
        console.log("Adding facialHair options to dynamicOptions...");
        dynamicOptions.facialHair = [facialHairType];
        dynamicOptions.facialHairColor = [selectedFacialHairColorHex];
    }

    if (accessoriesType !== 'Blank') {
        console.log("Adding accessories options to dynamicOptions...");
        dynamicOptions.accessories = [accessoriesType];
        dynamicOptions.accessoriesColor = [selectedAccessoriesColorHex];
    }
    // --- End calculating options --- 

    console.log("Using dynamicOptions:", dynamicOptions);
    const svgString = createAvatar(style, dynamicOptions as any).toString(); // Keep 'as any' for now
    console.log("Generated SVG String (Full):", svgString);
    return svgString;

  }, [
    seed, topType, accessoriesType, accessoriesColorName, 
    facialHairType, clotheType, graphicType, 
    eyesType, eyebrowsType, mouthType, hairColorName, facialHairColorName, clothesColorName, skinColorName
  ]);

  const handleRandomize = () => {
    setSeed(Math.random().toString(36).substring(7));
    setTopType(topOptions[Math.floor(Math.random() * topOptions.length)] || 'ShortHairShortFlat');
    const randomHairColor = hairColorDisplayOptions[Math.floor(Math.random() * hairColorDisplayOptions.length)];
    setHairColorName(randomHairColor);
    setFacialHairColorName(randomHairColor); 
    setAccessoriesType(accessoriesOptions[Math.floor(Math.random() * accessoriesOptions.length)]);
    setAccessoriesColorName(accessoriesColorDisplayOptions[Math.floor(Math.random() * accessoriesColorDisplayOptions.length)]); 
    setFacialHairType(facialHairOptions[Math.floor(Math.random() * facialHairOptions.length)]);
    setClotheType(clotheTypeOptions[Math.floor(Math.random() * clotheTypeOptions.length)] || 'BlazerShirt');
    setGraphicType(graphicTypeOptions[Math.floor(Math.random() * graphicTypeOptions.length)] || 'Pizza');
    setEyesType(eyesOptions[Math.floor(Math.random() * eyesOptions.length)] || 'Default');
    setEyebrowsType(eyebrowsOptions[Math.floor(Math.random() * eyebrowsOptions.length)] || 'Default');
    setMouthType(mouthOptions[Math.floor(Math.random() * mouthOptions.length)] || 'Default');
    setClothesColorName(clothesColorDisplayOptions[Math.floor(Math.random() * clothesColorDisplayOptions.length)]);
    setSkinColorName(skinColorDisplayOptions[Math.floor(Math.random() * skinColorDisplayOptions.length)]);
  };

  const handleSave = () => {
    // Recalculate the final options here as well for saving
    const selectedFacialHairColorHex = facialHairColorNameMap[facialHairColorName] || hairColorNameMap[hairColorName] || '2C1B18';
    const selectedAccessoriesColorHex = accessoriesColorNameMap[accessoriesColorName] || '262E33';
    
    const optionsToSave: AvatarConfig = {
        seed: seed,
        size: initialOptions.size || 128, 
        top: [topType],
        clotheType: [clotheType],
        graphicType: [graphicType],
        eyes: [eyesType],
        eyebrows: [eyebrowsType],
        mouth: [mouthType],
        hairColor: [hairColorNameMap[hairColorName] || '2C1B18'], 
        clothesColor: [clothesColorNameMap[clothesColorName] || '262E33'], 
        skinColor: [skinColorNameMap[skinColorName] || 'FFDBAC'], 
    };

    if (facialHairType !== 'Blank') {
        optionsToSave.facialHair = [facialHairType];
        optionsToSave.facialHairColor = [selectedFacialHairColorHex];
    }
    if (accessoriesType !== 'Blank') {
        optionsToSave.accessories = [accessoriesType];
        optionsToSave.accessoriesColor = [selectedAccessoriesColorHex];
    }

    onSave(optionsToSave, name);
  };

  // Helper to create dropdowns
  const renderSelect = (label: string, value: string, setter: (val: string) => void, options: string[]) => (
    <div className="avatar-option-control">
      <label>{label}:</label>
      <select value={value} onChange={(e) => setter(e.target.value)} className="avatar-select">
        {options && options.length > 0 ? (
          options.map(opt => <option key={opt} value={opt}>{opt}</option>)
        ) : (
          <option value="">Loading...</option> 
        )}
      </select>
    </div>
  );

  return (
    <div className="avatar-creator-container">
      {/* Use same header structure as Garage */}
      <div className="garage-header"> 
        <h1 className="garage-title">Create Avatar</h1>
        <p className="garage-info">Customize your look or hit randomize!</p>
      </div>

      {/* Back Button */} 
      <button onClick={onBack} className="garage-button back-button">
        &lt; Back
      </button>

      {/* Main Content Area */}
      <div className="avatar-creator-content">
        {/* Avatar Preview */}
        <div className="avatar-preview-area">
          <div 
            className="avatar-preview"
            dangerouslySetInnerHTML={{ __html: avatarSvg }} 
          />
          <button onClick={handleRandomize} className="garage-button randomize-button">Randomize</button>
        </div>

        {/* Controls */}
        <div className="avatar-options-panel">
          {/* Name Input */}
          <div className="avatar-option-control name-control">
            <label htmlFor="name-input">Name:</label>
            <input 
              id="name-input"
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="seed-input"
              maxLength={20}
            />
          </div>
          {/* Seed Input - Can be hidden or kept */}
          {/* <div className="avatar-option-control seed-control">
            <label htmlFor="seed-input">Seed:</label>
            <input 
              id="seed-input"
              type="text" 
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              className="seed-input"
            />
          </div> */}
          
          {/* Detailed Option Selects */}
          {renderSelect('Top', topType, setTopType, topOptions)}
          {renderSelect('Hair Color', hairColorName, setHairColorName, hairColorOptions)}
          {renderSelect('Facial Hair', facialHairType, setFacialHairType, facialHairOptions)}
          {renderSelect('Facial Hair Color', facialHairColorName, setFacialHairColorName, facialHairColorOptions)}
          {renderSelect('Skin Color', skinColorName, setSkinColorName, skinColorDisplayOptions)}
          {renderSelect('Accessories', accessoriesType, setAccessoriesType, accessoriesOptions)}
          {renderSelect('Accessory Color', accessoriesColorName, setAccessoriesColorName, accessoriesColorOptions)}
          {renderSelect('Clothe Type', clotheType, setClotheType, clotheTypeOptions)}
          {renderSelect('Clothes Color', clothesColorName, setClothesColorName, clothesColorOptions)}
          {renderSelect('Graphic', graphicType, setGraphicType, graphicTypeOptions)}
          {renderSelect('Eyes', eyesType, setEyesType, eyesOptions)}
          {renderSelect('Eyebrows', eyebrowsType, setEyebrowsType, eyebrowsOptions)}
          {renderSelect('Mouth', mouthType, setMouthType, mouthOptions)}
        </div>
      </div>

      {/* Save Button */}
      <button onClick={handleSave} className="garage-button save-button">
        Save & Continue
      </button>

    </div>
  );
};

export default AvatarCreator; 