import { useEffect, useState } from "react";
import { Hash, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { getToolById } from "../../data/tools.js";
import { computeHash, HASH_ALGORITHMS } from "./hash.utils.js";

const tool = getToolById("hash-generator");

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState(null);

  useEffect(() => {
    if (!input) {
      setHashes(null);
      return;
    }
    let cancelled = false;
    Promise.all(HASH_ALGORITHMS.map(({ id }) => computeHash(input, id))).then((results) => {
      if (cancelled) return;
      setHashes(Object.fromEntries(HASH_ALGORITHMS.map(({ id }, i) => [id, results[i]])));
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <TextPanel
          id="hash-input"
          label="Text"
          value={input}
          onChange={setInput}
          placeholder="Type or paste text to hash..."
          rows={6}
          actions={
            <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
          }
        />

        {hashes ? (
          <div className="flex flex-col gap-3">
            {HASH_ALGORITHMS.map(({ id, label }) => (
              <div key={id} className="rounded-lg border border-border bg-surface px-4 py-3">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                  <CopyButton text={hashes[id]} size="sm" variant="ghost" />
                </div>
                <p className="break-all font-mono text-sm text-foreground">{hashes[id]}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Hash} title="Nothing to hash yet" description="Enter some text to generate its hashes." />
        )}
      </div>
    </ToolLayout>
  );
}
