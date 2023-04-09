import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ITier, ITile } from "../App";
import { Offsets } from "../components/tile";

export type IDragTier = {
  aboveOrigin?: boolean;
  offsets: Offsets;
} & ITier;

export type IDragTile = {
  parentTier: ITier | null;
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
      // console.log("Setting dragTier")
      state.dragTier = action.payload;
    },
    setDragTile: (state, action: PayloadAction<IDragTile | null>) => {
      // console.log("Setting dragTile")
      state.dragTile = action.payload;
    },
  },
});
