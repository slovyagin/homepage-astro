import {getCurrentYear} from "./utils";
import socialImage from "./assets/slovyagin.jpg";

export const profile = {
	description: `Selected Pictures: 2015\u200a–\u200a${getCurrentYear()}`,
	image: socialImage.src,
	title: "Bogdan Slovyagin",
	url: "https://www.slovyagin.com/",
} as const;
export const INITIAL_IMAGES_COUNT = 3;
export const FRANKLIN_GOTHIC = "https://use.typekit.net/af/4e755e/00000000000000007735bbcb/31/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3";

const acumin = {
	name: 'Franklin GothicCompressed',
	fallback: 'Arial Narrow',
	url: FRANKLIN_GOTHIC,
	weight: 400,
	type: 'sans-serif',
}
export const typeface = acumin
