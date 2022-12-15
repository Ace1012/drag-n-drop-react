import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { assets } from "./assests/assets";
import Container from "./components/container";
import Tile from "./components/tile";
import { ITier, ITile } from "./interfaces/interfaces";

function App() {
  const inputTierRef = useRef<HTMLInputElement>(null);
  const inputTileRef = useRef<HTMLInputElement>(null);
  const tiersRef = useRef<HTMLUListElement>(null);
  const tileCounter = useRef<number>(0);
  const tierCounter = useRef<number>(0);
  const currentTitle = useRef("");
  const closestDragTile = useRef<{ tile: ITile; rect: DOMRect } | null>(null);
  const closestDragTier = useRef<{ tier: ITier; rect: DOMRect } | null>(null);

  const [iTiers, setITiers] = useState<ITier[]>([
    { title: "default", children: [] },
  ]);
  const [iTiles, setITiles] = useState<ITile[]>([]);

  function initITiles() {
    const initTiles: ITile[] = [];
    for (tileCounter.current; tileCounter.current < 5; tileCounter.current++) {
      initTiles.push({
        id: `tile${String(tileCounter.current)}`,
        assetsId: tileCounter.current,
        // imageUrl: `https://source.unsplash.com/random/${tileCounter.current}`,
        imageUrl: `url(${assets[tileCounter.current]})`,
      } as ITile);
    }
    return initTiles;
  }

  function removeTier(title: string) {
    console.log("########Remove tier########");
    const tier = iTiers.find((tier) => tier.title === title)!;
    setITiles((prevTiles) => [...prevTiles, ...tier.children]);
    // addedTiles.current = addedTiles.current.filter((tile) =>
    //   tier.children.some((tierTile) => tierTile.id !== tile.id)
    // );
    setITiers((prev) => prev.filter((tier) => tier.title !== title));
    console.log("Removed tier");
  }

  function removeTile(tileId: string, parentTier?: ITier) {
    console.log("########Remove tile########");
    if (parentTier) {
      const tempTile = parentTier.children.find((tile) => tile.id === tileId)!;
      setITiers((prevTiers) =>
        prevTiers.map((tier) => {
          tier.children = [
            ...tier.children.filter((tile) => tile.id !== tileId),
          ];
          return tier;
        })
      );
      setITiles((prevTiles) => {
        if (prevTiles.some((tile) => tile.id === tempTile.id)) {
          return [...prevTiles];
        } else {
          return [...prevTiles, tempTile];
        }
      });
    }
  }

  function handleTierInput() {
    console.log("########Handle tier input########");
    const tierTitle = inputTierRef.current?.value;
    if (tierTitle === "") {
      alert("Cannot add empty tier");
    } else if (iTiers.some((tier) => tier.title === tierTitle)) {
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
    console.log("Image url", tileImageUrl);
    const newTile = {
      id: `tile${tileCounter.current}`,
      assetsId: tileCounter.current++,
      // imageUrl: `https://source.unsplash.com/random/${tileCounter.current}`,
      imageUrl: `url(${tileImageUrl})`,
    } as ITile;
    console.log(newTile);
    setITiles((prevTiles) => [...prevTiles, newTile]);
    inputTileRef.current!.value = "";
  }

  function onInputEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && document.activeElement === inputTierRef.current) {
      handleTierInput();
    }else if (e.key === "Enter" && document.activeElement === inputTileRef.current) {
      handleTileInput();
    }
  }

  function tileDrop(
    e: React.DragEvent,
    tileId: string,
    options?: { tier?: ITier }
  ) {
    console.log("########Tile drop########");
    updateTierDragOver(e);
    const iTile: ITile = options?.tier
      ? options.tier.children.find((tile) => tile.id === tileId)!
      : iTiles.find((tile) => tile.id === tileId)!;
    const tierRect = tiersRef.current!.getBoundingClientRect();
    const pointerPositon = { y: e.clientY, x: e.clientX };
    const currentTierTitle = currentTitle.current;
    const isOutsideTiers =
      tierRect.top > pointerPositon.y ||
      tierRect.bottom < pointerPositon.y ||
      tierRect.left > pointerPositon.x ||
      tierRect.right < pointerPositon.x;
    if (
      isOutsideTiers &&
      (iTiers.some((tier) =>
        tier.children.some((tile) => tile.id === tileId)
      ) ||
        currentTitle.current === "")
    ) {
      console.log("Drop condition 1");
      removeTile(tileId, options?.tier);
    } else if (options?.tier) {
      console.log("Drop condition 2");
      setITiers((prevTiers) =>
        prevTiers.map((tier) => {
          if (tier.title === options.tier?.title) {
            tier.children = [
              ...tier.children.filter((tile) => tile.id !== tileId),
            ];
          }
          if (tier.title === currentTierTitle) {
            tier.children = [...tier.children, iTile];
          }
          return tier;
        })
      );
    } else if (currentTitle.current === "") {
      console.log("Drop condition 3");
      return;
    } else {
      console.log("Drop condition 4");
      console.log("Removing from iTiles", iTile);
      console.log("iTiles length", iTiles.length);
      setITiles((prevTiles) =>
        prevTiles.length === 1
          ? []
          : prevTiles.filter((tile) => tile.id !== iTile.id)
      );
      setITiers((prevITiers) =>
        prevITiers.map((tier) => {
          if (tier.title === currentTierTitle) {
            tier.children = [...tier.children, iTile];
          }
          return tier;
        })
      );
    }
    closestDragTile.current && options?.tier
      ? reOrganizeTiles(e, iTile, currentTierTitle)
      : reOrganizeTiles(e, iTile);
    closestDragTile.current = null;
    currentTitle.current = "";
  }

  function reOrganizeTiles(
    e: React.DragEvent,
    dragTile: ITile,
    destinationTierTitle?: string
  ) {
    console.log("########Reorganize Tiles########");
    if (closestDragTile.current) {
      const tileRect = closestDragTile.current.rect;
      const tileMiddle = tileRect.left + tileRect.width / 2;
      const delta = e.clientX - tileMiddle;
      const closestTile = closestDragTile.current.tile;
      let index: number;

      if (destinationTierTitle) {
        console.log("Has parent");
        setITiers((prevTiers) =>
          prevTiers.map((tier) => {
            if (tier.title === destinationTierTitle) {
              index = tier.children.indexOf(closestTile);
              tier.children = [
                ...tier.children.filter((tile) => tile.id !== dragTile.id),
              ];
              if (delta <= 0) {
                //Place before
                tier.children.splice(index, 0, dragTile);
              } else {
                //place after
                tier.children.splice(index + 1, 0, dragTile);
              }
            }
            return tier;
          })
        );
      } else {
        console.log("No parent");
        let tempTiles: ITile[] = [];
        if (delta <= 0) {
          //Place before
          setITiles((prevTiles) => {
            console.log("Tiles while reorg before", prevTiles);
            if (prevTiles.length <= 1) {
              console.log("Place before less than 1");
              return prevTiles;
            }
            tempTiles = [
              ...prevTiles.filter((tile) => tile.id !== dragTile.id),
            ];
            index = tempTiles.indexOf(closestTile);
            tempTiles.splice(index, 0, dragTile);
            return tempTiles;
          });
        } else {
          //Place after
          setITiles((prevTiles) => {
            console.log("Tiles while reorg after", prevTiles);
            if (prevTiles.length <= 1) {
              console.log("Place after less than 1");
              return prevTiles;
            }
            tempTiles = [
              ...prevTiles.filter((tile) => tile.id !== dragTile.id),
            ];
            index = tempTiles.indexOf(closestTile);
            tempTiles.splice(index + 1, 0, dragTile);
            return tempTiles;
          });
        }
      }
    }
  }

  function reOrganizeTiers(e: React.DragEvent, dragTier: ITier) {
    console.log("########Reorganize Tiers########");
    if (!closestDragTier.current) return;
    const tierRect = closestDragTier.current.rect;
    const tierMiddle = tierRect.top + tierRect.height / 2;
    const delta = e.clientY - tierMiddle;
    const closestTier = closestDragTier.current.tier;
    let index: number;
    if (delta <= 0) {
      setITiers((prevTiers) => {
        let tempTiers = prevTiers.filter(
          (tier) => tier.title !== dragTier.title
        );
        index = tempTiers.indexOf(closestTier);
        tempTiers.splice(index, 0, dragTier);
        return tempTiers;
      });
    } else {
      setITiers((prevTiers) => {
        let tempTiers = prevTiers.filter(
          (tier) => tier.title !== dragTier.title
        );
        index = tempTiers.indexOf(closestTier);
        tempTiers.splice(index + 1, 0, dragTier);
        return tempTiers;
      });
    }
    closestDragTier.current = null;
  }

  function updateTierDragOver(e: React.DragEvent) {
    console.log("########Update Drag Over########");
    const tierRect = document
      .querySelector(".tier-section")!
      .getBoundingClientRect();
    const pointerPositon = { y: e.clientY, x: e.clientX };
    const isOutsideTiers =
      tierRect.top > pointerPositon.y ||
      tierRect.bottom < pointerPositon.y ||
      tierRect.left > pointerPositon.x ||
      tierRect.right < pointerPositon.x;
    if (isOutsideTiers) {
      console.log("###########\nOutside tiers\n###########");
      currentTitle.current = "";
    }
  }

  return (
    <div className="app">
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
              currentTitle={currentTitle}
              closestDragTile={closestDragTile}
              closestDragTier={closestDragTier}
              reOrganizeTiers={reOrganizeTiers}
              removeTier={removeTier}
              tileDrop={tileDrop}
              children={iTier.children}
            />
          ))
        ) : (
          <div className="no-tiers">No tiers</div>
        )}
      </ul>
      <div className="tile-section">
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
              closestDragTile={closestDragTile}
              tile={iTile}
              tileDrop={tileDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
