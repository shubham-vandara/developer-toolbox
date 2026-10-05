import { ErrorMessage } from "./ErrorMessage.jsx";
import { FileDropZone } from "./FileDropZone.jsx";

export const SVG_ACCEPT = "image/svg+xml,.svg";

export const SVG_SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="24" fill="url(#g)"/>
  <path d="M38 62l15 15 30-34" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Upload step for SVG tools (used with useSvgSource). Pasting markup happens in
// the tool's own source editor, which stays mounted so typing never loses focus.
export function SvgSourceInput({ svg }) {
  return (
    <div className="flex flex-col gap-4">
      <FileDropZone
        onFile={svg.loadFile}
        accept={SVG_ACCEPT}
        title="Drop an SVG file here or click to browse"
        hint="SVG files up to 10 MB, or paste markup below. Scripts and external content are removed before rendering."
      />
      {svg.fileError && <ErrorMessage title="Couldn't open this file" message={svg.fileError} />}
    </div>
  );
}
