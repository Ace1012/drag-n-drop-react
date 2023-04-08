import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ITier, ITile } from "../App";
import { tiersSlice } from "./tiersSlice";

export interface TilesSliceState {
  tiles: ITile[];
}

interface RemoveTileFromTierParams {
  parentTier: ITier;
  tile: ITile;
}

interface MutateTilesParams {
  originTile: ITile;
  destinationTile: ITile;
  delta: number;
  destinationParentTier: ITier | null;
  originParentTier: ITier | null;
}

interface PositionTilesParams {
  originTile: ITile;
  destinationTile: ITile;
  delta: number;
}

const initialTiles: TilesSliceState = {
  tiles: [
    {
      id: "tiledkajdbjahkdnaklsdasadada",
      name: "A",
    },
    {
      id: "tilealsbdalkjdblkajdnalkdjns",
      name: "B",
    },
  ],
};

export const tilesSlice = createSlice({
  name: "Tiles",
  initialState: initialTiles,
  reducers: {
    overrideTiles: (state, action: PayloadAction<ITile[]>) => {
      state.tiles = action.payload;
    },
    removeTileFromTiles: (state, action: PayloadAction<string>) => {
      state.tiles = [...state.tiles.filter(({ id }) => id !== action.payload)];
    },
    deleteAllTiles: (state, action: PayloadAction) => {
      state.tiles = [];
    },
    addTiles: (state, action: PayloadAction<ITile | ITile[]>) => {
      if (Array.isArray(action.payload)) {
        state.tiles = [...state.tiles, ...action.payload];
      } else {
        state.tiles = [...state.tiles, action.payload];
      }
    },
    positionTileInTiles: (
      state,
      {
        payload: { originTile, destinationTile, delta },
      }: PayloadAction<PositionTilesParams>
    ) => {
      state.tiles = [...state.tiles.filter(({ id }) => id !== originTile.id)];
      const index = state.tiles.findIndex(
        ({ id }) => id === destinationTile.id
      );
      if (delta <= 0) {
        state.tiles.splice(index, 0, originTile);
      } else {
        state.tiles.splice(index + 1, 0, originTile);
      }
    },
    mutateTiles: (
      state,
      {
        payload: {
          originParentTier,
          originTile,
          destinationParentTier,
          destinationTile,
          delta,
        },
        type,
      }: PayloadAction<MutateTilesParams>
    ) => {
      if (destinationParentTier) {
        if (originParentTier) {
          //Executed when a tile within a tier is dragged on top of another tile within a tier.
          console.log("TT -> TT");
          if (originParentTier.title === destinationParentTier.title) {
          }
        } else {
          //Executed when a tier-less tile is dragged on top of a tile within a tier.
          console.log("T -> TT");
          tilesSlice.caseReducers.removeTileFromTiles(state, {
            payload: originTile.id,
            type,
          });
        }
      } else {
        if (originParentTier) {
          //Executed when a tile within a tier is dragged on top of a tier-less tile.
          console.log("TT -> T");
          tilesSlice.caseReducers.positionTileInTiles(state, {
            payload: { originTile, destinationTile, delta },
            type,
          });
        } else {
          //Executed when a tier-less tile is dragged on top of another tier-less tile.
          console.log("T -> T");
          tilesSlice.caseReducers.positionTileInTiles(state, {
            payload: { originTile, destinationTile, delta },
            type,
          });
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(tiersSlice.actions.addTileToTier, (state, action) => {
        tilesSlice.caseReducers.removeTileFromTiles(state, {
          payload: action.payload.dragTile.id,
          type: action.type,
        });
      })
      .addCase(tiersSlice.actions.removeTierChild, (state, action) => {
        const tile = action.payload.childTile;
        console.log(tile);
        if (tile) {
          tilesSlice.caseReducers.addTiles(state, {
            payload: tile,
            type: action.type,
          });
        }
      })
      .addCase(tiersSlice.actions.deleteAllTiers, (state, action) => {
        const tiles: ITile[] = action.payload.reduce((tiles, tier) => {
          return [...tiles, ...tier.children];
        }, [] as ITile[]);

        tilesSlice.caseReducers.addTiles(state, {
          type: action.type,
          payload: tiles,
        });
      })
      .addCase(tiersSlice.actions.removeTier, (state, actions) => {
        const tiles: ITile[] = actions.payload.children;
        tilesSlice.caseReducers.addTiles(state, {
          type: actions.type,
          payload: tiles,
        });
      });
  },
});
