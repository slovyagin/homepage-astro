import {defineMiddleware} from "astro:middleware";
import {shuffle} from "./utils";
import {IMAGES_API_URL} from "./constants.ts";
import type {Image} from "./types.ts";

const images = await fetchAllImages(import.meta.env.API_SECRET_KEY);
const shuffledImages = shuffle(images);

export const onRequest = defineMiddleware(async (c, next) => {
	if (!c.locals.images) {
		c.locals.images = shuffledImages;
	}

	return next();
});

async function fetchImages(secretKey: string, cursor?: string) {
	const url = new URL(IMAGES_API_URL);

	if (cursor) {
		url.searchParams.set("cursor", cursor);
	}

	const response = await fetch(url.toString(), {
		method: "GET",
		headers: {
			"Authorization": `Bearer ${secretKey}`,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
	}

	return response.json();
}

async function fetchAllImages(secretKey: string): Promise<Image[]> {
	if (!secretKey) {
		console.error("API_SECRET_KEY is missing. Please set it in your .env file.");
		return [];
	}

	try {
		let allImages: Image[] = [];
		let cursor: string | undefined = undefined;

		do {
			const data = await fetchImages(secretKey, cursor);

			if (!data || !Array.isArray(data.images)) {
				console.error("Invalid API response:", data);
				return allImages;
			}

			allImages = allImages.concat(data.images);
			cursor = data.hasMore ? data.cursor : undefined;
		} while (cursor);

		if (allImages.length === 0) {
			console.warn("API returned 0 images");
		}

		return allImages;
	} catch (error) {
		console.error("Failed to fetch images:", error);
		return [];
	}
}
