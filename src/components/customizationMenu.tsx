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
          zIndex: isOpen ? "100" : "-1",
        }}
      >
        <form
          className="customization-menu"
          ref={customizationMenuRef}
          data-open={isOpen ? "true" : "false"}
          style={{
            boxShadow: `inset 0 0 2em ${tierBackgroundColor}`,
            top: parentTierTop,
            border: `1px solid ${calculateTextColor(tierBackgroundColor)}`,
          }}
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
          <div>
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
