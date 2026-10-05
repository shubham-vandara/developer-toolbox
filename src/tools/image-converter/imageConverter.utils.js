import { describeMime, getFormatByMime } from "../../utils/image.js";

// Things worth telling the user about a particular source → target conversion.
export function getConversionNotes(sourceMime, format) {
  const notes = [];
  const sourceFormat = getFormatByMime(sourceMime);
  if (sourceFormat?.id === format.id) {
    notes.push(`The image is already ${format.label}; it will be re-encoded.`);
  }
  if (!format.alpha && sourceMime !== "image/jpeg") {
    notes.push(`${format.label} doesn't support transparency, so transparent areas are filled with the background color.`);
  }
  if (sourceMime === "image/gif") {
    notes.push("Animated GIFs are converted using their first frame only.");
  }
  if (format.id === "bmp") {
    notes.push("BMP files are uncompressed and usually much larger than the original.");
  }
  if (sourceMime && !sourceFormat && sourceMime !== "image/gif") {
    notes.push(`${describeMime(sourceMime)} is decoded by your browser and re-encoded as ${format.label}.`);
  }
  return notes;
}
