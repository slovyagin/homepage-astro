import { createHash } from "node:crypto";
import { defineMiddleware } from "astro:middleware";
import { v2 as cloudinary } from "cloudinary";
import type { Image } from "./types";

let images: Array<Image> = [];
const BASELINE_SIZE = 1400;
const RESPONSIVE_SIZE = 1100;
const CLOUDINARY_API_KEY =
  import.meta.env.CLOUDINARY_API_KEY ?? process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET =
  import.meta.env.CLOUDINARY_API_SECRET ?? process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_CLOUD_NAME =
  import.meta.env.CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDFLARE_ACCOUNT_ID =
  import.meta.env.CLOUDFLARE_ACCOUNT_ID ?? process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_RESOURCES_KV_ID =
  import.meta.env.CLOUDFLARE_RESOURCES_KV_ID ??
  process.env.CLOUDFLARE_RESOURCES_KV_ID;
const CLOUDFLARE_RESOURCES_KV_KEY_NAME =
  import.meta.env.CLOUDFLARE_RESOURCES_KV_KEY_NAME ??
  process.env.CLOUDFLARE_RESOURCES_KV_KEY_NAME;
const CLOUDFLARE_RESOURCES_HASH_KV_KEY_NAME =
  import.meta.env.CLOUDFLARE_RESOURCES_HASH_KV_KEY_NAME ??
  process.env.CLOUDFLARE_RESOURCES_HASH_KV_KEY_NAME;
const CLOUDFLARE_RESOURCES_KV_BEARER =
  import.meta.env.CLOUDFLARE_RESOURCES_KV_BEARER ??
  process.env.CLOUDFLARE_RESOURCES_KV_BEARER;

const kvHash = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_RESOURCES_KV_ID}/values/${CLOUDFLARE_RESOURCES_HASH_KV_KEY_NAME}`,
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CLOUDFLARE_RESOURCES_KV_BEARER}`,
    },
  }
).then((res) => res.text());
const kvImages = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_RESOURCES_KV_ID}/values/${CLOUDFLARE_RESOURCES_KV_KEY_NAME}`,
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CLOUDFLARE_RESOURCES_KV_BEARER}`,
    },
  }
).then((res) => res.json());

if (import.meta.env.MODE === "production") {
  cloudinary.config({
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    cloud_name: CLOUDINARY_CLOUD_NAME,
    secure: true,
  });

  try {
    console.log("Fetching images from Cloudinary...\n");
    const { resources } = await cloudinary.api.resources({
      context: true,
      max_results: 500,
      metadata: true,
      prefix: "photos",
      type: "upload",
    });
    console.log("\nImages fetched\n");

    const hash = createHash("sha256");
    hash.update(JSON.stringify(resources));
    const digestedHash = hash.digest("hex");

    if (kvHash === digestedHash) {
      console.log("Cloudflare KV is up to date\n");
      images = kvImages;
    } else {
      console.log("Applying Cloudinary transformations...\n");
      for await (const item of resources) {
        const res = await cloudinary.api.resource(item.public_id, {
          colors: true,
          image_metadata: true,
        });

        const url = cloudinary.url(res.public_id, {
          crop: "fit",
          format: "avif",
          height: BASELINE_SIZE,
          quality: "auto",
          width: BASELINE_SIZE,
        });

        const proxiedUrl = url.replace(
          `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`,
          "https://images.slovyagin.com/upload/"
        );

        const color = res.colors[3][0].toLowerCase();
        const desc = res.image_metadata.Description;
        const assetId = res.asset_id.substring(0, 4);

        const image = {
          backgroundColor: color,
          caption: desc ?? null,
          color: invertColor(color) ? "black" : ("white" as "black" | "white"),
          height: res.height,
          id: desc
            ? `${desc.toLowerCase().replace(/, | /g, "-")}-${assetId}`
            : `p-${assetId}`,
          responsiveUrl: proxiedUrl
            .replaceAll(`,w_${BASELINE_SIZE}`, `,w_${RESPONSIVE_SIZE}`)
            .replaceAll(`,h_${BASELINE_SIZE}`, `,h_${RESPONSIVE_SIZE}`)
            .replaceAll(",", "%2C"),
          url: proxiedUrl.replaceAll(",", "%2C"),
          width: res.width,
        };

        images.push(image);
      }
      console.log("Transformations applied\n");

      console.log("Updating Cloudflare KV...\n");
      await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_RESOURCES_KV_ID}/values/${CLOUDFLARE_RESOURCES_HASH_KV_KEY_NAME}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CLOUDFLARE_RESOURCES_KV_BEARER}`,
          },
          body: digestedHash,
        }
      );
      await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_RESOURCES_KV_ID}/values/${CLOUDFLARE_RESOURCES_KV_KEY_NAME}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CLOUDFLARE_RESOURCES_KV_BEARER}`,
          },
          body: JSON.stringify(images),
        }
      );
      console.log("Cloudflare KV updated\n");
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  function rgbToHsl(r: number, g: number, b: number) {
    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    let h: number;
    let s: number;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case red:
          h = (green - blue) / d + (green < blue ? 6 : 0);
          break;
        case green:
          h = (blue - red) / d + 2;
          break;
        case blue:
          h = (red - green) / d + 4;
          break;
      }
      // @ts-ignore
      h = h / 6;
    }

    return [h, s, l];
  }

  function invertColor(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (!result) {
      return false;
    }

    const r = Number.parseInt(result[1] ?? "0", 16);
    const g = Number.parseInt(result[2] ?? "0", 16);
    const b = Number.parseInt(result[3] ?? "0", 16);

    return Number(rgbToHsl(r, g, b)[2]) > 0.5;
  }
} else {
  const { default: sampleImages } = await import("./sample-images.json");

  images = sampleImages as Array<Image>;
}

function shuffle<T>(array: T[]) {
  let currentIndex = array.length;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // @ts-ignore
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

const shuffled = shuffle(images);

export const onRequest = defineMiddleware((context, next) => {
  if (!context.locals.images) {
    context.locals.images = shuffled;
  }

  return next();
});
