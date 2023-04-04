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

interface ITierSectionProps {
  iTiers: ITier[];
  setITiers: React.Dispatch<React.SetStateAction<ITier[]>>;
  iTiles: ITile[];
  setITiles: React.Dispatch<React.SetStateAction<ITile[]>>;
  getTilesSectionRect: () => DOMRect;
  clearTiers: () => void;
  removeTileFromTier(tileId: string, parentTier: ITier): void;
  removeTileFromTiles(tileId: string): void;
}

const TierSection = forwardRef<ITierSectionForwardRefProps, ITierSectionProps>(
  (
    {
      iTiers,
      setITiers,
      iTiles,
      setITiles,
      getTilesSectionRect,
      clearTiers,
      removeTileFromTier,
      removeTileFromTiles,
    },
    ref
  ) => {
    const inputTierRef = useRef<HTMLInputElement>(null);
    const tiersSectionRef = useRef<HTMLDivElement>(null);
    const tiersRef = useRef<HTMLUListElement>(null);

    function handleTierInput() {
      const tierTitle = inputTierRef.current?.value.toLowerCase();
      if (tierTitle === "") {
        alert("Cannot add empty tier");
      } else if (
        iTiers.some(
          (tier) => tier.title.toLowerCase() === tierTitle?.toLowerCase()
        )
      ) {
        alert("Tier already exists");
      } else {
        setITiers((prev) => [
          ...prev,
          { title: tierTitle, children: [] } as ITier,
        ]);
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
            <button onClick={clearTiers}>Delete all tiers</button>
          </div>
        </header>
        {iTiers.length === 0 ? (
          <div className="no-tiers">No tiers</div>
        ) : (
          <ul className="tiers" ref={tiersRef}>
            {iTiers.map((iTier) => (
              <Tier
                key={`container${uuid()}`}
                tier={iTier}
                getTiersSectionRect={getTiersSectionRect}
                getTilesSectionRect={getTilesSectionRect}
                setITiers={setITiers}
                setITiles={setITiles}
                //   triggerSnackbar={triggerSnackbar}
                removeTileFromTier={removeTileFromTier}
                removeTileFromTiles={removeTileFromTiles}
                children={iTier.children}
              />
            ))}
          </ul>
        )}
      </div>
    );
  }
);

export default TierSection;
