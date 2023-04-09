import React, { useEffect, useRef, useState } from "react";
import { ITier, ITile } from "../App";
import { FaTrash } from "react-icons/fa";
import { AiFillSetting } from "react-icons/ai";
import Tile, { Offsets } from "./tile";
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
  selectIsDragging,
  setDragTier,
  transferTile,
} from "../store/useStore";
import { useDispatch, useSelector } from "react-redux";
import { DataType } from "csstype";

export interface ICustomizationOptions {
  color: string;
  newTitle?: string;
}

export interface IStorageColorPresets {
  backgroundColor: string;
}

interface TierProps {
  tier: ITier;
  isPointerHandled: React.MutableRefObject<boolean>;
  getTiersSectionRect: () => DOMRect;
  getTilesSectionRect: () => DOMRect;
  // triggerSnackbar: (message: string) => void;
  children: ITile[];
}

const Tier = ({
  tier,
  isPointerHandled,
  getTiersSectionRect,
  getTilesSectionRect,
  // triggerSnackbar,
  children,
}: TierProps) => {
  const tierRef = useRef<HTMLLIElement>(null);
  const tierHeaderRef = useRef<HTMLLIElement>(null);
  const tierFooterRef = useRef<HTMLLIElement>(null);
  const contentAreaRef = useRef<HTMLUListElement>(null);
  const customMenuRef = useRef<HandleCustomizationMenuProps>(null);
  const customizationOptions = useRef<ICustomizationOptions>({
    color: "",
  });

  const dispatch = useDispatch();
  const { dragTier, dragTile } = useSelector(selectIsDragging);

  const [isDraggingThisTier, setIsDraggingThisTier] = useState(false);
  const [isCustomizationMenuOpen, setIsCustomizationMenuOpen] = useState(false);
  const [openColorPicker, setOpenColorPicker] = useState(false);
  const [tierBackgroundColor, setTierBackgroundColor] = useState(
    localStorage.getItem(tier.title)
      ? (JSON.parse(localStorage.getItem(tier.title)!) as IStorageColorPresets)
          .backgroundColor
      : "#212121"
  );

  function dragStart(e: React.DragEvent) {
    tierRef.current!.style.opacity = "0.5";
    e.dataTransfer.setData("tier", JSON.stringify(tier));
  }

  function dragEnd() {
    tierRef.current!.style.opacity = "";
  }

  function dragOver(e: React.DragEvent) {
    e.preventDefault();
    const tierRect = tierRef.current!.getBoundingClientRect();
    const tierMiddle = tierRect.top + tierRect.height / 2;
    const delta = e.clientY - tierMiddle;
    const isDraggingTier = e.dataTransfer.types.includes("tier");
    if (!isDraggingThisTier && isDraggingTier) {
      // console.log(tierBackgroundColor);
      if (delta <= 0) {
        console.log("Before");
        tierRef.current!.dataset.positon = "before";
        tierRef.current!.style.boxShadow = `inset -10px 15px 10px ${
          tierBackgroundColor === "#212121"
            ? "cyan"
            : `${tierBackgroundColor}55`
        }`;
        tierHeaderRef.current!.style.boxShadow = `inset 10px 15px 10px ${
          tierBackgroundColor === "#212121" ? "cyan" : tierBackgroundColor
        }`;
        tierFooterRef.current!.style.boxShadow = `inset 10px 15px 10px ${
          tierBackgroundColor === "#212121" ? "cyan" : tierBackgroundColor
        }`;
      } else {
        console.log("After");
        tierRef.current!.dataset.positon = "after";
        tierRef.current!.style.boxShadow = `inset 10px -15px 10px ${
          tierBackgroundColor === "#212121"
            ? "cyan"
            : `${tierBackgroundColor}55`
        }`;
        tierHeaderRef.current!.style.boxShadow = `inset 10px -15px 10px ${
          tierBackgroundColor === "#212121" ? "cyan" : tierBackgroundColor
        }`;
        tierFooterRef.current!.style.boxShadow = `inset 10px -15px 10px ${
          tierBackgroundColor === "#212121" ? "cyan" : tierBackgroundColor
        }`;
      }
    } else if (!isDraggingTier) {
      tierRef.current!.style.border = "1px solid yellow";
    }
  }

  function dragLeave(e: React.DragEvent) {
    console.log("Leaving");
    tierRef.current!.style.border = "";
    tierRef.current!.style.boxShadow = "";
    // tierContainerHeaderRef.current!.style.boxShadow =
    //   tierBackgroundColor === "#212121"
    //     ? ""
    //     : `inset 0 0 3em ${tierBackgroundColor}`;
    tierFooterRef.current!.style.boxShadow = "";
    contentAreaRef.current!.style.boxShadow = "";
    delete tierRef.current!.dataset.positon;
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
    tierRef.current!.removeAttribute("data-position");
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
    const tierRect = tierRef.current!.getBoundingClientRect();
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
    customizationOptions.current = {
      color: "",
    };

    setIsCustomizationMenuOpen(false);
    customMenuRef.current?.clearInputValue();
    customMenuRef.current?.editMenuScale("");
    customMenuRef.current?.editMenuOpacity("");
  }

  function changeBackgroundColor(newColor: string) {
    customizationOptions.current.color = newColor;
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

  function createTierShadow(e: React.PointerEvent<HTMLElement>) {
    const rect = tierRef.current!.getBoundingClientRect();
    const offsets: Offsets = {
      top: e.clientY - rect.top,
      left: e.clientX - rect.left,
    };
    dispatch(
      setDragTier({
        ...tier,
        offsets,
      })
    );

    const dragTierShadow = document.createElement("li");
    dragTierShadow.innerHTML = tierRef.current!.innerHTML;
    dragTierShadow.id = `tier-shadow${tier.title}`;
    dragTierShadow.classList.add("tier-container");
    dragTierShadow.style.transition = "none";
    dragTierShadow.style.position = "absolute";
    dragTierShadow.style.top = `${e.pageY - offsets.top}px`;
    dragTierShadow.style.left = `${e.pageX - offsets.left}px`;
    dragTierShadow.style.pointerEvents = "none";
    dragTierShadow.style.width = `${rect.width}px`;
    dragTierShadow.style.height = `${rect.height}px`;
    dragTierShadow.style.opacity = "0.5";
    document.body.append(dragTierShadow);
  }

  function releasePointer(e: React.PointerEvent<HTMLElement>) {
    console.log("Releasing pointer");
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function handleMobilePointerDown(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse") {
      releasePointer(e);
      createTierShadow(e);
      tierRef.current!.style.border = `5px solid ${tierBackgroundColor}`;
      tierHeaderRef.current!.style.boxShadow = "none";
    }
  }

  function handleMobilePointerUp(e: React.PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse") {
      setIsDraggingThisTier(false);
      tierRef.current!.style.border = "";
      tierRef.current!.style.boxShadow = "";
      tierHeaderRef.current!.style.backgroundColor = "";
      tierFooterRef.current!.style.backgroundColor = "";
      tierHeaderRef.current!.style.border = "";
      tierHeaderRef.current!.style.boxShadow =
        tierBackgroundColor === "#212121"
          ? ""
          : `inset 0 0 0.1em 0.3em ${tierBackgroundColor}`;
    }
  }

  function handleMobileOnDropTile(e: React.PointerEvent<HTMLUListElement>) {
    if (e.pointerType !== "mouse") {
      if (dragTile) {
        if (dragTile.parentTier) {
          if (
            dragTile.parentTier.title !== tier.title &&
            !isPointerHandled.current
          ) {
            console.log("Tier: Transferring tile");
            dispatch(
              transferTile({
                destinationTier: tier,
                originTier: dragTile.parentTier,
                tile: dragTile,
              })
            );
          }
        } else {
          console.log("Tier: Adding tile");
          dispatch(
            addTileToTier({ destinationTierTitle: tier.title, dragTile })
          );
        }
      }
    }
  }

  function handleDraggable(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    if (e.type === "mouseenter") {
      setIsDraggingThisTier(true);
      tierRef.current!.style.border = `5px solid ${tierBackgroundColor}`;
      tierHeaderRef.current!.style.boxShadow = "none";
    }
    if (e.type === "mouseleave") {
      setIsDraggingThisTier(false);
      tierRef.current!.style.border = "";
      tierRef.current!.style.boxShadow = "";
      tierHeaderRef.current!.style.backgroundColor = "";
      tierFooterRef.current!.style.backgroundColor = "";
      tierHeaderRef.current!.style.border = "";
      tierHeaderRef.current!.style.boxShadow =
        tierBackgroundColor === "#212121"
          ? ""
          : `inset 0 0 0.1em 0.3em ${tierBackgroundColor}`;
    }
  }

  function handleNewTitle(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.value !== "") {
      customizationOptions.current.newTitle = e.target.value;
    } else {
      customizationOptions.current = {
        color: "",
      };
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let colorPresets = localStorage.getItem(tier.title)
      ? (JSON.parse(localStorage.getItem(tier.title)!) as ICustomizationOptions)
      : null;
    if (
      customizationOptions.current.color !== "" &&
      customizationOptions.current.color !== "#212121"
    ) {
      localStorage.setItem(
        `${tier.title}`,
        JSON.stringify({ backgroundColor: customizationOptions.current.color })
      );
    } else if (!colorPresets) {
      localStorage.removeItem(tier.title);
    }
    if (customizationOptions.current.color !== "") {
      let newColor = customizationOptions.current.color;
      setTierBackgroundColor(newColor);
    }
    /**
     * Change title
     */
    if (customizationOptions.current.newTitle) {
      let newTitle = customizationOptions.current.newTitle;
      if (colorPresets) {
        localStorage.removeItem(tier.title);
        localStorage.setItem(newTitle, JSON.stringify(colorPresets));
      }
      dispatch(editTitle({ newTitle, oldTitle: tier.title }));
    }
    closeMenu();
  }

  function colorToRGB(color: DataType.Color) {
    const canvas = document.createElement("canvas");
    const canvasContext = canvas.getContext("2d");
    canvasContext!.fillStyle = color;
    const fillStyle = canvasContext!.fillStyle;
    canvas.remove();
    // console.log(fillStyle);
    return fillStyle;
  }

  /**
   * Convert rgb value(rgb(154, 205, 50)) to hex #9acd32
   *
   * @param rgb
   * @returns
   */
  function computeHex(rgb: string) {
    let arr = rgb.substring(4, rgb.length - 1).split(", ");
    const hex = arr.reduce((hex, num) => {
      return hex.concat(parseInt(num).toString(16));
    }, "#");
    console.log(`HEX: ${hex}`);
    return hex;
  }

  /**
   * Code inspired by:
   *    - https://stackoverflow.com/a/35970186/6017598
   *    - https://stackoverflow.com/a/3943023/6017598
   *
   * @param hex
   * @returns
   */
  function calculateTextColor(hex: string) {
    hex = hex.substring(1);
    const [red, green, blue] = [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
    return red * 0.299 + green * 0.587 + blue * 0.114 > 120
      ? "#000000"
      : "#FFFFFF";
    // return red * 0.5 + green * 0.5 + blue * 0.5 >= 127.5 ? "#000000" : "#FFFFFF";
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
      tierHeaderRef.current?.animate(keyframes, {
        duration: 2000,
        iterations: 1,
        easing: "ease-in-out",
      });
    }
  }, []);

  return (
    <li
      className="tier-container"
      ref={tierRef}
      draggable={isDraggingThisTier}
      onDrop={onDrop}
      onDragStart={(e) => dragStart(e)}
      onDragEnd={dragEnd}
      onDragOver={(e) => dragOver(e)}
      onDragLeave={(e) => dragLeave(e)}
      style={{
        backgroundColor: `${tierBackgroundColor}`,
        // boxShadow: `8px 8px 10px ${tierBackgroundColor}`
        // backgroundColor: "#212121",
      }}
    >
      <header
        ref={tierHeaderRef}
        style={{
          boxShadow:
            tierBackgroundColor === "#212121"
              ? ""
              : `inset 0 0 0.1em 0.3em ${tierBackgroundColor}`,
        }}
        onMouseEnter={(e) => handleDraggable(e)}
        onMouseLeave={(e) => handleDraggable(e)}
        onPointerDown={(e) => handleMobilePointerDown(e)}
        onPointerUp={(e) => handleMobilePointerUp(e)}
        onDragLeave={(e) => e.stopPropagation()}
      >
        <span>{tier.title}</span>
      </header>
      <ul
        ref={contentAreaRef}
        onDragLeave={(e) => e.stopPropagation()}
        onPointerUp={handleMobileOnDropTile}
        style={{
          color: calculateTextColor(tierBackgroundColor),
        }}
        className={`content ${children.length > 0 ? "has-children" : ""}`}
      >
        {children.length > 0 ? (
          children.map((tile) => (
            <Tile
              key={`${tile!.id}`}
              getTiersSectionRect={getTiersSectionRect}
              getTilesSectionRect={getTilesSectionRect}
              tier={tier}
              tile={tile}
              isPointerHandled={isPointerHandled}
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
            styles={{
              default: {
                card: {
                  padding: "0.5rem",
                  justifyContent: "center",
                  backgroundColor: "rgba(245, 243, 243, 0.75)",
                  marginTop: "10vh",
                  borderRadius: "8px",
                },
              },
            }}
            onChange={(newColor) => {
              setOpenColorPicker(false);
              changeBackgroundColor(newColor.hex);
            }}
          />
        </div>
      )}
      <footer ref={tierFooterRef}>
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
