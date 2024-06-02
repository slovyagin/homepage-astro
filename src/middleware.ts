import { createHash } from "node:crypto";
import { defineMiddleware } from "astro:middleware";
import { v2 as cloudinary } from "cloudinary";
import type { Image } from "./types";
import { invertColor } from "./middleware/invert-color";
import { shuffle } from "./middleware/shuffle";
import { CLOUDFLARE_API_URL } from "./constants";

let images: Array<Image> = [];
const BASELINE_SIZE = 1400;
const RESPONSIVE_SIZE = 1100;
const CLOUDINARY_API_KEY =
  import.meta.env.CLOUDINARY_API_KEY ?? process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET =
  import.meta.env.CLOUDINARY_API_SECRET ?? process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_CLOUD_NAME =
  import.meta.env.CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_FOLDER_PREFIX =
  import.meta.env.CLOUDINARY_FOLDER_PREFIX ??
  process.env.CLOUDINARY_FOLDER_PREFIX;
const CLOUDFLARE_ACCOUNT_ID =
  import.meta.env.CLOUDFLARE_ACCOUNT_ID ?? process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_RESOURCES_KV_ID =
  import.meta.env.CLOUDFLARE_RESOURCES_KV_ID ??
  process.env.CLOUDFLARE_RESOURCES_KV_ID;
const CLOUDFLARE_IMAGES_KV_KEY_NAME =
  import.meta.env.CLOUDFLARE_IMAGES_KV_KEY_NAME ??
  process.env.CLOUDFLARE_IMAGES_KV_KEY_NAME;
const CLOUDFLARE_RESOURCES_HASH_KV_KEY_NAME =
  import.meta.env.CLOUDFLARE_RESOURCES_HASH_KV_KEY_NAME ??
  process.env.CLOUDFLARE_RESOURCES_HASH_KV_KEY_NAME;
const CLOUDFLARE_RESOURCES_KV_BEARER =
  import.meta.env.CLOUDFLARE_RESOURCES_KV_BEARER ??
  process.env.CLOUDFLARE_RESOURCES_KV_BEARER;

console.time("Reading Cloudflare KV");
const [kvHash, kvImages] = await Promise.all([
  fetch(
    `${CLOUDFLARE_API_URL}/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_RESOURCES_KV_ID}/values/${CLOUDFLARE_RESOURCES_HASH_KV_KEY_NAME}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CLOUDFLARE_RESOURCES_KV_BEARER}`,
      },
    }
  )
    .then((res) => {
      if (res.ok) {
        return res.text();
      }
      throw res.statusText;
    })
    .catch((error) => console.error("kvHash", error)),
  fetch(
    `${CLOUDFLARE_API_URL}/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_RESOURCES_KV_ID}/values/${CLOUDFLARE_IMAGES_KV_KEY_NAME}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CLOUDFLARE_RESOURCES_KV_BEARER}`,
      },
    }
  )
    .then<Array<Image>>((res) => {
      if (res.ok) {
        return res.json();
      }
      throw res.statusText;
    })
    .catch((error) => console.error("kvImages", error)),
]);
console.timeEnd("Reading Cloudflare KV");

if (!kvImages) {
  console.error("Failed to fetch images from Cloudflare KV");
  process.exit(1);
}

if (import.meta.env.MODE === "production") {
  cloudinary.config({
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    cloud_name: CLOUDINARY_CLOUD_NAME,
    secure: true,
  });

  try {
    console.time("Fetching images from Cloudinary");
    const { resources } = await cloudinary.api.resources({
      context: true,
      max_results: 500,
      metadata: true,
      prefix: CLOUDINARY_FOLDER_PREFIX,
      type: "upload",
    });
    console.timeEnd("Fetching images from Cloudinary");

    const hash = createHash("sha256");
    hash.update(JSON.stringify(resources));
    const digestedHash = hash.digest("hex");
    if (kvHash === digestedHash) {
      console.log("Cloudflare KV is up to date");
      images = kvImages;
    } else {
      console.log("kvHash", kvHash);
      console.log("digestedHash", digestedHash);
      console.log("Cloudflare KV is outdated");

      console.time("Applying Cloudinary transformations");
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
        const caption = res.image_metadata.Description ?? null;
        const assetId = res.asset_id.substring(0, 4);
        const image = {
          backgroundColor: color,
          caption,
          color: (invertColor(color) ? "black" : "white") as "black" | "white",
          height: res.height,
          id: caption
            ? `${caption.toLowerCase().replace(/, | /g, "-")}-${assetId}`
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
      console.timeEnd("Applying Cloudinary transformations");

      console.time("Updating Cloudflare KV");
      await fetch(
        `${CLOUDFLARE_API_URL}/${CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${CLOUDFLARE_RESOURCES_KV_ID}/bulk`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CLOUDFLARE_RESOURCES_KV_BEARER}`,
          },
          body: JSON.stringify([
            {
              key: CLOUDFLARE_RESOURCES_HASH_KV_KEY_NAME,
              value: digestedHash,
            },
            {
              key: CLOUDFLARE_IMAGES_KV_KEY_NAME,
              value: JSON.stringify(images),
            },
          ]),
        }
      )
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw res.statusText;
        })
        .catch((error) => console.error(error));
      console.timeEnd("Updating Cloudflare KV");
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
} else {
  images = kvImages;
}

const shuffled = shuffle(images);

export const onRequest = defineMiddleware((context, next) => {
  if (!context.locals.images) {
    context.locals.images = shuffled;
  }

  return next();
});
