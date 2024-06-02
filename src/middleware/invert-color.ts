import { rgbToHsl } from "./rgb-to-hsl";

export const invertColor = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result) {
    return false;
  }

  const r = Number.parseInt(result[1] ?? "0", 16);
  const g = Number.parseInt(result[2] ?? "0", 16);
  const b = Number.parseInt(result[3] ?? "0", 16);

  return Number(rgbToHsl(r, g, b)[2]) > 0.5;
};
