import {
  ChangeEvent,
  KeyboardEvent,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import { ITier, ITierSectionForwardRefProps, ITile } from "../App";
import { v4 as uuid } from "uuid";
import Tier from "./tier";
import { useDispatch, useSelector } from "react-redux/es/exports";
import { addTier, deleteAllTiers, selectTiers } from "../store/useStore";

interface ITierSectionProps {
  isPointerHandled: React.MutableRefObject<boolean>;
  getTilesSectionRect: () => DOMRect;
  calculateTextColor(hex: string): "#000000" | "#FFFFFF";
}

const TierSection = forwardRef<ITierSectionForwardRefProps, ITierSectionProps>(
  ({ isPointerHandled, getTilesSectionRect, calculateTextColor }, ref) => {
    const inputTierRef = useRef<HTMLInputElement>(null);
    const tiersSectionRef = useRef<HTMLDivElement>(null);
    const tiersRef = useRef<HTMLUListElement>(null);

    const dispatch = useDispatch();
    const tiers = useSelector(selectTiers);

    function handleTierInput() {
      const tierTitle = inputTierRef.current?.value.toLowerCase();
      if (tierTitle === "" || tierTitle === undefined) {
        alert("Cannot add empty tier");
      } else if (
        tiers.some(
          (tier) => tier.title.toLowerCase() === tierTitle?.toLowerCase()
        )
      ) {
        alert("Tier already exists");
      } else {
        dispatch(addTier({ title: tierTitle, children: [] }));
        inputTierRef.current!.value = "";
      }
    }

    function onInputEnterPressed(e: KeyboardEvent<HTMLInputElement>) {
      if (
        e.key === "Enter" &&
        document.activeElement === inputTierRef.current
      ) {
        handleTierInput();
      }
    }

    function getTiersSectionRect() {
      return tiersSectionRef.current!.getBoundingClientRect();
    }

    useImperativeHandle(ref, () => ({
      returnTiersRect() {
        return tiersSectionRef.current!.getBoundingClientRect();
      },
      returnMobileTiersRect() {
        return tiersRef.current!.getBoundingClientRect();
      },
    }));

    return (
      <div className="tier-section" ref={tiersSectionRef}>
        <header>
          <label>
            <input
              type="text"
              enterKeyHint="done"
              ref={inputTierRef}
              placeholder="Enter tier name"
              onKeyDown={(e) => onInputEnterPressed(e)}
            />
          </label>
          <div className="controls">
            <button onClick={() => handleTierInput()}>
              Click to add new tier
            </button>
            <button onClick={() => dispatch(deleteAllTiers(tiers))}>
              Delete all tiers
            </button>
          </div>
        </header>

        <ul className="tiers" ref={tiersRef}>
          {tiers.length === 0 ? (
            <div className="no-tiers">No tiers</div>
          ) : (
            tiers.map((iTier) => (
              <Tier
                key={`container${uuid()}`}
                tier={iTier}
                calculateTextColor={calculateTextColor}
                isPointerHandled={isPointerHandled}
                getTiersSectionRect={getTiersSectionRect}
                getTilesSectionRect={getTilesSectionRect}
                //   triggerSnackbar={triggerSnackbar}
                children={iTier.children}
              />
            ))
          )}
        </ul>
      </div>
    );
  }
);

export default TierSection;
