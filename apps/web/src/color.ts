/** Represents an RGB color. Each component should be in the range 0-255. */
export interface ColorRgb {
  r: number;
  g: number;
  b: number;
}

export function randomRgb(): ColorRgb {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  };
}

export function toCssRgb({ r, g, b }: ColorRgb): string {
  return `rgb(${r}, ${g}, ${b})`;
}

export function fromCssHex(colorHex: string): ColorRgb {
  const hexParts = colorHex.substring(1).match(/.{2}/g);
  if (!colorHex.startsWith("#") || !hexParts || hexParts.length !== 3) {
    throw new Error(`Invalid color hex format '${colorHex}'`);
  }
  const [r, g, b] = hexParts.map((hex) => parseInt(hex, 16));
  return { r, g, b };
}

export function toCssHex({ r, g, b }: ColorRgb): string {
  function toHex(n: number) {
    return n.toString(16).padStart(2, "0");
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
