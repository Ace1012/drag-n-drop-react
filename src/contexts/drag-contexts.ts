import { createContext } from "react";
import { ITier, ITile } from "../App";

type ITierMobileDragEvent = {
  dragTier: ITier | null;
  setDragTier: React.Dispatch<React.SetStateAction<ITier | null>>;
};

type ITileMobileDragEvent = {
  dragTile: ITile | null;
  setDragTile: React.Dispatch<React.SetStateAction<ITile | null>>;
};

export const TierMobileDragEvents = createContext<ITierMobileDragEvent | null>(
  null
);
export const TileMobileDragEvents = createContext<ITileMobileDragEvent | null>(
  null
);
