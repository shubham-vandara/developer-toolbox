// Browser-side compression engine (see pdfCompressor.utils.js for the rules).
import { loadPdfLib, openForEdit, savePdf, yieldToBrowser } from "../../utils/pdf/engine.js";
import { fitWithin, releaseCanvas } from "../../utils/image.js";
import { canDeflateStream, canRecompressImage, MIN_SAVING_RATIO } from "./pdfCompressor.utils.js";

async function deflate(bytes) {
  // "deflate" = zlib-wrapped DEFLATE, exactly what /FlateDecode expects.
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function reencodeJpeg(bytes, { quality, maxSide }) {
  const bitmap = await createImageBitmap(new Blob([bytes], { type: "image/jpeg" }));
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, maxSide, maxSide);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    releaseCanvas(canvas);
    if (!blob) return null;
    return { bytes: new Uint8Array(await blob.arrayBuffer()), width, height };
  } finally {
    bitmap.close();
  }
}

let nameOf = () => undefined;

// instanceof (not constructor.name, which minification renames).
function bindNameOf({ PDFName }) {
  nameOf = (value) => (value instanceof PDFName ? value.decodeText() : undefined);
}

/** Inspect an image dictionary into the plain shape canRecompressImage() expects. */
function describeImage(dict, lib) {
  const { PDFName, PDFArray, PDFNumber, PDFBool } = lib;
  const filter = dict.lookup(PDFName.of("Filter"));
  const filters = filter instanceof PDFArray ? filter.asArray().map((f) => nameOf(dict.context.lookup(f))) : filter ? [nameOf(filter)] : [];
  const bpc = dict.lookup(PDFName.of("BitsPerComponent"));
  const cs = dict.lookup(PDFName.of("ColorSpace"));
  let colorSpace = nameOf(cs);
  let iccComponents;
  if (cs instanceof PDFArray) {
    colorSpace = nameOf(dict.context.lookup(cs.get(0)));
    if (colorSpace === "ICCBased") {
      const profile = dict.context.lookup(cs.get(1));
      const n = profile?.dict?.lookup(PDFName.of("N"));
      iccComponents = n instanceof PDFNumber ? n.asNumber() : undefined;
    }
  }
  const mask = dict.lookup(PDFName.of("ImageMask"));
  return {
    filters,
    bitsPerComponent: bpc instanceof PDFNumber ? bpc.asNumber() : undefined,
    colorSpace,
    iccComponents,
    imageMask: mask instanceof PDFBool ? mask.asBoolean() : false,
    hasDecode: Boolean(dict.get(PDFName.of("Decode"))),
  };
}

/**
 * Compress `bytes` at the given level. report(done, total, label) for progress.
 * Returns { blob, stats } where stats counts what was actually changed.
 */
export async function compressPdf(bytes, level, report) {
  const lib = await loadPdfLib();
  bindNameOf(lib);
  const { PDFName, PDFNumber, PDFRawStream } = lib;
  const doc = await openForEdit(bytes);
  const { context } = doc;
  const objects = context.enumerateIndirectObjects();
  const stats = { images: 0, jpegs: 0, recompressed: 0, streamsDeflated: 0 };

  for (let i = 0; i < objects.length; i += 1) {
    const [ref, object] = objects[i];
    if (!(object instanceof PDFRawStream)) continue;
    const dict = object.dict;
    const type = nameOf(dict.lookup(PDFName.of("Type")));
    const subtype = nameOf(dict.lookup(PDFName.of("Subtype")));

    if (subtype === "Image") {
      stats.images += 1;
      const info = describeImage(dict, lib);
      if (info.filters[0] === "DCTDecode") stats.jpegs += 1;
      if (level.images && canRecompressImage(info)) {
        report?.(i, objects.length, "Recompressing images");
        try {
          const result = await reencodeJpeg(object.contents, level.images);
          if (result && result.bytes.length < object.contents.length * MIN_SAVING_RATIO) {
            dict.set(PDFName.of("Width"), PDFNumber.of(result.width));
            dict.set(PDFName.of("Height"), PDFNumber.of(result.height));
            dict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
            dict.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
            dict.delete(PDFName.of("DecodeParms"));
            dict.set(PDFName.of("Length"), PDFNumber.of(result.bytes.length));
            context.assign(ref, PDFRawStream.of(dict, result.bytes));
            stats.recompressed += 1;
          }
        } catch {
          // Undecodable image: keep the original bytes.
        }
        await yieldToBrowser();
      }
      continue;
    }

    const hasFilter = Boolean(dict.get(PDFName.of("Filter")));
    if (canDeflateStream({ hasFilter, type, subtype, size: object.contents.length })) {
      const compressed = await deflate(object.contents);
      if (compressed.length < object.contents.length * MIN_SAVING_RATIO) {
        dict.set(PDFName.of("Filter"), PDFName.of("FlateDecode"));
        dict.set(PDFName.of("Length"), PDFNumber.of(compressed.length));
        context.assign(ref, PDFRawStream.of(dict, compressed));
        stats.streamsDeflated += 1;
      }
    }
  }

  report?.(0, 0, "Saving optimized PDF…");
  const blob = await savePdf(doc, { useObjectStreams: true });
  return { blob, stats };
}
