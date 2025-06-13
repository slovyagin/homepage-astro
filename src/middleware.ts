import {defineMiddleware} from "astro:middleware";
import {shuffle} from "./utils";

const IMAGES_API_URL = import.meta.env.PROD ? "https://build.slovyagin.com" : "https://build.slovyagin.com/dev";

async function fetchImages(page = 1) {
	const url = new URL(IMAGES_API_URL);
	url.searchParams.set("page", page.toString());

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"X-API-Key": import.meta.env.API_SECRET_KEY,
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(
			`Failed to fetch images: ${response.status} ${response.statusText}`
		);
	}

	return response.json();
}

async function fetchAllImages() {
	const {
		pagination: {total_pages},
		images,
	} = await fetchImages(1);

	return (
		await Promise.all([
			images,
			...Array.from(
				{
					length: total_pages - 1,
				},
				(_, i) => {
					const images = fetchImages(i + 2).then((page) => page.images);

					return images;
				}
			),
		])
	).flat();
}

const images = await fetchAllImages();
const shuffledImages = shuffle(images);

export const onRequest = defineMiddleware(async (context, next) => {
	if (!context.locals.images) {
		try {
			context.locals.images = shuffledImages
		} catch (error) {
			console.error("Error fetching images:", error);
			throw error;
		}
	}

	return next();
});
