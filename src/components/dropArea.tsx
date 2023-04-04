import React, { useRef } from "react";
import { ITier, ITile, ColorPreset } from "../App";

interface DropAreaProps {
  setDragFile: React.Dispatch<React.SetStateAction<boolean>>;
  revealDropArea: boolean;
  setRevealDropArea: React.Dispatch<React.SetStateAction<boolean>>;
  loadPresets(presets: Presets): void;
}

export interface Presets {
  colors: ColorPreset;
  tiers: ITier[];
  tiles: ITile[];
}

const DropArea = ({
  revealDropArea,
  setRevealDropArea,
  setDragFile,
  loadPresets,
}: DropAreaProps) => {
  const dropAreaRef = useRef<HTMLDivElement>(null);

  function parsePresets(file: File) {
    if (file.name.includes(".dnd")) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const presets = JSON.parse(atob(reader.result as string)) as Presets;
        loadPresets(presets);
      };
      reader.readAsText(file);
    } else {
      alert("Wrong file type. Choose a .dnd file");
    }
  }

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
    parsePresets(file);
    setDragFile(false);
  }

  async function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files![0];
    parsePresets(file);
    setDragFile(false);
  }

  return (
    <dialog
      className="drop-area-overlay"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
      open={revealDropArea}
    >
      <span
        className="close-drag-area"
        onClick={() => setRevealDropArea(false)}
      >
        &times;
      </span>
      <div
        className="drop-area"
        ref={dropAreaRef}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <span>Drop your file here to load the presets.</span>

        <label>
          <input
            onChange={handleInput}
            type="file"
            id="file-input"
            name="file-input"
            accept=".dnd*"
          />
        </label>
      </div>
    </dialog>
  );
};

export default DropArea;
