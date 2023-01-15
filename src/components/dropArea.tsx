import React, { useRef } from "react";
import { ITier, ITile } from "../App";
import { FormSubmitValue } from "./tier";

interface DropAreaProps {
  setDragFile: React.Dispatch<React.SetStateAction<boolean>>;
  loadPresets(presets: Presets): void;
}

export interface colorPreset {
   [key: string]: { backgroundColor: string } 
}

export interface Presets {
  colors: colorPreset;
  tiers: ITier[];
  tiles: ITile[];
}

const DropArea = ({ setDragFile, loadPresets }: DropAreaProps) => {
  const dropAreaRef = useRef<HTMLDivElement>(null);

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dropAreaRef.current!.style.border = "3px dotted green";
  }

  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dropAreaRef.current!.style.border = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file.name.includes(".dnd")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const presets = JSON.parse(reader.result as string) as Presets;
        console.log("File content", presets);
        loadPresets(presets);
        // console.log("Colors: ", presets.colors);
        // console.log("Tiers: ", presets.tiers);
        // console.log("Tiles: ", presets.tiles);
      };
      reader.readAsText(file);
    } else {
      alert("Wrong file type. Choose a .dnd file");
    }
    setDragFile(false);
  }

  return (
    <div
      className="drop-area"
      ref={dropAreaRef}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <span>Drop your file here to load the presets.</span>
    </div>
  );
};

export default DropArea;
