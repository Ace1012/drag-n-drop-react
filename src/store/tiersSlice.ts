import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ITier, ITile } from "../App";
import { removeTileFromTiles } from "./useStore";
import { tilesSlice } from "./tilesSlice";

export interface TiersSliceState {
  tiers: ITier[];
}

interface AddTile {
  dragTile: ITile;
  destinationTile?: ITile;
  destinationTierTitle: string;
  delta?: number;
}

interface PositionTiersParams {
  originTier: ITier;
  destinationTier: ITier;
  delta: number;
}

interface TransferTileParams {
  tile: ITile;
  originTier: ITier;
  destinationTier: ITier;
}

interface EditTitleParams {
  oldTitle: string;
  newTitle: string;
}

const initialTiers: TiersSliceState = {
  tiers: [{ title: "default", children: [] }],
};

export const tiersSlice = createSlice({
  name: "tiers",
  initialState: initialTiers,
  reducers: {
    overrideTiers: (state, action: PayloadAction<ITier[]>) => {
      state.tiers = action.payload;
    },
    addTier: (state, action: PayloadAction<ITier>) => {
      state.tiers = [...state.tiers, action.payload];
    },
    removeTier: (state, action: PayloadAction<ITier>) => {
      state.tiers = [
        ...state.tiers.filter(({ title }) => title !== action.payload.title),
      ];
    },
    deleteAllTiers: (state, action: PayloadAction<ITier[]>) => {
      state.tiers = [];
    },
    addTileToTier: (
      state,
      {
        payload: { delta, destinationTierTitle, dragTile, destinationTile },
      }: PayloadAction<AddTile>
    ) => {
      const destinationTier = state.tiers.find(
        (tier) => tier.title === destinationTierTitle
      );

      if (destinationTier) {
        const children = destinationTier.children;
        const index = children.findIndex(
          ({ id }) => id === destinationTile?.id
        );
        console.log({ delta, index });
        console.log();
        if (delta && destinationTile) {
          if (delta <= 0) {
            console.log([...children]);
            children.splice(index, 0, dragTile);
            console.log([...children]);
          } else {
            console.log([...children]);
            children.splice(index + 1, 0, dragTile);
            console.log([...children]);
          }
        } else {
          destinationTier.children = [...destinationTier.children, dragTile];
        }
      }
    },
    removeTierChild: (
      state,
      {
        payload: { parentTierTitle, childTile },
      }: PayloadAction<{ parentTierTitle: string; childTile: ITile }>
    ) => {
      const parentTier = state.tiers.find(
        (tier) => tier.title === parentTierTitle
      );
      if (parentTier) {
        parentTier.children = parentTier.children.filter(
          (tile) => tile.id !== childTile.id
        );
      }
    },
    positionTier: (
      state,
      {
        payload: { originTier, destinationTier, delta },
      }: PayloadAction<PositionTiersParams>
    ) => {
      state.tiers = [
        ...state.tiers.filter(({ title }) => title !== originTier.title),
      ];
      const index = state.tiers.findIndex(
        ({ title }) => title === destinationTier.title
      );
      console.log({ index, delta });
      if (delta <= 0) {
        state.tiers.splice(index, 0, originTier);
      } else {
        state.tiers.splice(index + 1, 0, originTier);
      }
    },
    transferTile: (
      state,
      {
        payload: { tile, originTier, destinationTier },
      }: PayloadAction<TransferTileParams>
    ) => {
      console.log("Transferring tile!!!");
      const origin = state.tiers.find(
        ({ title }) => title === originTier.title
      );
      const destination = state.tiers.find(
        ({ title }) => title === destinationTier.title
      );

      if (origin) {
        origin.children = origin.children.filter(({ id }) => id !== tile.id);
      }

      if (destination) {
        destination.children = [...destination.children, tile];
      }
    },
    editTitle: (
      state,
      { payload: { newTitle, oldTitle } }: PayloadAction<EditTitleParams>
    ) => {
      const tier = state.tiers.find(({ title }) => oldTitle);

      if (tier) {
        tier.title = newTitle;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      tilesSlice.actions.mutateTiles,
      (
        state,
        {
          payload: {
            delta,
            destinationParentTier,
            destinationTile,
            originParentTier,
            originTile,
          },
          type,
        }
      ) => {
        if (originParentTier && destinationParentTier) {
          if (originParentTier.title === destinationParentTier.title) {
            const tier = state.tiers.find(
              ({ title }) => title === originParentTier?.title
            );

            if (tier) {
              const index = tier.children.findIndex(({ id }) => originTile.id);
              tier.children = tier.children.filter(
                ({ id }) => id !== originTile.id
              );
              if (delta <= 0) {
                tier.children.splice(index, 0, originTile);
              } else {
                tier.children.splice(index + 1, 0, originTile);
              }
            }
          }
        } else if (originParentTier) {
          tiersSlice.caseReducers.removeTierChild(state, {
            payload: {
              parentTierTitle: originParentTier.title,
              childTile: originTile,
            },
            type,
          });
        } else if (destinationParentTier) {
          tiersSlice.caseReducers.addTileToTier(state, {
            type,
            payload: {
              dragTile: originTile,
              destinationTile: destinationTile,
              destinationTierTitle: destinationParentTier.title,
              delta: delta ? delta : undefined,
            },
          });
        }
      }
    );
  },
});
