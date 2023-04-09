import { forwardRef, useImperativeHandle, useRef } from "react";
import { ntc } from "../NameThatColor/NameThatColor";
import ReactDOM from "react-dom";

export interface HandleCustomizationMenuProps {
  editMenuOpacity: (value: string) => void;
  editMenuScale: (value: string) => void;
  clearInputValue: () => void;
}

interface CustomizationMenuProps {
  tierBackgroundColor: string;
  openColorPicker: boolean;
  parentTierTop: number;
  isOpen: boolean;
  setOpenColorPicker: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit(e: React.FormEvent): void;
  handleNewTitle(e: React.ChangeEvent<HTMLInputElement>): void;
  calculateTextColor(hex: string): "#000000" | "#FFFFFF";
  closeMenu(): void;
}

const CustomizationMenu = forwardRef<
  HandleCustomizationMenuProps,
  CustomizationMenuProps
>(
  (
    {
      parentTierTop,
      tierBackgroundColor,
      openColorPicker,
      isOpen,
      setOpenColorPicker,
      handleSubmit,
      handleNewTitle,
      calculateTextColor,
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

    return ReactDOM.createPortal(
      <div
        className="customization-menu-overlay"
        style={{
          visibility: isOpen ? "visible" : "hidden",
          opacity: isOpen ? 1 : 0,
          boxShadow: `inset 0 0 1rem 0.5rem ${tierBackgroundColor}`,
        }}
        onClick={closeMenu}
      >
        <form
          className="customization-menu"
          ref={customizationMenuRef}
          data-open={isOpen ? "true" : "false"}
          style={{
            boxShadow: `inset 0 0 2em ${tierBackgroundColor}`,
            top: `${parentTierTop + 50}px`,
            border: `1px solid ${calculateTextColor(tierBackgroundColor)}`,
          }}
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
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
            onChange={handleNewTitle}
            placeholder="Enter new title"
          />
          <div className="customization-controls">
            <button type="button" onClick={closeMenu}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>,
      document.getElementById("portal")!
    );
  }
);

export default CustomizationMenu;
