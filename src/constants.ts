import { getCurrentYear } from "./utils";
import socialImage from "./assets/slovyagin.jpg";

export const PROFILE = {
  description: `Selected Pictures: 2015–${getCurrentYear()}`,
  image: socialImage.src,
  title: "Bogdan Slovyagin",
  url: "https://www.slovyagin.com/",
} as const;
export const INITIAL_IMAGES_COUNT = 3;
export const FF_META_PRO_URL =
  "https://use.typekit.net/af/271842/0000000000000000000175cf/27/l?primer=388f68b35a7cbf1ee3543172445c23e26935269fadd3b392a13ac7b2903677eb&fvd=n6&v=3";
