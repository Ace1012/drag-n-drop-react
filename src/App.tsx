import React, {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaDownload, FaSave } from "react-icons/fa";
import DropArea, { Presets } from "./components/dropArea";
import Container, { FormSubmitValue } from "./components/tier";
import Tile from "./components/tile";
import { v4 as uuid } from "uuid";
import UseSnackbar from "./components/useSnackbar";
import { ntc } from "./NameThatColor/NameThatColor";

export interface ColorPreset {
  [key: string]: { backgroundColor: string };
}

export interface ITier {
  title: string;
  children: ITile[];
}

export interface ITile {
  id: string;
  name?: string;
  imageUrl?: string;
}

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const inputTierRef = useRef<HTMLInputElement>(null);
  const inputTileUrlRef = useRef<HTMLInputElement>(null);
  const inputTileNameRef = useRef<HTMLInputElement>(null);
  const tiersRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<HTMLDivElement>(null);
  const snackbarMessage = useRef("Drag tiles out of grey zone to remove");

  const [iTiers, setITiers] = useState<ITier[]>([
    { title: "default", children: [] },
  ]);
  const [iTiles, setITiles] = useState<ITile[]>([]);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isNameDisabled, setIsNameDisabled] = useState(false);
  const [isUrlDisabled, setIsUrlDisabled] = useState(false);
  const [svgTitle, setSvgTitle] = useState("Click to save current tier list");
  const [dragFile, setDragFile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  function handleTierInput() {
    const tierTitle = inputTierRef.current?.value;
    if (tierTitle === "") {
      alert("Cannot add empty tier");
    } else if (
      iTiers.some(
        (tier) => tier.title.toLowerCase() === tierTitle?.toLowerCase()
      )
    ) {
      alert("Tier already exists");
    } else {
      setITiers((prev) => [
        ...prev,
        { title: tierTitle, children: [] } as ITier,
      ]);
      inputTierRef.current!.value = "";
    }
  }

  function handleTileInput() {
    const tileImageUrl = inputTileUrlRef.current?.value;
    const tileName = inputTileNameRef.current?.value;
    if (tileImageUrl === "" && tileName === "") {
      alert("Fill in the name or paste a url");
      return;
    }
    if (
      iTiles.some(
        (tile) =>
          tile.name === tileName || tile.imageUrl === `url(${tileImageUrl})`
      ) ||
      iTiers.some((tier) =>
        tier.children.some(
          (tile) =>
            tile.name === tileName || tile.imageUrl === `url(${tileImageUrl})`
        )
      )
    ) {
      alert("Tile already exists");
      inputTileUrlRef.current!.value = "";
      inputTileNameRef.current!.value = "";
      setIsNameDisabled(false);
      setIsUrlDisabled(false);
      return;
    }

    let newTile: ITile = {
      id: "",
    };
    if (isNameDisabled) {
      newTile = {
        id: `tile${uuid()}`,
        imageUrl: `url(${tileImageUrl})`,
      };
    } else if (isUrlDisabled) {
      newTile = {
        id: `tile${uuid()}`,
        name: `${tileName}`,
      };
    }
    inputTileUrlRef.current!.value = "";
    inputTileNameRef.current!.value = "";
    setITiles((prevTiles) => [...prevTiles, newTile]);
    setIsNameDisabled(false);
    setIsUrlDisabled(false);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (
      e.currentTarget === inputTileNameRef.current &&
      !inputTileNameRef.current!.disabled &&
      !inputTileUrlRef.current!.disabled
    ) {
      setIsUrlDisabled(true);
    } else if (
      e.currentTarget === inputTileUrlRef.current &&
      !inputTileNameRef.current!.disabled &&
      !inputTileUrlRef.current!.disabled
    ) {
      setIsNameDisabled(true);
    }

    if (
      !inputTileNameRef.current!.disabled &&
      inputTileNameRef.current!.value.length === 0
    ) {
      setIsUrlDisabled(false);
    } else if (
      !inputTileUrlRef.current!.disabled &&
      inputTileUrlRef.current!.value.length === 0
    ) {
      setIsNameDisabled(false);
    }
  }

  function onInputEnterPressed(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && document.activeElement === inputTierRef.current) {
      handleTierInput();
    } else if (
      e.key === "Enter" &&
      (document.activeElement === inputTileNameRef.current ||
        document.activeElement === inputTileUrlRef.current)
    ) {
      handleTileInput();
    }
  }

  function triggerSnackbar(message: string) {
    snackbarMessage.current = message;
    setIsSnackbarOpen(true);
  }

  function clearTiers() {
    setITiers((prevTiers) => {
      setITiles((prevTiles) => {
        return [
          ...prevTiles,
          ...prevTiers.reduce(
            (children, prevTier) => {
              return [...children, ...prevTier.children];
            },
            [...prevTiles]
          ),
        ];
      });
      return [];
    });
  }

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

  // //Create classes for each color for placeholder - prototype feature test
  // const createPlaceholderColorClasses = useCallback((): any[] => {
  //   let names: any[] = ntc.names;
  //   type Cured = { id: string; name: string };
  //   let curatedNames: Cured[] = names.reduce((list, name) => {
  //     let colorId = name[0];
  //     let colorName = name[1].replace(/\s+/g, "");
  //     return [...list, { id: colorId, name: colorName }];
  //   }, []);
  //   let style = document.createElement("style");
  //   style.id = "input-placeholder-color-classes";
  //   curatedNames.forEach((name) => {
  //     style.textContent =
  //       style.textContent +
  //       `\r\n.customization-menu input.${
  //         name.name
  //       }::-webkit-input-placeholder { color: #${
  //         name.id === "323232" ? "white" : name.id
  //       };}`;
  //   });
  //   document.head.appendChild(style);
  //   return curatedNames;
  // }, [ntc]);

  // useEffect(() => {
  //   createPlaceholderColorClasses();
  // }, []);

  function pointerDown(e: React.PointerEvent<HTMLDivElement>) {
    appRef.current!.style.touchAction = "none";

    const dot = document.createElement("div");
    dot.id = `${e.pointerId}`;
    dot.classList.add("dot");
    dot.style.width = `${e.width + 10}px`;
    dot.style.height = `${e.width + 10}px`;
    dot.style.top = `${e.pageY}px`;
    dot.style.left = `${e.pageX}px`;
    document.body.append(dot);

    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function pointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const dot = document.getElementById(`${e.pointerId}`);
    if (!dot) return;
    dot.style.top = `${e.pageY}px`;
    dot.style.left = `${e.pageX}px`;
  }

  function pointerUp(e: React.PointerEvent<HTMLDivElement>) {
    appRef.current!.style.touchAction = "";
    const dot = document.getElementById(`${e.pointerId}`);
    if (!dot) return;
    dot.remove();
  }

  useEffect(() => {
    const mobileRegex = /iphone|android|ipad/i;
    if (mobileRegex.test(navigator.userAgent)) {
      setIsMobile(true);
      console.log("On mobile");
    }
  }, []);

  return (
    <div className="app" ref={appRef}>
      {/* {isSnackbarOpen && (
        <UseSnackbar
          message={snackbarMessage.current}
          setIsSnackbarOpen={setIsSnackbarOpen}
        />
      )} */}
      {isMobile && (
        <div className="mobile-warning-overlay">
          <div className="mobile-warning">
            <span>
              Currently working on mobile functionality. Please use a computer
              for now.
            </span>
            {/* <button className="warning-closebtn">&times;</button> */}
            <button
              className="warning-closebtn"
              onClick={() => setIsMobile(false)}
            >
              x
            </button>
          </div>
        </div>
      )}
      <div className="presets-management">
        <FaSave
          className="save-presets"
          title={svgTitle}
          onMouseEnter={(e) => handleSVGTitle(e)}
          onMouseLeave={(e) => handleSVGTitle(e)}
          onClick={() => downloadList()}
        />
        {dragFile && (
          <div className="download-wrapper">
            <dialog
              className="drop-area-overlay"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => e.preventDefault()}
              open={dragFile}
            >
              <span
                className="close-drag-area"
                onClick={() => setDragFile(false)}
              >
                &times;
              </span>
              <DropArea loadPresets={loadPresets} setDragFile={setDragFile} />
            </dialog>
          </div>
        )}
        <FaDownload
          className="load-presets"
          title="Click to load presets"
          onMouseEnter={(e) => handleSVGTitle(e)}
          onMouseLeave={(e) => handleSVGTitle(e)}
          onClick={() => setDragFile((prev) => !prev)}
        />
      </div>
      <div className="tier-section" ref={tiersRef}>
        <header>
          {/* <div className="add-tier"> */}
          <label>
            {/* <span>Create tier: </span> */}
            <input
              type="text"
              ref={inputTierRef}
              placeholder="Enter tier name"
              onKeyDown={(e) => onInputEnterPressed(e)}
            />
          </label>
          {/* </div> */}
          <div className="controls">
            <button onClick={() => handleTierInput()}>
              Click to add new tier
            </button>
            <button onClick={clearTiers}>Delete all tiers</button>
          </div>
        </header>
        {iTiers.length === 0 ? (
          <div className="no-tiers">No tiers</div>
        ) : (
          <ul className="tiers">
            {iTiers.map((iTier) => (
              <Container
                key={`container${uuid()}`}
                tier={iTier}
                tiersRef={tiersRef}
                tilesRef={tilesRef}
                setITiers={setITiers}
                setITiles={setITiles}
                triggerSnackbar={triggerSnackbar}
                children={iTier.children}
              />
            ))}
          </ul>
        )}
      </div>
      <div className="tile-section" ref={tilesRef}>
        <header>
          <label>
            <input
              type="text"
              ref={inputTileNameRef}
              disabled={isNameDisabled}
              placeholder="Enter tile name"
              onChange={(e) => onInputChange(e)}
              onKeyDown={(e) => onInputEnterPressed(e)}
            />
            <span>OR</span>
            <input
              type="text"
              ref={inputTileUrlRef}
              disabled={isUrlDisabled}
              placeholder="Paste image url here"
              onChange={(e) => onInputChange(e)}
              onKeyDown={(e) => onInputEnterPressed(e)}
            />
          </label>
          <div className="controls">
            <button onClick={() => handleTileInput()}>
              Click to add new tile
            </button>
            <button onClick={() => setITiles([])}>Delete all tiles</button>
          </div>
        </header>
        {iTiles.length === 0 ? (
          <div className="no-tiles">No tiles</div>
        ) : (
          <ul className="tiles">
            {iTiles.map((iTile) => (
              <Tile
                key={`${iTile.id}`}
                tile={iTile}
                tiersRef={tiersRef}
                tilesRef={tilesRef}
                setITiers={setITiers}
                setITiles={setITiles}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
