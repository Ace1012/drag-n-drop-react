import { configureStore } from "@reduxjs/toolkit";
import { tiersSlice } from "./tiersSlice";
import { tilesSlice } from "./tilesSlice";
import { isDraggingSlice } from "./isDraggingSlice";

type RootType = ReturnType<typeof store.getState>;

/**
 * Redux store
 */
export const store = configureStore({
  reducer: {
    tiers: tiersSlice.reducer,
    tiles: tilesSlice.reducer,
    isDragging: isDraggingSlice.reducer,
  },
});

/**
 * Actions
 */
export const {
  overrideTiers,
  addTier,
  removeTier,
  addTileToTier,
  removeTierChild,
  positionTier,
  transferTile,
  editTitle,
  deleteAllTiers,
} = tiersSlice.actions;

export const {
  overrideTiles,
  addTiles,
  removeTileFromTiles,
  positionTileInTiles,
  mutateTiles,
  deleteAllTiles,
} = tilesSlice.actions;

export const { setDragTier, setDragTile } = isDraggingSlice.actions;

/**
 * Selectors
 */
export const selectTiers = (state: RootType) => state.tiers.tiers;
export const selectTiles = (state: RootType) => state.tiles.tiles;
export const selectIsDragging = (state: RootType) => state.isDragging;
