/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
	import type { Image } from "./types";
	interface Locals {
		images: Array<Image>;
	}
}
