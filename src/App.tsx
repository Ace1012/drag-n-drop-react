import React, {
  ChangeEvent,
  KeyboardEvent,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaDownload, FaSave } from "react-icons/fa";
import DropArea, { Presets } from "./components/dropArea";
import Container, { FormSubmitValue } from "./components/tier";
import Tile, { Offsets } from "./components/tile";
import { v4 as uuid } from "uuid";
import UseSnackbar from "./components/useSnackbar";
import { ntc } from "./NameThatColor/NameThatColor";
import {
  TierMobileDragEvents,
  TileMobileDragEvents,
} from "./contexts/drag-contexts";

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
export type IDragTile = {
  tier?: ITier;
} & ITile;

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const inputTierRef = useRef<HTMLInputElement>(null);
  const inputTileUrlRef = useRef<HTMLInputElement>(null);
  const inputTileNameRef = useRef<HTMLInputElement>(null);
  const tierSectionRef = useRef<HTMLDivElement>(null);
  const tileSectionRef = useRef<HTMLDivElement>(null);
  const tiersRef = useRef<HTMLUListElement>(null);
  const tilesRef = useRef<HTMLUListElement>(null);
  const snackbarMessage = useRef("Drag tiles out of grey zone to remove");

  const [iTiers, setITiers] = useState<ITier[]>([
    { title: "default", children: [] },
  ]);
  const [iTiles, setITiles] = useState<ITile[]>([
    // {
    //   id: "tiledkajdbjahkdnaklsdasadada",
    //   name: "A",
    // },
    // {
    //   id: "tilealsbdalkjdblkajdnalkdjns",
    //   name: "B",
    // },
  ]);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isNameDisabled, setIsNameDisabled] = useState(false);
  const [isUrlDisabled, setIsUrlDisabled] = useState(false);
  const [svgTitle, setSvgTitle] = useState("Click to save current tier list");
  const [revealDropArea, setRevealDropArea] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [revealMobileNav, setRevealMobileNav] = useState(false);
  const [dragTier, setDragTier] = useState<ITier | null>(null);
  const [dragTile, setDragTile] = useState<IDragTile | null>(null);

  function handleTierInput() {
    const tierTitle = inputTierRef.current?.value.toLowerCase();
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
    const tileName = inputTileNameRef.current?.value.toLowerCase();
    if (tileImageUrl === "" && tileName === "") {
      alert("Fill in the name or paste a url");
      return;
    }
    if (
      iTiles.some(
        (tile) =>
          tile.name?.toLowerCase() === tileName ||
          tile.imageUrl === `url(${tileImageUrl})`
      ) ||
      iTiers.some((tier) =>
        tier.children.some(
          (tile) =>
            tile.name?.toLowerCase() === tileName ||
            tile.imageUrl === `url(${tileImageUrl})`
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

  function positionShadow(e: React.PointerEvent) {
    const dragShadow = document.getElementById(`tile-shadow${e.pointerId}`);
    if (dragShadow === null) return;
    // dragShadow.style.top = `${e.pageY - pointerPosition.top}px`;
    // dragShadow.style.left = `${e.pageX - pointerPosition.left}px`;
    dragShadow.style.top = `${e.pageY - 50}px`;
    dragShadow.style.left = `${e.pageX + 10}px`;
  }

  function removeShadow(e: React.PointerEvent) {
    const dragShadow = document.getElementById(`tile-shadow${e.pointerId}`);
    dragShadow?.remove();
  }

  function isOutsideDropAreaMobile(clientX: number, clientY: number) {
    const pointerPositon = { y: clientY, x: clientX };
    const tierRect = tiersRef.current!.getBoundingClientRect();
    const isOutsideTiers =
      tierRect.top > pointerPositon.y ||
      tierRect.bottom < pointerPositon.y ||
      tierRect.left > pointerPositon.x ||
      tierRect.right < pointerPositon.x;
    const tilesRect = tilesRef.current!.getBoundingClientRect();
    const isOutsideTiles =
      tilesRect.top > pointerPositon.y ||
      tilesRect.bottom < pointerPositon.y ||
      tilesRect.left > pointerPositon.x ||
      tilesRect.right < pointerPositon.x;

    return { isOutsideTiers, isOutsideTiles };
  }

  function removeTileFromTier(tileId: string, parentTier: ITier) {
    const tempTile = parentTier.children.find((tile) => tile.id === tileId)!;
    setITiers((prevTiers) =>
      prevTiers.map((tier) => {
        tier.children = tier.children.filter((tile) => tile.id !== tileId);
        return tier;
      })
    );
    setITiles((prevTiles) => [...prevTiles, tempTile]);
  }

  function removeTileFromTiles(tileId: string) {
    setITiles((prev) => prev.filter((prevTile) => prevTile.id !== tileId));
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (dragTile) {
      console.log("Has dragtile: ", dragTile);
      const { isOutsideTiers, isOutsideTiles } = isOutsideDropAreaMobile(
        e.clientX,
        e.clientY
      );
      removeShadow(e);
      if (dragTile.tier && isOutsideTiers) {
        console.log("Is outside tiers");
        removeTileFromTier(dragTile.id, dragTile.tier);
      } else if (!dragTile.tier && isOutsideTiles) {
        removeTileFromTiles(dragTile.id);
      }
      setDragTile(null)
    }
  }

  useEffect(() => {
    const mobileRegex = /iphone|android|ipad/i;
    if (mobileRegex.test(navigator.userAgent)) {
      setIsMobile(true);
      setRevealMobileNav(true);
      console.log("Mobile detected");
    }
  }, []);

  return (
    <div
      className="app"
      ref={appRef}
      onPointerMove={(e) => {
        if (dragTile) {
          positionShadow(e);
        }
      }}
      onPointerUp={(e) => {
        handlePointerUp(e);
      }}
      onPointerCancel={(e) => {
        if (dragTile) {
          removeShadow(e);
        }
      }}
    >
      {/* {isSnackbarOpen && (
        <UseSnackbar
          message={snackbarMessage.current}
          setIsSnackbarOpen={setIsSnackbarOpen}
        />
      )} */}
      {isMobile && (
        <div
          className="mobile-warning-overlay"
          onClick={() => setIsMobile(false)}
        >
          <div className="mobile-warning" onClick={(e) => e.stopPropagation()}>
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
        {revealDropArea && (
          <div className="download-wrapper">
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
              <DropArea
                loadPresets={loadPresets}
                setDragFile={setRevealDropArea}
              />
            </dialog>
          </div>
        )}
        <FaDownload
          className="load-presets"
          title="Click to load presets"
          onMouseEnter={(e) => handleSVGTitle(e)}
          onMouseLeave={(e) => handleSVGTitle(e)}
          onClick={() => setRevealDropArea((prev) => !prev)}
        />
      </div>
      <TierMobileDragEvents.Provider value={{ dragTier, setDragTier }}>
        <div className="tier-section" ref={tierSectionRef}>
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
            <ul className="tiers" ref={tiersRef}>
              {iTiers.map((iTier) => (
                <Container
                  key={`container${uuid()}`}
                  tier={iTier}
                  tiersRef={tierSectionRef}
                  tilesRef={tileSectionRef}
                  setITiers={setITiers}
                  setITiles={setITiles}
                  triggerSnackbar={triggerSnackbar}
                  removeTileFromTier={removeTileFromTier}
                  removeTileFromTiles={removeTileFromTiles}
                  children={iTier.children}
                />
              ))}
            </ul>
          )}
        </div>
      </TierMobileDragEvents.Provider>

      <TileMobileDragEvents.Provider value={{ dragTile, setDragTile }}>
        <div className="tile-section" ref={tileSectionRef}>
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
            <ul
              className="tiles"
              ref={tilesRef}
              onPointerDown={() => {
                if (revealMobileNav) {
                  console.log("Made false");
                  setRevealMobileNav(false);
                }
              }}
              onPointerMove={() => {}}
            >
              {revealMobileNav && (
                <div className="swipe-section">
                  &larr;{` Swipe here `}&rarr;
                </div>
              )}
              {iTiles.map((iTile) => (
                <Tile
                  key={`${iTile.id}`}
                  tile={iTile}
                  tiersRef={tierSectionRef}
                  tilesRef={tileSectionRef}
                  setITiers={setITiers}
                  setITiles={setITiles}
                  removeTileFromTier={removeTileFromTier}
                  removeTileFromTiles={removeTileFromTiles}
                />
              ))}
            </ul>
          )}
        </div>
      </TileMobileDragEvents.Provider>
    </div>
  );
}

export default App;
