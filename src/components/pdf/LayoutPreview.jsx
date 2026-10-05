import { placeImage, resolvePageSize } from "../../utils/pdf/geometry.js";

// A to-scale sketch of the first page: page box, margin and image placement.
export function LayoutPreview({ image, options }) {
  const size = resolvePageSize(options.pageSize, options.orientation, image.width, image.height);
  const margin = options.pageSize === "original" ? 0 : options.margin;
  const place = placeImage(image.width, image.height, size.width, size.height, { fit: options.fit, margin });
  const pct = (value, total) => `${(value / total) * 100}%`;
  return (
    <figure className="flex flex-col items-center gap-1.5">
      <div
        className="relative w-32 overflow-hidden border border-border bg-white shadow-sm"
        style={{ aspectRatio: `${size.width} / ${size.height}` }}
        aria-hidden="true"
      >
        <div
          className="absolute overflow-hidden"
          style={{
            left: pct(place.clip.x, size.width),
            bottom: pct(place.clip.y, size.height),
            width: pct(place.clip.width, size.width),
            height: pct(place.clip.height, size.height),
          }}
        >
          <img
            src={image.url}
            alt=""
            className="absolute max-w-none"
            style={{
              left: pct(place.x - place.clip.x, place.clip.width),
              bottom: pct(place.y - place.clip.y, place.clip.height),
              width: pct(place.width, place.clip.width),
              height: pct(place.height, place.clip.height),
            }}
          />
        </div>
      </div>
      <figcaption className="text-xs text-muted-foreground">
        Page 1 · {Math.round(size.width)} × {Math.round(size.height)} pt
      </figcaption>
    </figure>
  );
}
