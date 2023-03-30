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

interface Offsets {
  top: number;
  left: number;
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
  const spanRef = useRef<HTMLSpanElement>(null);
  const customDataTransfer = useRef<DataTransfer>();
  const pointerPosition = useRef<Offsets>({
    left: 0,
    top: 0,
  });
  const isTouchDragging = useRef(false);

  function onDropPosition(clientX: number, clientY: number) {
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

  function releasePointer(e: React.PointerEvent<HTMLLIElement>) {
    // console.log("Release");
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function setPointer(e: React.PointerEvent<HTMLLIElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function pointerDown(e: React.PointerEvent<HTMLLIElement>) {
    // e.preventDefault();
    isTouchDragging.current = true;
    // e.currentTarget.releasePointerCapture(e.pointerId);
    // releasePointer(e);
    // setPointer(e);
    if (e.pointerType !== "mouse" && e.isPrimary) {
      const rect = tileRef.current!.getBoundingClientRect();
      const offsets: Offsets = {
        top: e.clientY - rect.top,
        left: e.clientX - rect.left,
      };
      pointerPosition.current = offsets;

      // const dragShadow = document.createElement("li");
      // dragShadow.innerHTML = tileRef.current!.innerHTML;
      // dragShadow.id = `tile-shadow${e.pointerId}`;
      // dragShadow.classList.add("tile-container");
      // dragShadow.style.position = "absolute";
      // dragShadow.style.width = `${rect.width}px`;
      // dragShadow.style.height = `${rect.height}px`;
      // dragShadow.style.top = `${e.pageY - offsets.top}px`;
      // dragShadow.style.left = `${e.pageX - offsets.left}px`;
      // dragShadow.style.backgroundColor = "lightgrey";
      // dragShadow.style.opacity = "0.5";
      // document.body.append(dragShadow);

      //Create dataTransfer Object
      const dataTransfer = new DataTransfer();
      dataTransfer.setData("tile", JSON.stringify(tile));
      dataTransfer.setData("pointer-generated", "true");
      tier && dataTransfer.setData("tile-tier", JSON.stringify(tier));

      //Store dataTransfer Object
      customDataTransfer.current = dataTransfer;

      //Create and dispatch event
      const drag = new DragEvent("dragstart", {
        bubbles: true,
        cancelable: false,
        dataTransfer: dataTransfer,
      });
      e.currentTarget.dispatchEvent(drag);
      releasePointer(e);
    }
  }

  function pointerMove(e: React.PointerEvent<HTMLLIElement>) {
    // if (e.pointerType !== "mouse") {
    // e.preventDefault();
    // console.log(`pointer moving`);
    // const dragShadow = document.getElementById(`tile-shadow${e.pointerId}`)!;
    // dragShadow.style.top = `${e.pageY - pointerPosition.current.top}px`;
    // dragShadow.style.left = `${e.pageX - pointerPosition.current.left}px`;
    // }
  }

  function pointerUp(e: React.PointerEvent<HTMLLIElement>) {
    // setPointer(e);
    // const dragShadow = document.getElementById(`tile-shadow${e.pointerId}`);
    // dragShadow?.remove();
    // console.log(tileRef.current);

    const drag = new DragEvent("dragend", {
      bubbles: true,
      cancelable: false,
      dataTransfer: customDataTransfer.current,
      clientX: e.clientX,
      clientY: e.clientY,
    });
    e.currentTarget.dispatchEvent(drag);

    // const dragOver = new DragEvent("dragover", {
    //   bubbles: true,
    //   cancelable: false,
    //   dataTransfer: customDataTransfer.current,
    //   clientX: e.clientX,
    //   clientY: e.clientY,
    // });
    // document.dispatchEvent(dragOver);

    // const drop = new DragEvent("drop", {
    //   bubbles: true,
    //   cancelable: false,
    //   dataTransfer: customDataTransfer.current,
    //   clientX: e.clientX,
    //   clientY: e.clientY,
    // });
    // document.dispatchEvent(drop);(isTouchDragging.current === false){}

    if (isTouchDragging.current) {
      console.log("Origin");
      isTouchDragging.current = false;
    } else {
      console.log("Destination");
    }
    // console.log(tileRef.current);

    customDataTransfer.current = undefined;
  }

  function pointerCancel(e: React.PointerEvent<HTMLLIElement>) {
    if (e.pointerType === "mouse") return;
    console.log("Cancelled");
    pointerUp(e);
  }

  function pointerLeave(e: React.PointerEvent<HTMLLIElement>) {
    if (isTouchDragging.current && e.pointerType !== "mouse") {
      console.log(`Dispatching dragEnd ${tile.name}`);
    }
    const drag = new DragEvent("dragend", {
      bubbles: true,
      cancelable: false,
      dataTransfer: customDataTransfer.current,
      clientX: e.clientX,
      clientY: e.clientY,
    });
    e.currentTarget.dispatchEvent(drag);
  }

  function dispatchDragStart(e: React.PointerEvent<HTMLLIElement>) {
    console.log(`Dispatching dragStart ${tile.name}`);
    //Create dataTransfer Object
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("tile", JSON.stringify(tile));
    dataTransfer.setData("pointer-generated", "true");
    tier && dataTransfer.setData("tile-tier", JSON.stringify(tier));

    //Store dataTransfer Object
    customDataTransfer.current = dataTransfer;

    //Create and dispatch event
    const drag = new DragEvent("dragstart", {
      bubbles: true,
      cancelable: false,
      dataTransfer: dataTransfer,
    });
    e.target.dispatchEvent(drag);
  }

  function pointerOver(e: React.PointerEvent<HTMLLIElement>) {
    if (e.pointerType === "mouse") return;
    dispatchDragStart(e);
    if (!isTouchDragging.current) {
      setTimeout(() => {
        if (!isTouchDragging.current && e.pointerType !== "mouse") {
          console.log(`Pointer over ${tile.name}`);
        }
      }, 100);
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
    const { isOutsideTiers, isOutsideTiles } = onDropPosition(
      e.clientX,
      e.clientY
    );

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
      onPointerDown={pointerDown}
      onPointerUp={pointerUp}
      onPointerMove={pointerMove}
      onPointerOver={pointerOver}
      onPointerCancel={pointerCancel}
      onPointerLeave={pointerLeave}
      draggable
      style={{
        backgroundImage: tile.imageUrl ? tile.imageUrl : "",
        backgroundColor: tile.name ? "lightgrey" : "",
        color: tile.name ? "black" : "",
      }}
    >
      {tile.name && <span ref={spanRef}>{tile.name}</span>}
    </li>
  );
};

export default Tile;
