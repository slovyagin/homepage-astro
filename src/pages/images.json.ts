import fs from "node:fs";

export async function GET() {
  try {
    const json = fs.readFileSync("public/remaining-images.json");

    return new Response(json);
  } catch (error) {
    // @ts-expect-error
    return new Response(JSON.stringify({ error: error?.message }), {
      status: 500,
      // @ts-expect-error
      statusText: error?.message,
    });
  }
}
