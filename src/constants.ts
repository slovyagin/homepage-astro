import {getCurrentYear} from "./utils";
import socialImage from "./assets/slovyagin.jpg";

export const profile = {
	description: `Selected Pictures: 2015\u200a–\u200a${getCurrentYear()}`,
	sanitizedDescription: `Selected Pictures: 2015–${getCurrentYear()}`,
	image: socialImage.src,
	title: "Bogdan Slovyagin",
	url: "https://www.slovyagin.com/",
} as const;
export const INITIAL_IMAGES_COUNT = 3;
export const ADOBE_TYPEKIT_URL = "https://use.typekit.net/knh7hwy.css"
export const ASSETS_URL = "https://assets.slovyagin.com"
export const IMAGES_API_URL = "https://assets.slovyagin.com/api/images";
export const typeface = {
	name: 'mencken-std-narrow',
	fallback: 'Times',
	weight: 400,
	type: 'serif',
}
