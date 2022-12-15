import React, {  useRef } from "react";
import { assets } from "../assests/assets";
import { ITier, ITile } from "../interfaces/interfaces";

interface TileProps {
  tile: ITile;
  tier?: ITier;
  closestDragTile: React.MutableRefObject<{
    tile: ITile;
    rect: DOMRect;
  } | null>;
  tileDrop: (
    e: React.DragEvent,
    tileId: string,
    options?: { tier?: ITier }
  ) => void;
}

const Tile: React.FunctionComponent<TileProps> = ({
  tile,
  tier,
  closestDragTile,
  tileDrop,
}) => {
  const tileRef = useRef<HTMLLIElement>(null);
  let isDragging = false;

  function dragStart(e: React.DragEvent<HTMLLIElement>) {
    e.stopPropagation();
    isDragging = true;
    console.log(tile);
    e.currentTarget.style.opacity = "0.5";
  }

  function onDragEnd(e: React.DragEvent<HTMLLIElement>) {
    e.stopPropagation();
    isDragging = false;
    e.currentTarget.style.opacity = "";
    if (tier) {
      console.log("Has tier");
      tileDrop(e, tile.id, { tier });
    } else {
      console.log("No tier");
      tileDrop(e, tile.id);
    }
  }

  function onDragOver(e: React.DragEvent) {
    let dragOverTileDetails = {
      rect: e.currentTarget.getBoundingClientRect(),
      tile: tile,
    };
    if (
      !isDragging &&
      closestDragTile.current?.rect !== dragOverTileDetails.rect &&
      closestDragTile.current?.tile !== dragOverTileDetails.tile
    ) {
      closestDragTile.current = dragOverTileDetails;
      console.log(dragOverTileDetails.tile.id);
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
      draggable
      style={{
        // backgroundImage: tile.imageUrl && `url(${assets[tile.assetsId]})`,
        backgroundImage: tile.imageUrl,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!tile.imageUrl && <span>{tile.id}</span>}
      {/* <span style={{
        fontSize:"3em",
        color:"white"
      }}>{tile.assetsId}</span> */}
    </li>
  );
};

export default Tile;
