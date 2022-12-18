import { KeyboardEvent, useEffect, useRef, useState } from "react";
import Container from "./components/container";
import Tile from "./components/tile";
import UseSnackbar from "./components/useSnackbar";

export interface ITier {
  title: string;
  children: ITile[];
}

export interface ITile {
  id: string;
  imageUrl?: string;
}

function App() {
  const inputTierRef = useRef<HTMLInputElement>(null);
  const inputTileRef = useRef<HTMLInputElement>(null);
  const tiersRef = useRef<HTMLUListElement>(null);
  const tilesRef = useRef<HTMLUListElement>(null);
  const tileCounter = useRef<number>(0);
  const tierCounter = useRef<number>(0);

  const [iTiers, setITiers] = useState<ITier[]>([
    { title: "default", children: [] },
  ]);
  const [iTiles, setITiles] = useState<ITile[]>([]);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const snackbarMessage = useRef("Drag tiles out of grey zone to remove");

  function handleTierInput() {
    console.log("########Handle tier input########");
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
    console.log("########Handle tile input########");
    const tileImageUrl = inputTileRef.current?.value!;
    if (tileImageUrl === "") return;
    const newTile = {
      id: `tile${tileCounter.current}`,
      assetsId: tileCounter.current++,
      imageUrl: `url(${tileImageUrl})`,
    } as ITile;
    console.log(newTile);
    setITiles((prevTiles) => [...prevTiles, newTile]);
    inputTileRef.current!.value = "";
  }

  function onInputEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && document.activeElement === inputTierRef.current) {
      handleTierInput();
    } else if (
      e.key === "Enter" &&
      document.activeElement === inputTileRef.current
    ) {
      handleTileInput();
    }
  }

  function triggerSnackbar(message:string){
    snackbarMessage.current = message;
    setIsSnackbarOpen(true);
  }

  return (
    <div className="app">
      {/* {isSnackbarOpen && <UseSnackbar message={snackbarMessage.current} setIsSnackbarOpen={setIsSnackbarOpen}/>} */}
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
                Tier title:{" "}
              </span>
              <input
                type="text"
                ref={inputTierRef}
                onKeyDown={(e) => onInputEnter(e)}
              />
            </label>
            <button onClick={() => handleTierInput()}>
              Click to add new tier
            </button>
          </div>
        </header>
        {iTiers.length > 0 ? (
          iTiers.map((iTier) => (
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
          ))
        ) : (
          <div className="no-tiers">No tiers</div>
        )}
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
                Tile image url:{" "}
              </span>
              <input
                type="text"
                ref={inputTileRef}
                onKeyDown={(e) => onInputEnter(e)}
              />
            </label>
            <button onClick={() => handleTileInput()}>
              Click to add new tile
            </button>
          </div>
        </header>
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
      </ul>
    </div>
  );
}

export default App;