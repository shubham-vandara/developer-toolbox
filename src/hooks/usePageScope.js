import { useState } from "react";
import { allPages, parsePageRanges } from "../utils/pdf/pageRanges.js";

/** "All pages" or a typed range — for tools that apply something to pages. */
export function usePageScope(pageCount) {
  const [mode, setMode] = useState("all");
  const [text, setText] = useState("1");
  const parsed = mode === "custom" ? parsePageRanges(text, pageCount) : null;
  const pages = mode === "all" ? allPages(pageCount) : parsed?.success ? parsed.pages : [];
  return { mode, setMode, text, setText, pages, error: parsed && !parsed.success ? parsed.error : null, pageCount };
}
