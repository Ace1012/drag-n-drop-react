import React, { useContext, useEffect, useRef, useState } from "react";
import { ITier, ITile } from "../App";
import { TileMobileDragEvents } from "../contexts/drag-contexts";

interface TileProps {
  tile: ITile;
  tier?: ITier;
  getTiersSectionRect: () => DOMRect;
  getTilesSectionRect: () => DOMRect;
  setITiers: React.Dispatch<React.SetStateAction<ITier[]>>;
  setITiles: React.Dispatch<React.SetStateAction<ITile[]>>;
  removeTileFromTier(tileId: string, parentTier: ITier): void;
  removeTileFromTiles(tileId: string): void;
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
  setITiers,
  setITiles,
  removeTileFromTier,
  removeTileFromTiles,
}: TileProps) => {
  const tileRef = useRef<HTMLLIElement>(null);
  const pointerPosition = useRef<Offsets>({
    left: 0,
    top: 0,
  });
  const isTouchDragging = useRef(false);

  const tilesContext = useContext(TileMobileDragEvents);

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

    if (tier) {
      if (dragTileTier) {
        //Executed when a tile within a tier is dragged on top of another tile within a tier.
        setITiers((prevTiers) =>
          prevTiers.map((prevTier) => {
            if (prevTier.title === dragTileTier.title) {
              prevTier.children = prevTier.children.filter(
                (prevTile) => prevTile.id !== dragTile.id
              );
            }
            if (prevTier.title === tier.title) {
              prevTier.children = prevTier.children.filter(
                (prevTile) => prevTile.id !== dragTile.id
              );
              if (delta <= 0) {
                prevTier.children.splice(
                  prevTier.children.indexOf(tile),
                  0,
                  dragTile
                );
              } else {
                prevTier.children.splice(
                  prevTier.children.indexOf(tile) + 1,
                  0,
                  dragTile
                );
              }
            }
            return prevTier;
          })
        );
      } else {
        //Executed when a tier-less tile is dragged on top of another tile within another tier.
        setITiers((prevTiers) => {
          prevTiers.forEach((prevTier) => {
            if (prevTier.title === tier.title)
              if (delta <= 0) {
                prevTier.children.splice(
                  prevTier.children.indexOf(tile),
                  0,
                  dragTile
                );
              } else {
                prevTier.children.splice(
                  prevTier.children.indexOf(tile) + 1,
                  0,
                  dragTile
                );
              }
            return prevTier;
          });
          return prevTiers;
        });
        setITiles((prevTiles) =>
          prevTiles.filter((prevTile) => prevTile.id !== dragTile.id)
        );
      }
    } else {
      if (dragTileTier) {
        //Executed when a tile within a tier is dragged on top of a tier-less tile.
        setITiers((prevTiers) => {
          prevTiers.forEach((prevTier) => {
            if (prevTier.title === dragTileTier.title) {
              prevTier.children = prevTier.children.filter(
                (prevTile) => prevTile.id !== dragTile.id
              );
            }
            return prevTier;
          });
          return prevTiers;
        });
        setITiles((prevTiles) => {
          prevTiles = prevTiles.filter(
            (prevTile) => prevTile.id !== dragTile.id
          );
          if (delta <= 0) {
            prevTiles.splice(prevTiles.indexOf(tile), 0, dragTile);
          } else {
            prevTiles.splice(prevTiles.indexOf(tile) + 1, 0, dragTile);
          }
          return prevTiles;
        });
      } else {
        //Executed when a tier-less tile is dragged on top of another tier-less tile.
        setITiles((prevTiles) => {
          prevTiles = prevTiles.filter(
            (prevTile) => prevTile.id !== dragTile.id
          );
          if (delta <= 0) {
            prevTiles.splice(prevTiles.indexOf(tile), 0, dragTile);
          } else {
            prevTiles.splice(prevTiles.indexOf(tile) + 1, 0, dragTile);
          }
          return prevTiles;
        });
      }
    }
  }

  function handleTouchDrop(e: React.PointerEvent<HTMLElement>) {
    const delta = calculateTileDelta(e);
    const dragTile = tilesContext?.dragTile;
    if (dragTile) {
      if (delta <= 0) {
        setITiles((prevTiles) => {
          prevTiles = prevTiles.filter(
            (prevTile) => prevTile.id !== dragTile.id
          );
          prevTiles.splice(prevTiles.indexOf(tile), 0, dragTile);
          return [...prevTiles];
        });
      } else {
        setITiles((prevTiles) => {
          prevTiles = prevTiles.filter(
            (prevTile) => prevTile.id !== dragTile.id
          );
          prevTiles.splice(prevTiles.indexOf(tile) + 1, 0, dragTile);
          return [...prevTiles];
        });
      }
    }
  }

  function releasePointer(e: React.PointerEvent<HTMLLIElement>) {
    // console.log("Release");
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function setPointer(e: React.PointerEvent<HTMLLIElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
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

  function moveShadow(e: React.PointerEvent<HTMLLIElement>) {
    const dragShadow = document.getElementById(`tile-shadow${e.pointerId}`);
    if (dragShadow === null) return;
    dragShadow.style.top = `${e.pageY - pointerPosition.current.top}px`;
    dragShadow.style.left = `${e.pageX - pointerPosition.current.left}px`;
  }

  function removeShadow(e: React.PointerEvent<HTMLLIElement>) {
    const dragShadow = document.getElementById(`tile-shadow${e.pointerId}`);
    dragShadow?.remove();
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

    removeShadow(e);
    isTouchDragging.current = false;

    if (tier && isOutsideTiers) {
      console.log("Is outside tiers");
      removeTileFromTier(tile.id, tier);
    } else if (!tier && isOutsideTiles) {
      removeTileFromTiles(tile.id);
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

    if (isOutsideTiers && tier) removeTileFromTier(tile.id, tier);
    else if (isOutsideTiles && isOutsideTiers && !tier) {
      setITiles((prevTiles) =>
        prevTiles.filter((prevTile) => prevTile.id !== tile.id)
      );
    }
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
      onGotPointerCapture={() => console.log("Got pointer capture", tile.name)}
      onLostPointerCapture={() =>
        console.log("Lost pointer capture", tile.name)
      }
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
