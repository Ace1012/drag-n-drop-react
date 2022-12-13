import React, { useEffect, useRef, useState } from "react";
import { ITier, ITile } from "../interfaces/interfaces";
import { FaTrash } from "react-icons/fa";
import { AiFillSetting } from "react-icons/ai";
import Tile from "./tile";

interface ContainerProps {
  tier: ITier;
  currentTitle: React.MutableRefObject<string>;
  closestDragTile: React.MutableRefObject<{
    tile: ITile;
    rect: DOMRect;
  } | null>;
  closestDragTier: React.MutableRefObject<{
    tier: ITier;
    rect: DOMRect;
  } | null>;
  removeTier: (title: string) => void;
  reOrganizeTiers: (e: React.DragEvent, dragTier: ITier) => void;
  tileDrop: (
    e: React.DragEvent,
    tileId: string,
    options?: { tier?: ITier }
  ) => void;
  children: ITile[];
}

const Container = ({
  tier,
  currentTitle,
  closestDragTile,
  closestDragTier,
  reOrganizeTiers,
  removeTier,
  tileDrop,
  children,
}: ContainerProps) => {
  const tierContainerRef = useRef<HTMLLIElement>(null);
  const contentAreaRef = useRef<HTMLUListElement>(null);
  const [isDraggingTier, setIsDraggingTier] = useState(false);
  const isOver = useRef(false);

  function dragOver(e: React.DragEvent) {
    let dragOverTierDetails = {
      tier: tier,
      rect: e.currentTarget.getBoundingClientRect(),
    };
    if (!isDraggingTier && !isOver.current) {
      isOver.current = true;
      currentTitle.current = tier.title;
      if (!closestDragTier.current) {
        tierContainerRef.current!.style.border = "1px solid yellow";
      } else if (closestDragTile.current) {
        contentAreaRef.current!.style.boxShadow = "inset 0 0 15px 5px cyan";
      }
      closestDragTier.current = dragOverTierDetails;
    }
  }

  function dragLeave(e: React.DragEvent) {
    const tierRect = e.currentTarget.getBoundingClientRect();
    const pointerPositon = { y: e.clientY, x: e.clientX };
    const isOutsideTiers =
      tierRect.top > pointerPositon.y ||
      tierRect.bottom < pointerPositon.y ||
      tierRect.left > pointerPositon.x ||
      tierRect.right < pointerPositon.x;
    tierContainerRef.current!.style.border = "";
    contentAreaRef.current!.style.boxShadow = "";
    if (isOver.current) {
      isOver.current = false;
      // if (isOutsideTiers) closestDragTier.current = null;
    }
  }

  function dragStart(e: React.DragEvent) {
    tierContainerRef.current!.style.opacity = "0.5";
  }

  function dragEnd(e: React.DragEvent) {
    tierContainerRef.current!.style.opacity = "";
    reOrganizeTiers(e, tier);
  }

  function handleCog(e: React.MouseEvent<SVGElement, MouseEvent>) {
    const el = e.currentTarget;
    el.classList.add("cog-clicked");
    const time = () => {
      const t = setTimeout(() => {
        console.log("Removing");
        el.classList.remove("cog-clicked");
        clearTimeout(t);
      }, 500);
    };
    time();
  }

  function handleDraggable(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    if (e.type === "mouseenter") {
      setIsDraggingTier(true);
      tierContainerRef.current!.style.cursor = "grab";
      tierContainerRef.current!.style.border = "1px solid cyan";
    }
    if (e.type === "mouseleave") {
      setIsDraggingTier(false);
      tierContainerRef.current!.style.cursor = "";
      tierContainerRef.current!.style.border = "";
    }
  }

  return (
    <li
      ref={tierContainerRef}
      onDragStart={(e) => dragStart(e)}
      onDragEnd={(e) => dragEnd(e)}
      onDragOver={(e) => dragOver(e)}
      onDragLeave={(e) => dragLeave(e)}
      draggable={isDraggingTier}
      className="tier-container"
    >
      <header
        onMouseEnter={(e) => handleDraggable(e)}
        onMouseLeave={(e) => handleDraggable(e)}
      >
        {tier.title}
      </header>
      <ul
        ref={contentAreaRef}
        className={`content ${children.length > 0 ? "has-children" : ""}`}
      >
        {children.length > 0 ? (
          children.map((iTile, index) => (
            <Tile
              key={`${iTile!.id}`}
              tier={tier}
              closestDragTile={closestDragTile}
              tile={iTile!}
              tileDrop={tileDrop}
            />
          ))
        ) : (
          <span
            style={{
              width: "max-content",
            }}
          >
            Content Area
          </span>
        )}
      </ul>
      <footer>
        <AiFillSetting
          className="footer-icon"
          onClick={(e) => handleCog(e)}
          size={30}
          color="rgb(130, 130, 130)"
        />
        <FaTrash
          className="footer-icon"
          onClick={() => removeTier(tier.title)}
          size={30}
          color="rgb(130, 130, 130)"
        />
      </footer>
    </li>
  );
};

export default Container;
