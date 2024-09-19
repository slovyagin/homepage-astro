import { getCurrentYear } from "./utils";

export const PROFILE = {
  description: `Selected Pictures: 2015–${getCurrentYear()}`,
  image:
    "https://images.slovyagin.com/upload/v1630866054/homepage/191510530_lveoxs.jpg",
  title: "Bogdan Slovyagin",
  url: "https://www.slovyagin.com/",
} as const;
export const INITIAL_IMAGES_COUNT = 3 as const;
export const CLOUDFLARE_API_URL =
  "https://api.cloudflare.com/client/v4/accounts" as const;
export const FF_META_PRO_URL =
  "https://use.typekit.net/af/271842/0000000000000000000175cf/27/l?primer=388f68b35a7cbf1ee3543172445c23e26935269fadd3b392a13ac7b2903677eb&fvd=n6&v=3" as const;
export const MOBILE_SIZE = 700 as const;
export const BASELINE_SIZE = 900 as const;
export const LARGE_SIZE = 1400 as const;
