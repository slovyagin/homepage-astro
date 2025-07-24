import {getCurrentYear} from "./utils";
import socialImage from "./assets/slovyagin.jpg";

export const profile = {
	description: `Selected Pictures: 2015\u200a–\u200a${getCurrentYear()}`,
	image: socialImage.src,
	title: "Bogdan Slovyagin",
	url: "https://www.slovyagin.com/",
} as const;
export const INITIAL_IMAGES_COUNT = 3;
export const FONT_URL = "https://use.typekit.net/af/062057/00000000000000007735b804/31/l?primer=388f68b35a7cbf1ee3543172445c23e26935269fadd3b392a13ac7b2903677eb&fvd=n4&v=3";

export const typeface = {
	name: 'Mencken',
	fallback: null, //'Arial Narrow'
	url: FONT_URL,
	weight: 400,
	type: 'serif',
}
