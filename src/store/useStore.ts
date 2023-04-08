import { configureStore } from "@reduxjs/toolkit";
import { tiersSlice } from "./tiersSlice";
import { tilesSlice } from "./tilesSlice";

type RootType = ReturnType<typeof store.getState>;

/**
 * Redux store
 */
export const store = configureStore({
  reducer: {
    tiers: tiersSlice.reducer,
    tiles: tilesSlice.reducer,
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

/**
 * Selectors
 */
export const selectTiers = (state: RootType) => state.tiers.tiers;
export const selectTiles = (state: RootType) => state.tiles.tiles;
