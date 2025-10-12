import {defineMiddleware} from "astro:middleware";
import {shuffle} from "./utils";
import {IMAGES_API_URL} from "./constants.ts";

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

async function fetchAllImages(secretKey: string) {
	let allImages: any[] = [];
	let cursor: string | undefined = undefined;

	do {
		const data = await fetchImages(secretKey, cursor);
		allImages = allImages.concat(data.images);
		cursor = data.hasMore ? data.cursor : undefined;
	} while (cursor);

	return allImages;
}

export const onRequest = defineMiddleware(async (context, next) => {
	try {
		if (!context.locals.images) {
			const images = await fetchAllImages(import.meta.env.API_SECRET_KEY);

			context.locals.images = shuffle(images);
		}
	} catch (error) {
		console.error("Error fetching images:", error);
		throw error;
	}

	return next();
});
