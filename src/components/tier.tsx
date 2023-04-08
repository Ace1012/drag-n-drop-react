import React, { useEffect, useRef, useState } from "react";
import { ITier, ITile } from "../App";
import { FaTrash } from "react-icons/fa";
import { AiFillSetting } from "react-icons/ai";
import Tile from "./tile";
import CustomizationMenu, {
  HandleCustomizationMenuProps,
} from "./customizationMenu";
import { CirclePicker } from "react-color";
import { ntc } from "../NameThatColor/NameThatColor";
import {
  addTileToTier,
  editTitle,
  positionTier,
  removeTier,
  transferTile,
} from "../store/useStore";
import { useDispatch } from "react-redux";

export interface IFormSubmitValue {
  color: string;
  newTitle?: string;
}

export interface IStorageColorPresets {
  backgroundColor: string;
}

interface ContainerProps {
  tier: ITier;
  getTiersSectionRect: () => DOMRect;
  getTilesSectionRect: () => DOMRect;
  // triggerSnackbar: (message: string) => void;
  children: ITile[];
}

const Tier = ({
  tier,
  getTiersSectionRect,
  getTilesSectionRect,
  // triggerSnackbar,
  children,
}: ContainerProps) => {
  const tierContainerRef = useRef<HTMLLIElement>(null);
  const tierContainerHeaderRef = useRef<HTMLLIElement>(null);
  const tierContainerFooterRef = useRef<HTMLLIElement>(null);
  const contentAreaRef = useRef<HTMLUListElement>(null);
  const customMenuRef = useRef<HandleCustomizationMenuProps>(null);
  const formSubmitValue = useRef<IFormSubmitValue>({
    color: "",
  });

  const [isDraggingThisTier, setIsDraggingThisTier] = useState(false);
  const [isCustomizationMenuOpen, setIsCustomizationMenuOpen] = useState(false);
  const [openColorPicker, setOpenColorPicker] = useState(false);
  const [tierBackgroundColor, setTierBackgroundColor] = useState(
    localStorage.getItem(tier.title)
      ? (JSON.parse(localStorage.getItem(tier.title)!) as IStorageColorPresets)
          .backgroundColor
      : "#212121"
  );

  const dispatch = useDispatch();

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
      // console.log(tierBackgroundColor);
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
    const dragTier = dragTierRaw
      ? (JSON.parse(e.dataTransfer.getData("tier")) as ITier)
      : null;

    const dragParentTierRaw = e.dataTransfer.getData("tile-tier");
    const dragParentTier = dragParentTierRaw
      ? (JSON.parse(e.dataTransfer.getData("tile-tier")) as ITier)
      : null;

    const dragTileRaw = e.dataTransfer.getData("tile");
    const dragTile = dragTileRaw ? (JSON.parse(dragTileRaw) as ITile) : null;

    if (
      dragTier &&
      dragTier?.title !== tier.title &&
      dragParentTier?.title !== tier.title
    ) {
      // When a tier is dragged on top of another tier
      reOrganizeTiers(e);
    } else if (dragTile) {
      // When a tile is dragged on top of a tier and not another tile.

      if (dragParentTier) {
        //If the tile being dragged was in a tier already.
        tileDrop(e, dragTile, dragParentTier);
      } else {
        // If the tile was not in a tier.
        tileDrop(e, dragTile);
      }
    }
    tierContainerRef.current!.removeAttribute("data-position");
  }

  function tileDrop(
    e: React.DragEvent,
    dragTile: ITile,
    dragParentTier?: ITier
  ) {
    if (dragParentTier) {
      console.log("Drop condition 1: Moving tile from one tier to another");
      dispatch(
        transferTile({
          tile: dragTile,
          originTier: dragParentTier,
          destinationTier: tier,
        })
      );
    } else {
      console.log("Drop condition 3: Adding tile to tier");
      dispatch(addTileToTier({ destinationTierTitle: tier.title, dragTile }));
    }
  }

  function dispatchRemoveTier() {
    localStorage.removeItem(tier.title);
    dispatch(removeTier(tier));
  }

  function reOrganizeTiers(e: React.DragEvent) {
    const dragTier = JSON.parse(e.dataTransfer.getData("tier")) as ITier;
    if (!dragTier) return;
    const tierRect = tierContainerRef.current!.getBoundingClientRect();
    const tierMiddle = tierRect.top + tierRect.height / 2;
    const delta = e.clientY - tierMiddle;
    const closestTier = tier;
    let index: number;
    // triggerSnackbar(
    //   `Placed "${dragTier.title.toUpperCase()}" before "${tier.title.toUpperCase()}"`
    // );
    dispatch(
      positionTier({ delta, destinationTier: tier, originTier: dragTier })
    );
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

  function handleMobileDraggable(e: React.PointerEvent<HTMLElement>){

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
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let colorPresets = localStorage.getItem(tier.title)
      ? (JSON.parse(localStorage.getItem(tier.title)!) as IFormSubmitValue)
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
      dispatch(editTitle({ newTitle, oldTitle: tier.title }));
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
        onPointerDown={(e) => handleMobileDraggable(e)}
        onPointerUp={(e) => handleMobileDraggable(e)}
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
              getTiersSectionRect={getTiersSectionRect}
              getTilesSectionRect={getTilesSectionRect}
              tier={tier}
              tile={iTile!}
              // removeTileFromTiles={removeTileFromTiles}
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
          onClick={dispatchRemoveTier}
          size={30}
          color="rgb(130, 130, 130)"
        />
      </footer>
    </li>
  );
};

export default Tier;
