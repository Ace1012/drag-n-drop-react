import React, { useRef } from "react";
import { ITier, ITile } from "../App";

interface TileProps {
  tile: ITile;
  tier?: ITier;
  tiersRef: React.RefObject<HTMLDivElement>;
  tilesRef: React.RefObject<HTMLDivElement>;
  setITiers: React.Dispatch<React.SetStateAction<ITier[]>>;
  setITiles: React.Dispatch<React.SetStateAction<ITile[]>>;
}

const Tile = ({
  tile,
  tier,
  tiersRef,
  tilesRef,
  setITiers,
  setITiles,
}: TileProps) => {
  const tileRef = useRef<HTMLLIElement>(null);

  function onDropPosition(e: React.DragEvent<HTMLElement>) {
    const pointerPositon = { y: e.clientY, x: e.clientX };
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

  function removeTile(tileId: string, parentTier: ITier) {
    const tempTile = parentTier.children.find((tile) => tile.id === tileId)!;
    setITiers((prevTiers) =>
      prevTiers.map((tier) => {
        tier.children = tier.children.filter((tile) => tile.id !== tileId);
        return tier;
      })
    );
    setITiles((prevTiles) => [...prevTiles, tempTile]);
  }

  function editTiles(e: React.DragEvent<HTMLElement>) {
    const tileRect = tileRef.current!.getBoundingClientRect();
    const tileMiddle = tileRect.left + tileRect.width / 2;
    const delta = e.clientX - tileMiddle;
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

  function dragStart(e: React.DragEvent<HTMLLIElement>) {
    e.stopPropagation();
    e.dataTransfer.setData("tile", JSON.stringify(tile));
    tier && e.dataTransfer.setData("tile-tier", JSON.stringify(tier));
    e.currentTarget.style.opacity = "0.5";
  }

  function onDragEnd(e: React.DragEvent<HTMLLIElement>) {
    e.stopPropagation();
    const { isOutsideTiers, isOutsideTiles } = onDropPosition(e);

    if (isOutsideTiers && tier) removeTile(tile.id, tier);
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
      onDragStart={(e) => dragStart(e)}
      onDragEnd={(e) => onDragEnd(e)}
      onDragOver={(e) => onDragOver(e)}
      onDrop={onDrop}
      draggable
      style={{
        backgroundImage: tile.imageUrl ? tile.imageUrl : "",
        backgroundColor: tile.name ? "lightgrey" : "",
        color: tile.name ? "black" : "",
      }}
    >
      {tile.name && <span>{tile.name}</span>}
    </li>
  );
};

export default Tile;
