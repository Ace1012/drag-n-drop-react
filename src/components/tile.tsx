import React, { useRef } from "react";
import { ITier, ITile } from "../App";

interface TileProps {
  tile: ITile;
  tier?: ITier;
  tiersRef: React.RefObject<HTMLUListElement>;
  setITiers: React.Dispatch<React.SetStateAction<ITier[]>>;
  setITiles: React.Dispatch<React.SetStateAction<ITile[]>>;
}

const Tile = ({
  tile,
  tier,
  tiersRef,
  setITiers,
  setITiles,
}: TileProps) => {
  const tileRef = useRef<HTMLLIElement>(null);

  function removeTile(tileId: string, parentTier: ITier) {
    console.log("########Remove tile########");
    const tempTile = parentTier.children.find((tile) => tile.id === tileId)!;
    setITiers((prevTiers) =>
      prevTiers.map((tier) => {
        tier.children = tier.children.filter((tile) => tile.id !== tileId);
        return tier;
      })
    );
    setITiles((prevTiles) => [...prevTiles, tempTile]);
  }

  function reorganizeTiles(e: React.DragEvent) {
    console.log("Editing tiles");
    const tileRect = tileRef.current!.getBoundingClientRect();
    const tileMiddle = tileRect.left + tileRect.width / 2;
    const delta = e.clientX - tileMiddle;
    console.log("Delta: ", delta);
    const dragTile = JSON.parse(e.dataTransfer.getData("tile")) as ITile;

    if (tier) {
      setITiers((prevTiers) =>
        prevTiers.map((prevTier) => {
          if (prevTier.title === tier.title) {
            prevTier.children = prevTier.children.filter(
              (prevTile) => prevTile.id !== dragTile.id
            );
            if (delta <= 0) {
              console.log("Placing before");
              prevTier.children.splice(prevTier.children.indexOf(tile), 0, dragTile);
            } else {
              console.log("Placing after");
              prevTier.children.splice(prevTier.children.indexOf(tile) + 1, 0, dragTile);
            }
          }
          return prevTier;
        })
      );
    } else {
      setITiles((prevTiles) => {
        prevTiles = prevTiles.filter((prevTile) => prevTile.id !== dragTile.id);
        if (delta <= 0) {
          console.log("Placing before");
          prevTiles.splice(prevTiles.indexOf(tile), 0, dragTile);
        } else {
          console.log("Placing after");
          prevTiles.splice(prevTiles.indexOf(tile) + 1, 0, dragTile);
        }
        return prevTiles;
      });
    }
  }

  function dragStart(e: React.DragEvent<HTMLLIElement>) {
    e.stopPropagation();
    e.dataTransfer.setData("tile", JSON.stringify(tile));
    tier && e.dataTransfer.setData("tile-tier", JSON.stringify(tier));
    e.currentTarget.style.opacity = "0.5";
  }

  function onDragEnd(e: React.DragEvent<HTMLLIElement>) {
    e.stopPropagation();
    const tierRect = tiersRef.current!.getBoundingClientRect();
    const pointerPositon = { y: e.clientY, x: e.clientX };
    const isOutsideTiers =
      tierRect.top > pointerPositon.y ||
      tierRect.bottom < pointerPositon.y ||
      tierRect.left > pointerPositon.x ||
      tierRect.right < pointerPositon.x;
    if (isOutsideTiers && tier) removeTile(tile.id, tier);
    e.currentTarget.style.opacity = "";
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation()
  }

  function onDrop(e: React.DragEvent) {
    e.stopPropagation();
    e.preventDefault();
    const dragTile = JSON.parse(e.dataTransfer.getData("tile")) as ITile
    if(dragTile.id !== tile.id){
      reorganizeTiles(e);
    }
  }

  return (
    <li
      className="tile-container"
      ref={tileRef}
      data-dragging="false"
      onDragStart={(e) => dragStart(e)}
      onDragEnd={(e) => onDragEnd(e)}
      onDragOver={(e) => onDragOver(e)}
      onDrop={onDrop}
      draggable
      style={{
        backgroundImage: tile.imageUrl,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!tile.imageUrl && <span>{tile.id}</span>}
    </li>
  );
};

export default Tile;
