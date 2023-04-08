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

/**
 * Controls the styling of the dragarea to make communicate that
 * a dragevent is underway.
 * 
 * @param e 
 */
  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dropAreaRef.current!.style.border = "3px dotted green";
  }

  /**
   * Resets the dragover styling applied
   * 
   * @param e 
   */
  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dropAreaRef.current!.style.border = "";
  }
    
  /**
   * Parses the received file and loads the presets.
   * 
   * @param file 
   */
  function parsePresets(file: File) {
    if (file.name.includes(".dnd")) {
      const reader = new FileReader();
      reader.onload = () => {
        const presets = JSON.parse(atob(reader.result as string)) as Presets;
        loadPresets(presets);
      };
      reader.readAsText(file);
    } else {
      alert("Wrong file type. Choose a .dnd file");
    }
  }

  /**
   * Handles the drop event to fetch the file to be parsed.
   * 
   * @param e 
   */
  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    parsePresets(file);
    setDragFile(false);
  }
  
  /**
   * Extracts the file selected using the HTMLInputElement
   * and sends it to be parsed.
   * 
   * @param e 
   */
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
