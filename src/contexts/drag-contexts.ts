import { createContext } from "react";
import { ITier, ITile } from "../App";
import { Offsets } from "../components/tile";

export type IDragTier = {
  aboveOrigin?: boolean;
} & ITier;

export type IDragTile = {
  tier?: ITier;
  offsets: Offsets;
} & ITile;

type ITierMobileDragEvent = {
  dragTier: ITier | null;
  setDragTier: React.Dispatch<React.SetStateAction<ITier | null>>;
};

type ITileMobileDragEvent = {
  dragTile: IDragTile | null;
  setDragTile: React.Dispatch<React.SetStateAction<IDragTile | null>>;
};

export const TierMobileDragEvents = createContext<ITierMobileDragEvent | null>({
  dragTier: null,
  setDragTier: () => {},
});
export const TileMobileDragEvents = createContext<ITileMobileDragEvent | null>({
  dragTile: null,
  setDragTile: () => {},
});
