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
