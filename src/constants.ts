import {getCurrentYear} from "./utils";
import socialImage from "./assets/slovyagin.jpg";

export const profile = {
	description: `Selected Pictures: 2015\u200a–\u200a${getCurrentYear()}`,
	image: socialImage.src,
	title: "Bogdan Slovyagin",
	url: "https://www.slovyagin.com/",
} as const;
export const INITIAL_IMAGES_COUNT = 3;
export const MENCKEN = "https://use.typekit.net/af/062057/00000000000000007735b804/31/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3";

export const typeface = {
	name: 'Mencken',
	// fallback: 'Arial Narrow',
	url: MENCKEN,
	weight: 400,
	type: 'serif',
}
