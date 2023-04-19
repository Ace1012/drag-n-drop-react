import { useContext, useRef } from "react";
import { ITier, ITile } from "../App";
import { useDispatch, useSelector } from "react-redux/es/exports";
import {
  removeTierChild,
  removeTileFromTiles,
  mutateTiles,
  positionTileInTiles,
  selectIsDragging,
  setDragTile,
  positionTileInTier,
} from "../store/useStore";

interface TileProps {
  tile: ITile;
  tier?: ITier;
  isPointerHandled: React.MutableRefObject<boolean>;
  getTiersSectionRect: () => DOMRect;
  getTilesSectionRect: () => DOMRect;
}

export interface Offsets {
  top: number;
  left: number;
}

const Tile = ({
  tile,
  tier,
  isPointerHandled,
  getTiersSectionRect,
  getTilesSectionRect,
}: TileProps) => {
  const tileRef = useRef<HTMLLIElement>(null);
  // const isTouchDragging = useRef(false);

  const { dragTier, dragTile } = useSelector(selectIsDragging);

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
    /**
     * Case 1: Dragging any tile onto an orphan tile
     * NB: Must have no parent tier indicating this tile is in the tiles section.
     */
    if (dragTile && !tier) {
      dispatch(
        positionTileInTiles({
          delta,
          destinationTile: tile,
          originTile: dragTile,
        })
      );
    } else if (dragTile && tier) {
      console.log("Tile: Transferring tile");
      isPointerHandled.current = true;
      dispatch(
        positionTileInTier({
          delta,
          originTier: dragTile.parentTier,
          originTile: dragTile,
          destinationTier: tier,
          destinationTile: tile,
        })
      );
    }
  }

  function releasePointer(e: React.PointerEvent<HTMLLIElement>) {
    // console.log("Release");
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function createTileShadow(e: React.PointerEvent<HTMLLIElement>) {
    const rect = tileRef.current!.getBoundingClientRect();
    const offsets: Offsets = {
      top: e.clientY - rect.top,
      left: e.clientX - rect.left,
    };

    dispatch(
      setDragTile({
        ...tile,
        offsets: offsets,
        parentTier: tier ? tier : null,
      })
    );

    const dragShadow = document.createElement("li");
    dragShadow.innerHTML = tileRef.current!.innerHTML;
    dragShadow.id = `tile-shadow${tile.id}`;
    dragShadow.classList.add("tile-container");
    dragShadow.style.position = "absolute";
    dragShadow.style.top = `${e.pageY - offsets.top}px`;
    dragShadow.style.left = `${e.pageX - offsets.left}px`;
    dragShadow.style.pointerEvents = "none";
    dragShadow.style.width = `${rect.width}px`;
    dragShadow.style.height = `${rect.height}px`;
    tile.imageUrl
      ? (dragShadow.style.backgroundImage = tile.imageUrl)
      : (dragShadow.style.backgroundColor = "lightgrey");
    dragShadow.style.opacity = "0.5";
    dragShadow.style.zIndex = "10";
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
      // console.log(`Pointer down: ${tile.name}`);
      // isTouchDragging.current = true;

      tileRef.current!.style.opacity = "0.5";
      releasePointer(e);
      createTileShadow(e);
    }
  }

  function pointerUp(e: React.PointerEvent<HTMLLIElement>) {
    if (e.pointerType !== "mouse") {
      if (dragTile && dragTile.id !== tile.id) {
        handleTouchDrop(e);
        dispatch(setDragTile(null));
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
    if (e.pointerType !== "mouse") {
      e.currentTarget.style.opacity = "";
    }
  }

  /**
   * Drag Event Handlers
   */

  function dragStart(e: React.DragEvent<HTMLLIElement>) {
    e.stopPropagation();
    e.dataTransfer.setData("tile", JSON.stringify(tile));
    tier && e.dataTransfer.setData("tile-tier", JSON.stringify(tier));
    e.currentTarget.style.opacity = "0.5";
  }

  function onDragEnd(e: React.DragEvent<HTMLLIElement>) {
    e.stopPropagation();
    const { isOutsideTiers, isOutsideTiles } = isOutsideDropArea(
      e.clientX,
      e.clientY
    );

    if (isOutsideTiers && tier) dispatchRemoveTileFromTier();
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
      data-long-entry={tile.name && tile.name?.length > 65 ? "true" : ""}
      onDragStart={(e) => dragStart(e)}
      onDragEnd={(e) => onDragEnd(e)}
      onDragOver={(e) => onDragOver(e)}
      onDrop={onDrop}
      onPointerDown={pointerDown}
      onPointerUp={pointerUp}
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
