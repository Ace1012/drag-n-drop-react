import React, { useRef, useState } from "react";
import { ITier, ITile } from "../App";
import { FaTrash } from "react-icons/fa";
import { AiFillSetting } from "react-icons/ai";
import Tile from "./tile";

interface ContainerProps {
  tier: ITier;
  tiersRef: React.RefObject<HTMLUListElement>;
  tilesRef: React.RefObject<HTMLUListElement>;
  setITiers: React.Dispatch<React.SetStateAction<ITier[]>>;
  setITiles: React.Dispatch<React.SetStateAction<ITile[]>>;
  triggerSnackbar: (message: string) => void;
  children: ITile[];
}

const Container = ({
  tier,
  tiersRef,
  tilesRef,
  setITiers,
  setITiles,
  triggerSnackbar,
  children,
}: ContainerProps) => {
  const tierContainerRef = useRef<HTMLLIElement>(null);
  const tierContainerHeaderRef = useRef<HTMLLIElement>(null);
  const tierContainerFooterRef = useRef<HTMLLIElement>(null);
  const contentAreaRef = useRef<HTMLUListElement>(null);
  const customMenuRef = useRef<HTMLDivElement>(null);

  const [isDraggingTier, setIsDraggingTier] = useState(false);
  const [isCustomizationMenuOpen, setIsCustomizationMenuOpen] = useState(false);

  function dragStart(e: React.DragEvent) {
    tierContainerRef.current!.style.opacity = "0.5";
    e.dataTransfer.setData("tier", JSON.stringify(tier));
  }

  function dragOver(e: React.DragEvent) {
    e.preventDefault();
    const tierRect = tierContainerRef.current!.getBoundingClientRect();
    const tierMiddle = tierRect.top + tierRect.height / 2;
    const delta = e.clientY - tierMiddle;
    if (!isDraggingTier) {
      // tierContainerRef.current!.style.border = "1px solid yellow";
      if (delta <= 0) {
        // tierContainerRef.current!.style.background =
        //   "linear-gradient(to bottom, rgb(45, 230, 230, 0.5) 50%, transparent 50%)";
        tierContainerRef.current!.style.boxShadow = "inset 0 20px 10px cyan";
        tierContainerHeaderRef.current!.style.boxShadow = "inset 10px 20px 10px cyan";
        tierContainerFooterRef.current!.style.boxShadow = "inset -10px 20px 10px cyan";
      } else {
        // tierContainerRef.current!.style.background =
        //   "linear-gradient(to bottom, transparent 50%, rgb(45, 230, 230, 0.5) 50%)";
        tierContainerRef.current!.style.boxShadow = "inset 0 -20px 10px cyan";
        tierContainerHeaderRef.current!.style.boxShadow = "inset 10px -20px 10px cyan";
        tierContainerFooterRef.current!.style.boxShadow = "inset -10px -20px 10px cyan";
      }
    }
  }

  function dragLeave(e: React.DragEvent) {
    tierContainerRef.current!.style.border = "";
    tierContainerRef.current!.style.background = "";
    tierContainerHeaderRef.current!.style.boxShadow = ""
    tierContainerFooterRef.current!.style.boxShadow = ""
    contentAreaRef.current!.style.boxShadow = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.getData("tier")) {
      reOrganizeTiers(e);
    } else if (e.dataTransfer.getData("tile")) {
      if (e.dataTransfer.getData("tile-tier")) {
        const tile = JSON.parse(e.dataTransfer.getData("tile")) as ITile;
        const tierTile = JSON.parse(
          e.dataTransfer.getData("tile-tier")
        ) as ITier;
        tileDrop(e, tile, { tier: tierTile });
      } else {
        tileDrop(e, JSON.parse(e.dataTransfer.getData("tile")));
      }
    }
  }

  function tileDrop(
    e: React.DragEvent,
    iTile: ITile,
    options?: { tier: ITier }
  ) {
    console.log("########Tile drop########");
    console.log("Event", e, iTile, "options\n", options);
    if (options?.tier) {
      console.log("Drop condition 1: Moving tile from one tier to another");
      console.log(options.tier);
      setITiers((prevTiers) =>
        prevTiers.map((prevTier) => {
          if (prevTier.title === options.tier.title) {
            prevTier.children = [
              ...prevTier.children.filter((tile) => tile.id !== iTile.id),
            ];
          }
          if (prevTier.title === tier.title) {
            prevTier.children = [...prevTier.children, iTile];
          }
          return prevTier;
        })
      );
    } else {
      console.log("Drop condition 3: Adding tile to tier");
      setITiles((prevTiles) =>
        prevTiles.length === 1
          ? []
          : prevTiles.filter((tile) => tile.id !== iTile.id)
      );
      setITiers((prevITiers) =>
        prevITiers.map((prevTier) => {
          if (prevTier.title === tier.title) {
            prevTier.children = [...prevTier.children, iTile];
          }
          return prevTier;
        })
      );
    }
  }

  function removeTier(title: string) {
    console.log("########Remove tier########");
    setITiles((prevTiles) => [...prevTiles, ...tier.children]);
    setITiers((prev) => prev.filter((tier) => tier.title !== title));
  }

  function reOrganizeTiers(e: React.DragEvent) {
    console.log("########Reorganize Tiers########");
    const dragTier = JSON.parse(e.dataTransfer.getData("tier")) as ITier;
    if (!dragTier) return;
    const tierRect = tierContainerRef.current!.getBoundingClientRect();
    const tierMiddle = tierRect.top + tierRect.height / 2;
    const delta = e.clientY - tierMiddle;
    const closestTier = tier;
    let index: number;
    if (delta <= 0) {
      triggerSnackbar(`Placed "${dragTier.title.toUpperCase()}" before "${tier.title.toUpperCase()}"`)
      setITiers((prevTiers) => {
        let tempTiers = prevTiers.filter(
          (tier) => tier.title !== dragTier.title
        );
        index = tempTiers.indexOf(closestTier);
        tempTiers.splice(index, 0, dragTier);
        return tempTiers;
      });
    } else {
      triggerSnackbar(`Placed "${dragTier.title.toUpperCase()}" after "${tier.title.toUpperCase()}"`)
      setITiers((prevTiers) => {
        let tempTiers = prevTiers.filter(
          (tier) => tier.title !== dragTier.title
        );
        index = tempTiers.indexOf(closestTier);
        tempTiers.splice(index + 1, 0, dragTier);
        return tempTiers;
      });
    }
  }

  function handleCog(e: React.MouseEvent<SVGElement, MouseEvent>) {
    const el = e.currentTarget;
    if (isCustomizationMenuOpen) {
      el.classList.remove("cog-clicked");
      setIsCustomizationMenuOpen(false);
    } else {
      el.classList.add("cog-clicked");
      setIsCustomizationMenuOpen(true);
      const time = () => {
        const t = setTimeout(() => {
          customMenuRef.current?.classList.add("custom-menu-animation");
          clearTimeout(t);
        });
      };
      time();
    }
  }

  function handleDraggable(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    if (e.type === "mouseenter") {
      setIsDraggingTier(true);
    }
    if (e.type === "mouseleave") {
      setIsDraggingTier(false);
    }
  }

  return (
    <li
      ref={tierContainerRef}
      draggable={isDraggingTier}
      onDrop={onDrop}
      onDragStart={(e) => dragStart(e)}
      onDragOver={(e) => dragOver(e)}
      onDragLeave={(e) => dragLeave(e)}
      className="tier-container"
    >
      <header
      ref={tierContainerHeaderRef}
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
          children.map((iTile) => (
            <Tile
              key={`${iTile!.id}`}
              setITiers={setITiers}
              setITiles={setITiles}
              tiersRef={tiersRef}
              tilesRef={tilesRef}
              tier={tier}
              tile={iTile!}
            />
          ))
        ) : (
          <span
            style={{
              width: "max-content",
            }}
          >
            Add items here
          </span>
        )}
      </ul>
      <footer ref={tierContainerFooterRef}>
        <AiFillSetting
          className="footer-icon"
          onClick={(e) => handleCog(e)}
          size={30}
          color="rgb(130, 130, 130)"
        />
        {isCustomizationMenuOpen && (
          <div ref={customMenuRef} className={`customization-menu`}>
            Customization tools to be added
          </div>
        )}
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
