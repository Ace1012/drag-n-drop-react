import { useContext, useRef } from "react";
import { ITier, ITile } from "../App";
import { TileMobileDragEvents } from "../contexts/drag-contexts";
import { useDispatch } from "react-redux/es/exports";
import {
  removeTierChild,
  removeTileFromTiles,
  mutateTiles,
  positionTileInTiles,
} from "../store/useStore";

interface TileProps {
  tile: ITile;
  tier?: ITier;
  getTiersSectionRect: () => DOMRect;
  getTilesSectionRect: () => DOMRect;
  // removeTileFromTier(tileId: string, parentTier: ITier): void;
  // removeTileFromTiles(tileId: string): void;
}

export interface Offsets {
  top: number;
  left: number;
}

const Tile = ({
  tile,
  tier,
  getTiersSectionRect,
  getTilesSectionRect,
}: // removeTileFromTier,
// removeTileFromTiles,
TileProps) => {
  const tileRef = useRef<HTMLLIElement>(null);
  const pointerPosition = useRef<Offsets>({
    left: 0,
    top: 0,
  });
  const isTouchDragging = useRef(false);

  const tilesContext = useContext(TileMobileDragEvents);

  const dispatch = useDispatch();

  /**
   * Utility Functions
   */

  function isOutsideDropArea(clientX: number, clientY: number) {
    const pointerPositon = { y: clientY, x: clientX };
    const tierRect = getTiersSectionRect();
    const isOutsideTiers =
      tierRect.top > pointerPositon.y ||
      tierRect.bottom < pointerPositon.y ||
      tierRect.left > pointerPositon.x ||
      tierRect.right < pointerPositon.x;
    const tilesRect = getTilesSectionRect();
    const isOutsideTiles =
      tilesRect.top > pointerPositon.y ||
      tilesRect.bottom < pointerPositon.y ||
      tilesRect.left > pointerPositon.x ||
      tilesRect.right < pointerPositon.x;

    return { isOutsideTiers, isOutsideTiles };
  }

  function calculateTileDelta(e: React.DragEvent | React.PointerEvent) {
    const tileRect = tileRef.current!.getBoundingClientRect();
    const tileMiddle = tileRect.left + tileRect.width / 2;
    return e.clientX - tileMiddle;
  }

  function editTiles(e: React.DragEvent<HTMLElement>) {
    const delta = calculateTileDelta(e);
    const dragTile = JSON.parse(e.dataTransfer.getData("tile")) as ITile;
    const dragTileTier = e.dataTransfer.getData("tile-tier")
      ? (JSON.parse(e.dataTransfer.getData("tile-tier")) as ITier)
      : null;

    dispatch(
      mutateTiles({
        delta,
        originParentTier: dragTileTier,
        originTile: dragTile,
        destinationParentTier: tier ? tier : null,
        destinationTile: tile,
      })
    );
  }

  function handleTouchDrop(e: React.PointerEvent<HTMLElement>) {
    const delta = calculateTileDelta(e);
    const dragTile = tilesContext?.dragTile;
    dispatch;
    if (dragTile) {
      dispatch(
        positionTileInTiles({
          delta,
          destinationTile: tile,
          originTile: dragTile,
        })
      );
    }
  }

  function releasePointer(e: React.PointerEvent<HTMLLIElement>) {
    // console.log("Release");
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function createShadow(e: React.PointerEvent<HTMLLIElement>) {
    const rect = tileRef.current!.getBoundingClientRect();
    const offsets: Offsets = {
      top: e.clientY - rect.top,
      left: e.clientX - rect.left,
    };
    pointerPosition.current = offsets;
    const dragShadow = document.createElement("li");
    dragShadow.innerHTML = tileRef.current!.innerHTML;
    dragShadow.id = `tile-shadow${e.pointerId}`;
    dragShadow.classList.add("tile-container");
    dragShadow.style.position = "absolute";
    dragShadow.style.pointerEvents = "none";
    dragShadow.style.minWidth = `50px`;
    // dragShadow.style.width = `50px`;
    // dragShadow.style.height = `50px`;
    dragShadow.style.width = `${rect.width}px`;
    dragShadow.style.height = `${rect.height}px`;
    // dragShadow.style.padding = "1rem"
    dragShadow.style.top = `${e.pageY - offsets.top}px`;
    dragShadow.style.left = `${e.pageX - offsets.left}px`;
    // dragShadow.style.top = `${e.pageY - 50}px`;
    // dragShadow.style.left = `${e.pageX + 5}px`;
    tile.imageUrl
      ? (dragShadow.style.backgroundImage = tile.imageUrl)
      : (dragShadow.style.backgroundColor = "lightgrey");
    dragShadow.style.opacity = "0.5";
    document.body.append(dragShadow);
  }

  /**
   * Dispatch functions
   */

  function dispatchRemoveTileFromTier() {
    if (tier) {
      dispatch(
        removeTierChild({ parentTierTitle: tier.title, childTile: tile })
      );
    }
  }

  function dispatchRemoveTileFromTiles() {
    dispatch(removeTileFromTiles(tile.id));
  }

  /**
   * Pointer Event Handlers
   */

  function pointerDown(e: React.PointerEvent<HTMLLIElement>) {
    if (e.pointerType !== "mouse") {
      // e.preventDefault();
      console.log(`Pointer down: ${tile.name}`);
      isTouchDragging.current = true;
      const rect = tileRef.current!.getBoundingClientRect();
      const offsets: Offsets = {
        top: e.clientY - rect.top,
        left: e.clientX - rect.left,
      };
      pointerPosition.current = offsets;
      tilesContext?.setDragTile({
        ...tile,
        offsets: pointerPosition.current,
      });
      // e.currentTarget.style.opacity = "0.5";
      tileRef.current!.style.opacity = "0.5";
      releasePointer(e);
      // console.log("Pointer down: ", tile.name);
      createShadow(e);
    }
  }

  function pointerMove(e: React.PointerEvent<HTMLLIElement>) {
    if (e.pointerType !== "mouse") {
      // console.log("Moving");
      // e.preventDefault();
      // console.log(offsets);
      // console.log(e.pointerId);
      // moveShadow(e);
    }
  }

  function pointerOver(e: React.PointerEvent<HTMLLIElement>) {
    e.stopPropagation();
    if (e.pointerType === "mouse" && !isTouchDragging.current) return;
    // setTimeout(() => {
    //   console.log(
    //     `Pointer over ${tile.name}\nisDragging = ${isTouchDragging.current}`
    //   );
    // }, 100);
  }

  function pointerUp(e: React.PointerEvent<HTMLLIElement>) {
    /**
     * isTouchDragging is set to false here to address any previous dragging attempts
     * that left it "hanging" as true. This is to ensure only the current dragged tile
     * will execute the functionality behind being dragged.
     */
    const { isOutsideTiers, isOutsideTiles } = isOutsideDropArea(
      e.clientX,
      e.clientY
    );

    isTouchDragging.current = false;

    if (tier && isOutsideTiers) {
      console.log("Is outside tiers");
      dispatchRemoveTileFromTier();
    } else if (!tier && isOutsideTiles) {
      dispatchRemoveTileFromTiles();
    }

    if (!isTouchDragging.current && tilesContext?.dragTile?.id !== tile.id) {
      if (tilesContext?.dragTile) {
        handleTouchDrop(e);
        tilesContext?.setDragTile(null);
        e.currentTarget.style.opacity = "";
      }
    }
  }

  function pointerCancel(e: React.PointerEvent<HTMLLIElement>) {
    if (e.pointerType === "mouse") return;
    console.log("Cancelled");
    pointerUp(e);
  }

  function pointerLeave(e: React.PointerEvent<HTMLLIElement>) {
    // console.log(`Leaving##########`)
    e.currentTarget.style.opacity = "";
  }

  /**
   * Drag Event Handlers
   */

  function dragStart(e: React.DragEvent<HTMLLIElement>) {
    e.stopPropagation();
    e.dataTransfer.setData("tile", JSON.stringify(tile));
    tier && e.dataTransfer.setData("tile-tier", JSON.stringify(tier));
    e.currentTarget.style.opacity = "0.5";
    console.log(e.dataTransfer);
  }

  function onDragEnd(e: React.DragEvent<HTMLLIElement>) {
    e.stopPropagation();
    const { isOutsideTiers, isOutsideTiles } = isOutsideDropArea(
      e.clientX,
      e.clientY
    );

    if (isOutsideTiers && tier) dispatchRemoveTileFromTier();
    // else if (isOutsideTiles && isOutsideTiers && !tier)
    //   removeTileFromTiles(tile.id);
    else if (isOutsideTiles && isOutsideTiers && !tier)
      dispatchRemoveTileFromTiles();
    e.currentTarget.style.opacity = "";
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function onDrop(e: React.DragEvent<HTMLElement>) {
    e.stopPropagation();
    e.preventDefault();
    const dragTile = JSON.parse(e.dataTransfer.getData("tile")) as ITile;

    if (dragTile.id !== tile.id) {
      editTiles(e);
    }
  }

  return (
    <li
      className="tile-container"
      ref={tileRef}
      data-dragging="false"
      data-position={`${!tier ? "has-tier" : ""}`}
      onDragStart={(e) => dragStart(e)}
      onDragEnd={(e) => onDragEnd(e)}
      onDragOver={(e) => onDragOver(e)}
      onDrop={onDrop}
      onPointerDown={pointerDown}
      onPointerUp={pointerUp}
      onPointerMove={pointerMove}
      onPointerOverCapture={pointerOver}
      onPointerCancel={pointerCancel}
      onPointerLeave={pointerLeave}
      draggable
      style={{
        backgroundImage: tile.imageUrl ? tile.imageUrl : "",
        backgroundColor: tile.name ? "lightgrey" : "",
        color: tile.name ? "black" : "",
      }}
    >
      {/* {tile.name && <span ref={spanRef}>{tile.name}</span>} */}
      {tile.name && tile.name}
    </li>
  );
};

export default Tile;
