export const FAVICON_FILES = [
  { size: 16, name: "favicon-16x16.png", purpose: "Browser tab" },
  { size: 32, name: "favicon-32x32.png", purpose: "Browser tab (HiDPI)" },
  { size: 48, name: "favicon-48x48.png", purpose: "Windows site icons" },
  { size: 180, name: "apple-touch-icon.png", purpose: "iOS home screen", opaque: true },
  { size: 192, name: "android-chrome-192x192.png", purpose: "Android / PWA" },
  { size: 512, name: "android-chrome-512x512.png", purpose: "PWA splash / install" },
];

// Sizes embedded in favicon.ico (as PNG images).
export const ICO_SIZES = [16, 32, 48];

/**
 * Where to take pixels from the source and where to draw them on a size×size
 * icon. "crop" fills the square with a centered square crop; "fit" keeps the
 * whole image and letterboxes it. `padding` is a fraction of the icon size.
 */
export function getIconLayout(sourceWidth, sourceHeight, size, { mode = "fit", padding = 0 } = {}) {
  const inner = Math.max(1, Math.round(size * (1 - 2 * padding)));
  if (mode === "crop") {
    const side = Math.min(sourceWidth, sourceHeight);
    const offset = Math.round((size - inner) / 2);
    return {
      crop: { x: (sourceWidth - side) / 2, y: (sourceHeight - side) / 2, width: side, height: side },
      dx: offset,
      dy: offset,
      dw: inner,
      dh: inner,
    };
  }
  const scale = Math.min(inner / sourceWidth, inner / sourceHeight);
  const dw = Math.max(1, Math.round(sourceWidth * scale));
  const dh = Math.max(1, Math.round(sourceHeight * scale));
  return {
    crop: { x: 0, y: 0, width: sourceWidth, height: sourceHeight },
    dx: Math.round((size - dw) / 2),
    dy: Math.round((size - dh) / 2),
    dw,
    dh,
  };
}

export function buildHtmlTags() {
  return [
    '<link rel="icon" href="/favicon.ico" sizes="48x48">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
  ].join("\n");
}

export function buildManifest({ name = "", backgroundColor = "#ffffff", themeColor = "#ffffff" } = {}) {
  return JSON.stringify(
    {
      name,
      short_name: name,
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      theme_color: themeColor,
      background_color: backgroundColor,
      display: "standalone",
    },
    null,
    2,
  );
}
