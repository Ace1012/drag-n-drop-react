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
import Tier, { FormSubmitValue } from "./components/tier";
import Tile, { Offsets } from "./components/tile";
import { v4 as uuid } from "uuid";
import UseSnackbar from "./components/useSnackbar";
import { ntc } from "./NameThatColor/NameThatColor";
import {
  IDragTile,
  TierMobileDragEvents,
  TileMobileDragEvents,
} from "./contexts/drag-contexts";
import TierSection from "./components/tierSection";
import TileSection from "./components/tileSection";
import MobileWarning from "./components/mobileWarning";
import PresetsManagement from "./components/presetsManagement";

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

export interface ITierSectionForwardRefProps {
  returnTiersRect: () => DOMRect;
  returnMobileTiersRect: () => DOMRect;
}

export interface ITileSectionForwardRefProps {
  returnTilesRect: () => DOMRect;
  returnMobileTilesRect: () => DOMRect;
}

function App() {
  const appRef = useRef<HTMLDivElement>(null);
  const tiersSectionForwardRef = useRef<ITierSectionForwardRefProps>(null);
  const tilesSectionForwardRef = useRef<ITileSectionForwardRefProps>(null);
  const snackbarMessage = useRef("Drag tiles out of grey zone to remove");

  const [iTiers, setITiers] = useState<ITier[]>([
    { title: "default", children: [] },
  ]);
  const [iTiles, setITiles] = useState<ITile[]>([
    {
      id: "tiledkajdbjahkdnaklsdasadada",
      name: "A",
    },
    {
      id: "tilealsbdalkjdblkajdnalkdjns",
      name: "B",
    },
  ]);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  // const [svgTitle, setSvgTitle] = useState("Click to save current tier list");
  // const [revealDropArea, setRevealDropArea] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [revealMobileNav, setRevealMobileNav] = useState(false);
  const [dragTier, setDragTier] = useState<ITier | null>(null);
  const [dragTile, setDragTile] = useState<IDragTile | null>(null);

  // function triggerSnackbar(message: string) {
  //   snackbarMessage.current = message;
  //   setIsSnackbarOpen(true);
  // }

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

  function positionShadow(e: React.PointerEvent) {
    const dragShadow = document.getElementById(`tile-shadow${e.pointerId}`);
    if (dragShadow === null || dragTile === null) return;
    // dragShadow.style.top = `${e.pageY - pointerPosition.top}px`;
    // dragShadow.style.left = `${e.pageX - pointerPosition.left}px`;
    dragShadow.style.top = `${e.pageY - dragTile.offsets.top}px`;
    dragShadow.style.left = `${e.pageX - dragTile.offsets.left}px`;
  }

  function removeShadow(e: React.PointerEvent) {
    const dragShadow = document.getElementById(`tile-shadow${e.pointerId}`);
    dragShadow?.remove();
  }

  function isOutsideDropAreaMobile(clientX: number, clientY: number) {
    const pointerPositon = { y: clientY, x: clientX };
    const tierRect = getMobileTiersSectionRect();
    const isOutsideTiers =
      tierRect.top > pointerPositon.y ||
      tierRect.bottom < pointerPositon.y ||
      tierRect.left > pointerPositon.x ||
      tierRect.right < pointerPositon.x;
    const tilesRect = getMobileTilesSectionRect();
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
    if (!dragTile) return;
    const { isOutsideTiers, isOutsideTiles } = isOutsideDropAreaMobile(
      e.clientX,
      e.clientY
    );
    removeShadow(e);
    if (dragTile.tier && isOutsideTiers) {
      removeTileFromTier(dragTile.id, dragTile.tier);
    } else if (!dragTile.tier && isOutsideTiles) {
      removeTileFromTiles(dragTile.id);
    }
    setDragTile(null);
  }

  function getTiersSectionRect(): DOMRect {
    return tiersSectionForwardRef.current!.returnTiersRect();
  }

  function getTilesSectionRect(): DOMRect {
    return tilesSectionForwardRef.current!.returnTilesRect();
  }

  function getMobileTiersSectionRect(): DOMRect {
    return tiersSectionForwardRef.current!.returnMobileTiersRect();
  }

  function getMobileTilesSectionRect(): DOMRect {
    return tilesSectionForwardRef.current!.returnMobileTilesRect();
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
        positionShadow(e);
      }}
      onPointerUp={(e) => {
        handlePointerUp(e);
      }}
      onPointerCancel={(e) => {
        removeShadow(e);
      }}
    >
      {/* {isSnackbarOpen && (
        <UseSnackbar
          message={snackbarMessage.current}
          setIsSnackbarOpen={setIsSnackbarOpen}
        />
      )} */}
      {isMobile && <MobileWarning setIsMobile={setIsMobile} />}
      <PresetsManagement
        iTiers={iTiers}
        iTiles={iTiles}
        setITiers={setITiers}
        setITiles={setITiles}
      />
      <TierMobileDragEvents.Provider value={{ dragTier, setDragTier }}>
        <TierSection
          ref={tiersSectionForwardRef}
          iTiers={iTiers}
          setITiers={setITiers}
          iTiles={iTiles}
          setITiles={setITiles}
          getTilesSectionRect={getTilesSectionRect}
          clearTiers={clearTiers}
          removeTileFromTier={removeTileFromTier}
          removeTileFromTiles={removeTileFromTiles}
        />
      </TierMobileDragEvents.Provider>

      <TileMobileDragEvents.Provider value={{ dragTile, setDragTile }}>
        <TileSection
          ref={tilesSectionForwardRef}
          iTiers={iTiers}
          setITiers={setITiers}
          iTiles={iTiles}
          setITiles={setITiles}
          revealMobileNav={revealMobileNav}
          getTiersSectionRect={getTiersSectionRect}
          setRevealMobileNav={setRevealMobileNav}
          removeTileFromTier={removeTileFromTier}
          removeTileFromTiles={removeTileFromTiles}
        />
      </TileMobileDragEvents.Provider>
    </div>
  );
}

export default App;
