import { useMemo, useState } from "react";
import { ShieldAlert, Trash2 } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { TextPanel } from "../../components/common/TextPanel.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { EmptyState } from "../../components/common/EmptyState.jsx";
import { getToolById } from "../../data/tools.js";
import { decodeJwt, formatJwtTimestamp } from "./jwt.utils.js";

const tool = getToolById("jwt-decoder");

export default function JwtDecoder() {
  const [input, setInput] = useState("");

  const result = useMemo(() => (input.trim() ? decodeJwt(input) : null), [input]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            This tool only <span className="font-semibold">decodes</span> the JWT locally. It does{" "}
            <span className="font-semibold">not</span> verify the signature.
          </p>
        </div>

        <TextPanel
          id="jwt-input"
          label="JWT"
          value={input}
          onChange={setInput}
          placeholder="Paste a JWT (header.payload.signature)..."
          rows={4}
          invalid={Boolean(result && !result.success)}
          actions={
            <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear
            </Button>
          }
        />

        {result && !result.success && <ErrorMessage title="Couldn't decode this token" message={result.error} />}

        {result?.success && (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TextPanel
                id="jwt-header"
                label="Header"
                value={JSON.stringify(result.header, null, 2)}
                readOnly
                rows={8}
                actions={<CopyButton text={JSON.stringify(result.header, null, 2)} />}
              />
              <TextPanel
                id="jwt-payload"
                label="Payload"
                value={JSON.stringify(result.payload, null, 2)}
                readOnly
                rows={8}
                actions={<CopyButton text={JSON.stringify(result.payload, null, 2)} />}
              />
            </div>

            {(result.payload.iat || result.payload.exp) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {result.payload.iat && (
                  <div className="rounded-lg border border-border bg-surface px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Issued at</p>
                    <p className="font-mono text-sm text-foreground">{formatJwtTimestamp(result.payload.iat)}</p>
                  </div>
                )}
                {result.payload.exp && (
                  <div className="rounded-lg border border-border bg-surface px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Expires</p>
                    <p className="font-mono text-sm text-foreground">{formatJwtTimestamp(result.payload.exp)}</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <p className="mb-1.5 text-sm font-medium text-foreground">Signature</p>
              <p className="break-all rounded-lg border border-border bg-code-background px-3.5 py-3 font-mono text-sm text-muted-foreground">
                {result.signature}
              </p>
            </div>
          </>
        )}

        {!result && (
          <EmptyState
            icon={ShieldAlert}
            title="Nothing to decode yet"
            description="Paste a JWT above to see its header and payload."
          />
        )}
      </div>
    </ToolLayout>
  );
}
