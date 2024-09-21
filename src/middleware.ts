import { defineMiddleware } from "astro:middleware";

const IMAGES_API_URL = 'https://build.slovyagin.com';

async function fetchImages() {
  const response = await fetch(IMAGES_API_URL, {
        method: 'GET',
        headers: {
          'X-API-Key': import.meta.env.API_SECRET_KEY,
          'Content-Type': 'application/json'
        }
      });
  if (!response.ok) {
    throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (!context.locals.images) {
    try {
      context.locals.images = await fetchImages();
    } catch (error) {
      console.error('Error fetching images:', error);
      context.locals.images = [];
    }
  }

  return next();
});
