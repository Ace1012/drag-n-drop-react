import React, { useEffect, useRef, useState } from "react";
import UseSnackbar from "./components/useSnackbar";
import { ntc } from "./NameThatColor/NameThatColor";
import TierSection from "./components/tierSection";
import TileSection from "./components/tileSection";
import MobileWarning from "./components/mobileWarning";
import PresetsManagement from "./components/presetsManagement";
import { useSelector, useDispatch } from "react-redux/es/exports";
import {
  removeTierChild,
  removeTileFromTiles,
  selectIsDragging,
  selectTiers,
  selectTiles,
  setDragTier,
  setDragTile,
} from "./store/useStore";

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
  const isPointerHandled = useRef(false);
  const snackbarMessage = useRef("Drag tiles out of grey zone to remove");

  const tiers = useSelector(selectTiers);
  const tiles = useSelector(selectTiles);
  const { dragTier, dragTile } = useSelector(selectIsDragging);

  const dispatch = useDispatch();

  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [revealMobileNav, setRevealMobileNav] = useState(false);

  // function triggerSnackbar(message: string) {
  //   snackbarMessage.current = message;
  //   setIsSnackbarOpen(true);
  // }

  /**
   * Adjust the position of the shadow when pointermoves.
   *
   * @param e
   * @returns
   */
  function positionShadow(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") {
      if (dragTier) {
        const dragShadow = document.getElementById(
          `tier-shadow${dragTier.title}`
        );
        if (!dragShadow) return;
        dragShadow.style.top = `${e.pageY - dragTier.offsets.top}px`;
        dragShadow.style.left = `${e.pageX - dragTier.offsets.left}px`;
      } else if (dragTile) {
        console.log("Moving tile");
        const dragShadow = document.getElementById(`tile-shadow${dragTile.id}`);
        if (!dragShadow) return;
        dragShadow.style.top = `${e.pageY - dragTile.offsets.top}px`;
        dragShadow.style.left = `${e.pageX - dragTile.offsets.left}px`;
      }
    }
  }

  /**
   * Removes the shadow during the pointerup event.
   *
   * @param e
   */
  function removeShadow(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") {
      if (dragTier) {
        console.log("Removing tier-shadow");
        document.getElementById(`tier-shadow${dragTier.title}`)?.remove();
        dispatch(setDragTier(null));
      } else if (dragTile) {
        console.log("Removing tile-shadow");
        document.getElementById(`tile-shadow${dragTile.id}`)?.remove();
        const { isOutsideTiers, isOutsideTiles } = isOutsideDropAreaMobile(
          e.clientX,
          e.clientY
        );
        if (dragTile.parentTier && isOutsideTiers) {
          dispatch(
            removeTierChild({
              childTile: dragTile,
              parentTierTitle: dragTile.parentTier.title,
            })
          );
        } else if (!dragTile.parentTier && isOutsideTiles) {
          dispatch(removeTileFromTiles(dragTile.id));
        }
        dispatch(setDragTile(null));
      }
    }
  }

  /**
   * Calculates whether the pointerup event(after dragging a tile) is
   * outside the tiers/tiles section.
   *
   * NB: On mobile this corresponds to the tiers and tiles sections while
   * usually it corresponds to the Tiers and Tile Sections respectively.
   *
   * @param clientX
   * @param clientY
   * @returns
   */
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

  /**
   * Handles the pointerup event, i.e. triggered when a
   * finger or stylus stops making contact with the screen.
   *
   * @param e
   * @returns
   */
  function handlePointerUp(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") {
      removeShadow(e);
      isPointerHandled.current = false;
    }
  }

  /**
   * Returns the DOMRect of the Tiers Section.
   * Used to calculate the whether a pointerevent (usually the pointerup event),
   * happened outside the bounds.
   *
   * @returns
   */
  function getTiersSectionRect(): DOMRect {
    return tiersSectionForwardRef.current!.returnTiersRect();
  }

  /**
   * Returns the DOMRect of the Tiles Section.
   * Used to calculate the whether a pointerevent (usually the pointerup event),
   * happened outside the bounds.
   *
   * @returns
   */
  function getTilesSectionRect(): DOMRect {
    return tilesSectionForwardRef.current!.returnTilesRect();
  }

  /**
   * Returns the DOMRect of Tiers.
   * Used to calculate the whether a pointerevent (usually the pointerup event),
   * happened outside the bounds.
   *
   * @returns
   */
  function getMobileTiersSectionRect(): DOMRect {
    return tiersSectionForwardRef.current!.returnMobileTiersRect();
  }

  /**
   * Returns the DOMRect of Tiles.
   * Used to calculate the whether a pointerevent (usually the pointerup event),
   * happened outside the bounds.
   *
   * @returns
   */
  function getMobileTilesSectionRect(): DOMRect {
    return tilesSectionForwardRef.current!.returnMobileTilesRect();
  }

  /**
   * Checks whether on mobile to display warning
   */
  // useEffect(() => {
  //   const mobileRegex = /iphone|android|ipad/i;
  //   if (mobileRegex.test(navigator.userAgent)) {
  //     setIsMobile(true);
  //     setRevealMobileNav(true);
  //     console.log("Mobile detected");
  //   }
  // }, []);

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
      <PresetsManagement />
      <TierSection
        ref={tiersSectionForwardRef}
        isPointerHandled={isPointerHandled}
        getTilesSectionRect={getTilesSectionRect}
      />

      <TileSection
        ref={tilesSectionForwardRef}
        isPointerHandled={isPointerHandled}
        revealMobileNav={revealMobileNav}
        getTiersSectionRect={getTiersSectionRect}
        setRevealMobileNav={setRevealMobileNav}
      />
    </div>
  );
}

export default App;
