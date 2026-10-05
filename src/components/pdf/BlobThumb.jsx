import { useObjectUrl } from "../../hooks/useObjectUrl.js";

// Small preview of a generated image blob; its object URL is revoked automatically.
export function BlobThumb({ blob, alt }) {
  const url = useObjectUrl(blob);
  return (
    <div className="bg-checkerboard flex aspect-[3/4] items-center justify-center overflow-hidden rounded border border-border">
      {url && <img src={url} alt={alt} className="max-h-full max-w-full object-contain" loading="lazy" />}
    </div>
  );
}
