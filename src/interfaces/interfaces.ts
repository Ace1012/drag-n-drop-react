import { ReactNode } from "react";

export interface ITier {
  title: string;
  children:ITile[];
}

export interface ITile{
  id: string;
  assetsId:number;
  imageUrl: string;
}