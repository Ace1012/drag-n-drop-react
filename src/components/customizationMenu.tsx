import { forwardRef, useImperativeHandle, useRef } from "react";
import { ntc } from "../NameThatColor/NameThatColor";

export interface HandleCustomizationMenuProps {
  editMenuOpacity: (value: string) => void;
  editMenuScale: (value: string) => void;
  clearInputValue: () => void;
}

interface CustomizationMenuProps {
  tierBackgroundColor: string;
  openColorPicker: boolean;
  setOpenColorPicker: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit(e: React.FormEvent): void;
  handleNewTitle(e: React.ChangeEvent<HTMLInputElement>): void;
  closeMenu(): void;
}

const CustomizationMenu = forwardRef<
  HandleCustomizationMenuProps,
  CustomizationMenuProps
>(
  (
    {
      tierBackgroundColor,
      openColorPicker,
      setOpenColorPicker,
      handleSubmit,
      handleNewTitle,
      closeMenu,
    },
    ref
  ) => {
    const customizationMenuRef = useRef<HTMLFormElement>(null);
    const newTitleInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => {
      return {
        editMenuOpacity(value) {
          customizationMenuRef.current!.style.opacity = value;
        },
        editMenuScale(value) {
          customizationMenuRef.current!.style.scale = value;
        },
        clearInputValue() {
          newTitleInputRef.current!.value = "";
        },
      };
    });

    // function setInputPlaceholderColor(e: React.MouseEvent<HTMLInputElement>) {
    //   if (e.type === "mouseover") {
    //     newTitleInputRef.current!.classList.add(
    //       `${ntc.name(tierBackgroundColor.substring(1))[1].replace(/\s+/g, "")}`
    //     );
    //   }
    //   if (e.type === "mouseleave") {
    //     newTitleInputRef.current!.classList.remove(
    //       `${ntc.name(tierBackgroundColor.substring(1))[1].replace(/\s+/g, "")}`
    //     );
    //   }
    // }

    return (
      <form
        ref={customizationMenuRef}
        style={{
          boxShadow: `inset 0 0 1em ${tierBackgroundColor}`
        }}
        onSubmit={handleSubmit}
        className="customization-menu"
      >
        <button
          className="color-picker-toggler"
          disabled={openColorPicker}
          onClick={() => setOpenColorPicker(true)}
        >
          Pick a color
        </button>
        <input
          type="text"
          ref={newTitleInputRef}
          // onMouseOver={setInputPlaceholderColor}
          // onMouseLeave={setInputPlaceholderColor}
          onChange={handleNewTitle}
          placeholder="Enter new title"
        />
        <div>
          <button type="button" onClick={closeMenu}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </div>
      </form>
    );
  }
);

export default CustomizationMenu;
