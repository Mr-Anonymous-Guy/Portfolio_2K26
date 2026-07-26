export interface ColorPalette {
  id: string;
  name: string;
  contrastedHex: string;
  contrastedRgb: string;
  rootHex: string;
  rootRgb: string;
  description: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "ember",
    name: "Ember & Apricot",
    contrastedHex: "#ff004d",
    contrastedRgb: "255, 0, 77",
    rootHex: "#ffc6a8",
    rootRgb: "255, 198, 168",
    description: "Original Brand Signature",
  },
  {
    id: "cranberry",
    name: "Cranberry & Powder",
    contrastedHex: "#b51e4b",
    contrastedRgb: "181, 30, 75",
    rootHex: "#a8d8ea",
    rootRgb: "168, 216, 234",
    description: "Deep Ruby & Cool Air",
  },
  {
    id: "cobalt",
    name: "Cobalt & Apricot",
    contrastedHex: "#2455e6",
    contrastedRgb: "36, 85, 230",
    rootHex: "#ffb07c",
    rootRgb: "255, 176, 124",
    description: "Electric Blue & Warm Glow",
  },
  {
    id: "sienna",
    name: "Sienna & Mint",
    contrastedHex: "#b85c38",
    contrastedRgb: "184, 92, 56",
    rootHex: "#c7e8d5",
    rootRgb: "199, 232, 213",
    description: "Burnt Earth & Fresh Mint",
  },
];

export const DEFAULT_PALETTE_ID = "ember";

export function getPaletteById(id: string): ColorPalette {
  return COLOR_PALETTES.find((p) => p.id === id) || COLOR_PALETTES[0];
}
