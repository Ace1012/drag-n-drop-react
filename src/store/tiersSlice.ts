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

interface IPositionTileInTierParams {
  originTier: ITier | null;
  originTile: ITile;
  destinationTile: ITile;
  destinationTier: ITier;
  delta: number;
}

const initialTiers: TiersSliceState = {
  tiers: [
    {
      title: "default",
      children: [
        // {
        //   id: "tiledkajdbjahkdnaklsdasadada",
        //   name: "A",
        // },
      ],
    },
    // {
    //   title: "default2",
    //   children: [
    //     {
    //       id: "tiledkajdbjahkdnaklsdasadada",
    //       name: "A",
    //     },
    //     {
    //       id: "tilealsbdalkjdblkajdnalkdjns",
    //       name: "B",
    //     },
    //   ],
    // },
  ],
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
      state.tiers = state.tiers.filter(
        ({ title }) => title !== action.payload.title
      );
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
        if (delta && destinationTile) {
          if (delta <= 0) {
            children.splice(index, 0, dragTile);
          } else {
            children.splice(index + 1, 0, dragTile);
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
      const origin = state.tiers.find(
        ({ title }) => title === originTier.title
      );
      const destination = state.tiers.find(
        ({ title }) => title === destinationTier.title
      );

      if (origin && destination) {
        if (origin.title !== destination.title) {
          console.log(`Removing from: ${origin.title}`);
          origin.children = origin.children.filter(({ id }) => id !== tile.id);

          console.log(`Adding to: ${destination.title}`);
          destination.children = [...destination.children, tile];
        }
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
    positionTileInTier: (
      state,
      {
        payload: {
          originTier,
          originTile,
          destinationTier,
          destinationTile,
          delta,
        },
      }: PayloadAction<IPositionTileInTierParams>
    ) => {
      /**
       * Remove tile from previous parent if exists
       */
      if (originTier) {
        console.log(`Removing from ${originTier.title}`);
        const oldParentTier = state.tiers.find(
          ({ title }) => title === originTier.title
        );
        if (oldParentTier) {
          oldParentTier.children = oldParentTier.children.filter(({ id }) => {
            return id !== originTile.id;
          });
          console.log(oldParentTier.children.length);
        }
      }

      const tier = state.tiers.find(
        ({ title }) => title === destinationTier.title
      );

      if (tier) {
        tier.children = destinationTier.children.filter(
          ({ id }) => id !== originTile.id
        );
        const index = destinationTier.children.findIndex(
          ({ id }) => id === destinationTile.id
        );

        if (delta <= 0) {
          tier.children.splice(index, 0, originTile);
        } else {
          tier.children.splice(index + 1, 0, originTile);
        }
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
            tiersSlice.caseReducers.positionTileInTier(state, {
              payload: {
                originTier: originParentTier,
                destinationTier: destinationParentTier,
                originTile,
                destinationTile,
                delta,
              },
              type,
            });
          } else {
            const originTier = state.tiers.find(
              ({ title }) => title === originParentTier?.title
            );
            const destinationTier = state.tiers.find(
              ({ title }) => title === destinationParentTier?.title
            );

            if (originTier && destinationTier) {
              if (originParentTier) {
                tiersSlice.caseReducers.removeTierChild(state, {
                  payload: {
                    parentTierTitle: originParentTier.title,
                    childTile: originTile,
                  },
                  type,
                });
              }
              if (destinationParentTier) {
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
          }
        } else {
          console.log("Case 2");
          if (originParentTier) {
            tiersSlice.caseReducers.removeTierChild(state, {
              payload: {
                parentTierTitle: originParentTier.title,
                childTile: originTile,
              },
              type,
            });
          }
          if (destinationParentTier) {
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
      }
    );
  },
});
