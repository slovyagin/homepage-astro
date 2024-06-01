/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    images: Array<{
      backgroundColor: string;
      caption: string;
      color: "black" | "white";
      height: number;
      id: string;
      responsiveUrl: string;
      url: string;
      width: number;
    }>;
  }
}
