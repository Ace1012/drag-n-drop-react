import { useState } from "react";
import { ColorPreset, ITier, ITile } from "../App";
import { FaDownload, FaSave } from "react-icons/fa";
import DropArea, { Presets } from "./dropArea";

interface IPresetsManagementProps {
  iTiers: ITier[];
  setITiers: React.Dispatch<React.SetStateAction<ITier[]>>;
  iTiles: ITile[];
  setITiles: React.Dispatch<React.SetStateAction<ITile[]>>;
}

const PresetsManagement = ({
  iTiers,
  iTiles,
  setITiers,
  setITiles,
}: IPresetsManagementProps) => {
  const [svgTitle, setSvgTitle] = useState("Click to save current tier list");
  const [revealDropArea, setRevealDropArea] = useState(false);

  function handleSVGTitle(e: React.MouseEvent<SVGElement, MouseEvent>) {
    if (e.type === "mouseenter") {
      setTimeout(() => {
        setSvgTitle("");
      }, 2000);
    } else if (e.type === "mouseleave") {
      setTimeout(() => {
        setSvgTitle("Click to save current tier list");
      }, 500);
    }
  }

  function compilePresets() {
    return iTiers.reduce((presets, tier) => {
      let storageValue = localStorage.getItem(tier.title);
      if (storageValue) {
        return { ...presets, [tier.title]: JSON.parse(storageValue) };
      } else {
        return presets;
      }
    }, {}) as ColorPreset;
  }

  function downloadList() {
    const colorPresets = compilePresets();
    const presets = {
      colors: { ...colorPresets },
      tiers: [...iTiers],
      tiles: [...iTiles],
    };
    const file = new File([btoa(JSON.stringify(presets))], "Tierlist.dnd", {
      type: "text/plain",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "TierList.dnd";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function loadPresets(presets: Presets) {
    console.log("Presets are", presets);
    setITiers(presets.tiers);
    setITiles(presets.tiles);
    localStorage.clear();
    localStorage.setItem("page-loaded", "true");
    const keys = Object.keys(presets.colors);
    keys.forEach((title) => {
      localStorage.setItem(title, JSON.stringify(presets.colors[title]));
    });
  }

  return (
    <div className="presets-management">
      <FaSave
        className="save-presets"
        title={svgTitle}
        onMouseEnter={(e) => handleSVGTitle(e)}
        onMouseLeave={(e) => handleSVGTitle(e)}
        onClick={() => downloadList()}
      />
      {revealDropArea && (
        <DropArea
          revealDropArea={revealDropArea}
          setRevealDropArea={setRevealDropArea}
          loadPresets={loadPresets}
          setDragFile={setRevealDropArea}
        />
      )}
      <FaDownload
        className="load-presets"
        title="Click to load presets"
        onMouseEnter={(e) => handleSVGTitle(e)}
        onMouseLeave={(e) => handleSVGTitle(e)}
        onClick={() => setRevealDropArea((prev) => !prev)}
      />
    </div>
  );
};

export default PresetsManagement;
