import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ITier, ITile } from "../App";
import { Offsets } from "../components/tile";

export type IDragTier = {
  aboveOrigin?: boolean;
} & ITier;

export type IDragTile = {
  tier?: ITier;
  offsets: Offsets;
} & ITile;

interface IsDraggingSliceState {
  dragTile: IDragTile | null;
  dragTier: IDragTier | null;
}

const initialState: IsDraggingSliceState = {
  dragTier: null,
  dragTile: null,
};

export const isDraggingSlice = createSlice({
  name: "IsDragging",
  initialState,
  reducers: {
    setDragTier: (state, action: PayloadAction<IDragTier | null>) => {
      state.dragTier = action.payload;
    },
    setDragTile: (state, action: PayloadAction<IDragTile | null>) => {
      state.dragTile = action.payload;
    },
  },
});
