import React, { useCallback, useEffect, useRef, useState } from "react";
import { ITier, ITile } from "../App";
import { FaTrash } from "react-icons/fa";
import { AiFillSetting } from "react-icons/ai";
import Tile from "./tile";
import CustomizationMenu, {
  HandleCustomizationMenuProps,
} from "./customizationMenu";
import { CirclePicker } from "react-color";
import { ntc } from "../NameThatColor/NameThatColor";

export interface FormSubmitValue {
  color: string;
  newTitle?: string;
}

export interface StorageColorPresets {
  backgroundColor: string;
}

interface ContainerProps {
  tier: ITier;
  tiersRef: React.RefObject<HTMLDivElement>;
  tilesRef: React.RefObject<HTMLDivElement>;
  setITiers: React.Dispatch<React.SetStateAction<ITier[]>>;
  setITiles: React.Dispatch<React.SetStateAction<ITile[]>>;
  triggerSnackbar: (message: string) => void;
  removeTileFromTier(tileId: string, parentTier: ITier): void;
  removeTileFromTiles(tileId: string): void;
  children: ITile[];
}

const Container = ({
  tier,
  tiersRef,
  tilesRef,
  setITiers,
  setITiles,
  triggerSnackbar,
  removeTileFromTier,
  removeTileFromTiles,
  children,
}: ContainerProps) => {
  const tierContainerRef = useRef<HTMLLIElement>(null);
  const tierContainerHeaderRef = useRef<HTMLLIElement>(null);
  const tierContainerFooterRef = useRef<HTMLLIElement>(null);
  const contentAreaRef = useRef<HTMLUListElement>(null);
  const customMenuRef = useRef<HandleCustomizationMenuProps>(null);
  const formSubmitValue = useRef<FormSubmitValue>({
    color: "",
  });

  const [isDraggingThisTier, setIsDraggingThisTier] = useState(false);
  const [isCustomizationMenuOpen, setIsCustomizationMenuOpen] = useState(false);
  const [openColorPicker, setOpenColorPicker] = useState(false);
  const [tierBackgroundColor, setTierBackgroundColor] = useState(
    localStorage.getItem(tier.title)
      ? (JSON.parse(localStorage.getItem(tier.title)!) as StorageColorPresets)
          .backgroundColor
      : "#212121"
  );

  function dragStart(e: React.DragEvent) {
    tierContainerRef.current!.style.opacity = "0.5";
    e.dataTransfer.setData("tier", JSON.stringify(tier));
  }

  function dragEnd() {
    tierContainerRef.current!.style.opacity = "";
  }

  function dragOver(e: React.DragEvent) {
    e.preventDefault();
    const tierRect = tierContainerRef.current!.getBoundingClientRect();
    const tierMiddle = tierRect.top + tierRect.height / 2;
    const delta = e.clientY - tierMiddle;
    const isDraggingTier = e.dataTransfer.types.includes("tier");
    if (!isDraggingThisTier && isDraggingTier) {
      console.log(tierBackgroundColor);
      if (delta <= 0) {
        console.log("Before");
        tierContainerRef.current!.dataset.positon = "before";
        tierContainerRef.current!.style.boxShadow = `inset -10px 15px 10px ${
          tierBackgroundColor === "#212121"
            ? "cyan"
            : `${tierBackgroundColor}55`
        }`;
        tierContainerHeaderRef.current!.style.boxShadow = `inset 10px 15px 10px ${
          tierBackgroundColor === "#212121" ? "cyan" : tierBackgroundColor
        }`;
        tierContainerFooterRef.current!.style.boxShadow = `inset 10px 15px 10px ${
          tierBackgroundColor === "#212121" ? "cyan" : tierBackgroundColor
        }`;
      } else {
        console.log("After");
        tierContainerRef.current!.dataset.positon = "after";
        tierContainerRef.current!.style.boxShadow = `inset 10px -15px 10px ${
          tierBackgroundColor === "#212121"
            ? "cyan"
            : `${tierBackgroundColor}55`
        }`;
        tierContainerHeaderRef.current!.style.boxShadow = `inset 10px -15px 10px ${
          tierBackgroundColor === "#212121" ? "cyan" : tierBackgroundColor
        }`;
        tierContainerFooterRef.current!.style.boxShadow = `inset 10px -15px 10px ${
          tierBackgroundColor === "#212121" ? "cyan" : tierBackgroundColor
        }`;
      }
    } else if (!isDraggingTier) {
      tierContainerRef.current!.style.border = "1px solid yellow";
    }
  }

  function dragLeave(e: React.DragEvent) {
    console.log("Leaving");
    tierContainerRef.current!.style.border = "";
    tierContainerRef.current!.style.boxShadow = "";
    // tierContainerHeaderRef.current!.style.boxShadow =
    //   tierBackgroundColor === "#212121"
    //     ? ""
    //     : `inset 0 0 3em ${tierBackgroundColor}`;
    tierContainerFooterRef.current!.style.boxShadow = "";
    contentAreaRef.current!.style.boxShadow = "";
    delete tierContainerRef.current!.dataset.positon;
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const dragTierRaw = e.dataTransfer.getData("tier");
    if (
      dragTierRaw &&
      (JSON.parse(dragTierRaw) as ITier).title !== tier.title
    ) {
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
    tierContainerRef.current!.removeAttribute("data-position");
  }

  function tileDrop(
    e: React.DragEvent,
    iTile: ITile,
    options?: { tier: ITier }
  ) {
    if (options?.tier) {
      console.log("Drop condition 1: Moving tile from one tier to another");
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
    localStorage.removeItem(tier.title);
    setITiles((prevTiles) => [...prevTiles, ...tier.children]);
    setITiers((prevTiers) => prevTiers.filter((tier) => tier.title !== title));
  }

  function reOrganizeTiers(e: React.DragEvent) {
    const dragTier = JSON.parse(e.dataTransfer.getData("tier")) as ITier;
    if (!dragTier) return;
    const tierRect = tierContainerRef.current!.getBoundingClientRect();
    const tierMiddle = tierRect.top + tierRect.height / 2;
    const delta = e.clientY - tierMiddle;
    const closestTier = tier;
    let index: number;
    if (delta <= 0) {
      triggerSnackbar(
        `Placed "${dragTier.title.toUpperCase()}" before "${tier.title.toUpperCase()}"`
      );
      setITiers((prevTiers) => {
        let tempTiers = prevTiers.filter(
          (tier) => tier.title !== dragTier.title
        );
        index = tempTiers.indexOf(closestTier);
        tempTiers.splice(index, 0, dragTier);
        return tempTiers;
      });
    } else {
      triggerSnackbar(
        `Placed "${dragTier.title.toUpperCase()}" after "${tier.title.toUpperCase()}"`
      );
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

  function closeMenu() {
    formSubmitValue.current = {
      color: "",
    };

    setIsCustomizationMenuOpen(false);
    customMenuRef.current?.clearInputValue();
    customMenuRef.current?.editMenuScale("");
    customMenuRef.current?.editMenuOpacity("");
  }

  function changeBackgroundColor(newColor: string) {
    formSubmitValue.current.color = newColor;
  }

  function handleCog(e: React.MouseEvent<SVGElement, MouseEvent>) {
    const el = e.currentTarget;
    if (isCustomizationMenuOpen) {
      el.classList.remove("cog-clicked");
      setIsCustomizationMenuOpen(false);
      customMenuRef.current?.editMenuScale("");
      customMenuRef.current?.editMenuOpacity("");
    } else {
      el.classList.add("cog-clicked");
      setIsCustomizationMenuOpen(true);
      customMenuRef.current?.editMenuScale("1");
      customMenuRef.current?.editMenuOpacity("1");
    }
  }

  function handleDraggable(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    if (e.type === "mouseenter") {
      setIsDraggingThisTier(true);
      tierContainerRef.current!.style.border = `5px solid ${tierBackgroundColor}`;
      tierContainerHeaderRef.current!.style.boxShadow = "none";
    }
    if (e.type === "mouseleave") {
      setIsDraggingThisTier(false);
      tierContainerRef.current!.style.border = "";
      tierContainerRef.current!.style.boxShadow = "";
      tierContainerHeaderRef.current!.style.backgroundColor = "";
      tierContainerFooterRef.current!.style.backgroundColor = "";
      tierContainerHeaderRef.current!.style.border = "";
      tierContainerHeaderRef.current!.style.boxShadow =
        tierBackgroundColor === "#212121"
          ? ""
          : `inset 0 0 0.1em 0.3em ${tierBackgroundColor}`;
    }
  }

  function handleNewTitle(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value !== "") {
      formSubmitValue.current.newTitle = e.target.value;
    } else {
      formSubmitValue.current = {
        color: "",
      };
    }
    console.log(formSubmitValue.current);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let colorPresets = localStorage.getItem(tier.title)
      ? (JSON.parse(localStorage.getItem(tier.title)!) as FormSubmitValue)
      : null;
    if (
      formSubmitValue.current.color !== "" &&
      formSubmitValue.current.color !== "#212121"
    ) {
      localStorage.setItem(
        `${tier.title}`,
        JSON.stringify({ backgroundColor: formSubmitValue.current.color })
      );
    } else if (!colorPresets) {
      localStorage.removeItem(tier.title);
    }
    if (formSubmitValue.current.color !== "") {
      let newColor = formSubmitValue.current.color;
      setTierBackgroundColor(newColor);
    }
    if (formSubmitValue.current.newTitle) {
      let newTitle = formSubmitValue.current.newTitle;
      if (colorPresets) {
        localStorage.removeItem(tier.title);
        localStorage.setItem(newTitle, JSON.stringify(colorPresets));
      }
      setITiers((prevTiers) => {
        prevTiers.forEach((prevTier) => {
          if (prevTier.title === tier.title) {
            prevTier.title = formSubmitValue.current.newTitle!;
          }
          return prevTier;
        });
        return prevTiers;
      });
    }
    closeMenu();
  }

  function animateHeader() {
    // const keyframes: Keyframe[] = [
    //   {
    //     boxShadow: `inset 0 0 0 ${tierBackgroundColor}`,
    //   },
    //   {
    //     boxShadow: `inset 0 0 0.2em 0.2em ${tierBackgroundColor}`,
    //   },
    //   {
    //     boxShadow: `inset 0 0 0 ${tierBackgroundColor}`,
    //   },
    //   {
    //     boxShadow: `0 0 0 ${tierBackgroundColor}`,
    //   },
    //   {
    //     boxShadow: `0 0 0.2em 0.2em ${tierBackgroundColor}`,
    //   },
    //   {
    //     boxShadow: `0 0 0 ${tierBackgroundColor}`,
    //   },
    //   {
    //     boxShadow: `inset 0 0 0 ${tierBackgroundColor}`,
    //   },
    // {
    //   boxShadow: `inset -10px -10px 1em  ${tierBackgroundColor}`,
    // },
    // {
    //   boxShadow: `inset 0 0 1em ${tierBackgroundColor}`,
    // },
    // {
    //   boxShadow: `inset 10px 10px 1em ${tierBackgroundColor}`,
    // },
    // ];
    // tierContainerHeaderRef.current!.animate(keyframes, {
    //   duration: 2000,
    //   iterations: 3,
    // });
  }

  useEffect(() => {
    window.onbeforeunload = function (e) {
      localStorage.clear();
    };
    if (localStorage.getItem(`page-loaded`) === null) {
      localStorage.setItem(`page-loaded`, "true");
      let keyframes: Keyframe[] = [
        {
          boxShadow: "none",
        },
        {
          boxShadow: "0 0 10px 3px cyan",
        },
        {
          boxShadow: "none",
        },
      ];
      tierContainerHeaderRef.current?.animate(keyframes, {
        duration: 2000,
        iterations: 1,
        easing: "ease-in-out",
      });
    }
  }, []);

  return (
    <li
      className="tier-container"
      ref={tierContainerRef}
      draggable={isDraggingThisTier}
      onDrop={onDrop}
      onDragStart={(e) => dragStart(e)}
      onDragEnd={dragEnd}
      onDragOver={(e) => dragOver(e)}
      onDragLeave={(e) => dragLeave(e)}
      // onTouchMove={touchMove}
      style={{
        backgroundColor: `${tierBackgroundColor}`,
        // boxShadow: `8px 8px 10px ${tierBackgroundColor}`
        // backgroundColor: "#212121",
      }}
    >
      <header
        ref={tierContainerHeaderRef}
        style={{
          boxShadow:
            tierBackgroundColor === "#212121"
              ? ""
              : `inset 0 0 0.1em 0.3em ${tierBackgroundColor}`,
        }}
        onMouseEnter={(e) => handleDraggable(e)}
        onMouseLeave={(e) => handleDraggable(e)}
        // onPointerDown={(e) => console.log("pointerdown")}
        onPointerDown={(e) => handleDraggable(e)}
        onPointerUp={(e) => handleDraggable(e)}
        onDragLeave={(e) => e.stopPropagation()}
      >
        <span>{tier.title}</span>
      </header>
      <ul
        ref={contentAreaRef}
        onDragLeave={(e) => e.stopPropagation()}
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
              removeTileFromTier={removeTileFromTier}
              removeTileFromTiles={removeTileFromTiles}
            />
          ))
        ) : (
          <span>Add items here</span>
        )}
      </ul>
      {/* {openColorPicker && (
        <div className="colors">
          <ChromePicker
            onChange={(newColor) => {
              setOpenColorPicker(false);
              changeBackgroundColor(newColor.hex);
              console.log(formSubmitValue.current.color);
            }}
          />
        </div>
      )} */}
      {openColorPicker && (
        <div className="colors" onClick={() => setOpenColorPicker(false)}>
          <CirclePicker
            className="color-options"
            onChange={(newColor) => {
              setOpenColorPicker(false);
              changeBackgroundColor(newColor.hex);
              console.log(formSubmitValue.current.color);
            }}
          />
        </div>
      )}
      <footer ref={tierContainerFooterRef}>
        <AiFillSetting
          className="footer-icon"
          onClick={(e) => handleCog(e)}
          onDragLeave={(e) => e.stopPropagation()}
          size={30}
          color="rgb(130, 130, 130)"
        />
        {/* <div className="customization-overlay"> */}
        <CustomizationMenu
          tierBackgroundColor={tierBackgroundColor}
          openColorPicker={openColorPicker}
          setOpenColorPicker={setOpenColorPicker}
          closeMenu={closeMenu}
          handleNewTitle={handleNewTitle}
          handleSubmit={handleSubmit}
          ref={customMenuRef}
        />
        {/* </div> */}
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
