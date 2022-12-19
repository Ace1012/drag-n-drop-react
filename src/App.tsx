import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import Container from "./components/container";
import Tile from "./components/tile";
import UseSnackbar from "./components/useSnackbar";

export interface ITier {
  title: string;
  children: ITile[];
}

export interface ITile {
  id: string;
  name?: string;
  imageUrl?: string;
}

function App() {
  const inputTierRef = useRef<HTMLInputElement>(null);
  const inputTileUrlRef = useRef<HTMLInputElement>(null);
  const inputTileNameRef = useRef<HTMLInputElement>(null);
  const tiersRef = useRef<HTMLUListElement>(null);
  const tilesRef = useRef<HTMLUListElement>(null);
  const tileCounter = useRef<number>(0);
  const tierCounter = useRef<number>(0);

  const [iTiers, setITiers] = useState<ITier[]>([
    { title: "default", children: [] },
  ]);
  const [iTiles, setITiles] = useState<ITile[]>([]);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isNameDisabled, setIsNameDisabled] = useState(false);
  const [isUrlDisabled, setIsUrlDisabled] = useState(false);
  const snackbarMessage = useRef("Drag tiles out of grey zone to remove");

  function handleTierInput() {
    const tierTitle = inputTierRef.current?.value;
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

  function handleTileInput() {
    const tileImageUrl = inputTileUrlRef.current?.value;
    const tileName = inputTileNameRef.current?.value;
    if (tileImageUrl === "" && tileName === "") {
      alert("Fill in the name or paste a url");
      return;
    }
    if (
      iTiles.some(
        (tile) => tile.name === tileName || tile.imageUrl === tileImageUrl
      )
    ) {
      alert("Tile already exists");
      return;
    }

    let newTile: ITile = {
      id: "",
    };
    if (isNameDisabled) {
      newTile = {
        id: `tile${tileCounter.current++}`,
        imageUrl: `url(${tileImageUrl})`,
      };
    } else if (isUrlDisabled) {
      newTile = {
        id: `tile${tileCounter.current++}`,
        name: `${tileName}`,
      };
    }
    console.log(newTile);
    setITiles((prevTiles) => [...prevTiles, newTile]);
    inputTileUrlRef.current!.value = "";
    inputTileNameRef.current!.value = "";
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
    if (e.key === "Enter" && document.activeElement === inputTierRef.current) {
      handleTierInput();
    } else if (
      e.key === "Enter" &&
      (document.activeElement === inputTileNameRef.current ||
        document.activeElement === inputTileUrlRef.current)
    ) {
      handleTileInput();
    }
  }

  function triggerSnackbar(message: string) {
    snackbarMessage.current = message;
    setIsSnackbarOpen(true);
  }

  function clearTiers() {
    setITiers([]);
  }

  function clearTiles() {
    setITiles([]);
  }

  return (
    <div className="app">
      {isSnackbarOpen && (
        <UseSnackbar
          message={snackbarMessage.current}
          setIsSnackbarOpen={setIsSnackbarOpen}
        />
      )}
      <ul className="tier-section" ref={tiersRef}>
        <header>
          <div className="add-tier">
            <label>
              <span
                style={{
                  color: "lightgrey",
                  fontSize: "1.5rem",
                }}
              >
                Create tier:{" "}
              </span>
              <input
                type="text"
                ref={inputTierRef}
                onKeyDown={(e) => onInputEnterPressed(e)}
              />
            </label>
            <button onClick={() => handleTierInput()}>
              Click to add new tier
            </button>
          </div>
          <button onClick={clearTiers}>Delete all tiers</button>
        </header>
        {iTiers.length > 0 && (
          <div className="tiers">
            {iTiers.map((iTier) => (
              <Container
                key={`container${tierCounter.current++}`}
                tier={iTier}
                tiersRef={tiersRef}
                tilesRef={tilesRef}
                setITiers={setITiers}
                setITiles={setITiles}
                triggerSnackbar={triggerSnackbar}
                children={iTier.children}
              />
            ))}
          </div>
        )}
        {iTiers.length === 0 && <div className="no-tiers">No tiers</div>}
      </ul>
      <ul className="tile-section" ref={tilesRef}>
        <header>
          <div className="add-tile">
            <label>
              <span
                style={{
                  color: "lightgrey",
                  fontSize: "1.5rem",
                }}
              >
                Create tile:{" "}
              </span>
              <input
                type="text"
                ref={inputTileNameRef}
                disabled={isNameDisabled}
                placeholder="Enter tile name"
                onChange={(e) => onInputChange(e)}
                onKeyDown={(e) => onInputEnterPressed(e)}
              />
              OR
              <input
                type="text"
                ref={inputTileUrlRef}
                disabled={isUrlDisabled}
                placeholder="Paste image url here"
                onChange={(e) => onInputChange(e)}
                onKeyDown={(e) => onInputEnterPressed(e)}
              />
            </label>
            <button onClick={() => handleTileInput()}>
              Click to add new tile
            </button>
          </div>
          <button onClick={clearTiles}>Delete all tiles</button>
        </header>
        {iTiers.length > 0 && (
          <div className="tiles">
            {iTiles.map((iTile) => (
              <Tile
                key={`${iTile.id}`}
                tile={iTile}
                tiersRef={tiersRef}
                tilesRef={tilesRef}
                setITiers={setITiers}
                setITiles={setITiles}
              />
            ))}
          </div>
        )}
        {iTiles.length === 0 && <div className="no-tiles">No tiles</div>}
      </ul>
    </div>
  );
}

export default App;
