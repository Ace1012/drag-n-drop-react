import {
  ChangeEvent,
  KeyboardEvent,
  forwardRef,
  useRef,
  useState,
  useImperativeHandle,
  useEffect,
} from "react";
import Tile from "./tile";
import { ITier, ITile, ITileSectionForwardRefProps } from "../App";
import { v4 as uuid } from "uuid";

interface ITileSectionProps {
  iTiers: ITier[];
  setITiers: React.Dispatch<React.SetStateAction<ITier[]>>;
  iTiles: ITile[];
  setITiles: React.Dispatch<React.SetStateAction<ITile[]>>;
  revealMobileNav: boolean;
  setRevealMobileNav: React.Dispatch<React.SetStateAction<boolean>>;
  getTiersSectionRect: () => DOMRect;
  removeTileFromTier(tileId: string, parentTier: ITier): void;
  removeTileFromTiles(tileId: string): void;
}

const TileSection = forwardRef<ITileSectionForwardRefProps, ITileSectionProps>(
  (
    {
      iTiers,
      setITiers,
      iTiles,
      setITiles,
      revealMobileNav,
      setRevealMobileNav,
      getTiersSectionRect,
      removeTileFromTier,
      removeTileFromTiles,
    },
    ref
  ) => {
    const inputTileUrlRef = useRef<HTMLInputElement>(null);
    const inputTileNameRef = useRef<HTMLInputElement>(null);
    const tilesSectionRef = useRef<HTMLDivElement>(null);
    const tilesRef = useRef<HTMLUListElement>(null);

    const [isNameDisabled, setIsNameDisabled] = useState(false);
    const [isUrlDisabled, setIsUrlDisabled] = useState(false);

    function handleTileInput() {
      const tileImageUrl = inputTileUrlRef.current?.value;
      const tileName = inputTileNameRef.current?.value.toLowerCase();
      if (tileImageUrl === "" && tileName === "") {
        alert("Fill in the name or paste a url");
        return;
      }
      if (
        iTiles.some(
          (tile) =>
            tile.name?.toLowerCase() === tileName ||
            tile.imageUrl === `url(${tileImageUrl})`
        ) ||
        iTiers.some((tier) =>
          tier.children.some(
            (tile) =>
              tile.name?.toLowerCase() === tileName ||
              tile.imageUrl === `url(${tileImageUrl})`
          )
        )
      ) {
        alert("Tile already exists");
        inputTileUrlRef.current!.value = "";
        inputTileNameRef.current!.value = "";
        setIsNameDisabled(false);
        setIsUrlDisabled(false);
        return;
      }

      let newTile: ITile = {
        id: "",
      };
      if (isNameDisabled) {
        newTile = {
          id: `tile${uuid()}`,
          imageUrl: `url(${tileImageUrl})`,
        };
      } else if (isUrlDisabled) {
        newTile = {
          id: `tile${uuid()}`,
          name: `${tileName}`,
        };
      }
      inputTileUrlRef.current!.value = "";
      inputTileNameRef.current!.value = "";
      setITiles((prevTiles) => [...prevTiles, newTile]);
      setIsNameDisabled(false);
      setIsUrlDisabled(false);
    }

    function onInputChange(e: ChangeEvent<HTMLInputElement>) {
      if (
        e.currentTarget === inputTileNameRef.current &&
        !inputTileNameRef.current!.disabled &&
        !inputTileUrlRef.current!.disabled
      ) {
        setIsUrlDisabled(true);
      } else if (
        e.currentTarget === inputTileUrlRef.current &&
        !inputTileNameRef.current!.disabled &&
        !inputTileUrlRef.current!.disabled
      ) {
        setIsNameDisabled(true);
      }
      if (
        !inputTileNameRef.current!.disabled &&
        inputTileNameRef.current!.value.length === 0
      ) {
        setIsUrlDisabled(false);
      } else if (
        !inputTileUrlRef.current!.disabled &&
        inputTileUrlRef.current!.value.length === 0
      ) {
        setIsNameDisabled(false);
      }
    }

    function onInputEnterPressed(e: KeyboardEvent<HTMLInputElement>) {
      if (
        e.key === "Enter" &&
        (document.activeElement === inputTileNameRef.current ||
          document.activeElement === inputTileUrlRef.current)
      ) {
        handleTileInput();
      }
    }

    function getTilesSectionRect() {
      return tilesSectionRef.current!.getBoundingClientRect();
    }

    useImperativeHandle(ref, () => ({
      returnTilesRect() {
        return tilesSectionRef.current!.getBoundingClientRect();
      },
      returnMobileTilesRect() {
        return tilesRef.current!.getBoundingClientRect();
      },
    }));

    return (
      <div className="tile-section" ref={tilesSectionRef}>
        <header>
          <div className="inputs">
            <label>
              <input
                type="text"
                enterKeyHint="done"
                ref={inputTileNameRef}
                disabled={isNameDisabled}
                placeholder="Enter tile name"
                onChange={(e) => onInputChange(e)}
                onKeyDown={(e) => onInputEnterPressed(e)}
              />
            </label>
            <span>OR</span>
            <label>
              <input
                type="text"
                enterKeyHint="done"
                ref={inputTileUrlRef}
                disabled={isUrlDisabled}
                placeholder="Paste image url here"
                onChange={(e) => onInputChange(e)}
                onKeyDown={(e) => onInputEnterPressed(e)}
              />
            </label>
          </div>
          <div className="controls">
            <button onClick={() => handleTileInput()}>
              Click to add new tile
            </button>
            <button onClick={() => setITiles([])}>Delete all tiles</button>
          </div>
        </header>
        {iTiles.length === 0 ? (
          <div className="no-tiles">No tiles</div>
        ) : (
          <ul
            className="tiles"
            ref={tilesRef}
            onPointerDown={() => {
              if (revealMobileNav) {
                console.log("Made false");
                setRevealMobileNav(false);
              }
            }}
            onPointerMove={() => {}}
          >
            {revealMobileNav && (
              <div className="swipe-section">&larr;{` Swipe here `}&rarr;</div>
            )}
            {iTiles.map((iTile) => (
              <Tile
                key={`${iTile.id}`}
                tile={iTile}
                getTiersSectionRect={getTiersSectionRect}
                getTilesSectionRect={getTilesSectionRect}
                setITiers={setITiers}
                setITiles={setITiles}
                removeTileFromTier={removeTileFromTier}
                removeTileFromTiles={removeTileFromTiles}
              />
            ))}
          </ul>
        )}
      </div>
    );
  }
);

export default TileSection;
