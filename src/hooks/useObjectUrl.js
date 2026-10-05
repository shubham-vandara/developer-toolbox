import { useEffect, useState } from "react";

// Object URL for a Blob/File that is revoked automatically when the blob
// changes or the component unmounts, so previews never leak memory.
export function useObjectUrl(blob) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return undefined;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);

  return url;
}
