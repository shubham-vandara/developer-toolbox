import { useMemo, useState } from "react";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { getToolById } from "../../data/tools.js";
import { parseUrl } from "./urlParser.utils.js";

const tool = getToolById("url-parser");

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-2.5">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-sm text-foreground" title={value}>
          {value}
        </p>
      </div>
      <CopyButton text={value} size="sm" variant="ghost" />
    </div>
  );
}

export default function UrlParser() {
  const [input, setInput] = useState("");
  const result = useMemo(() => (input.trim() ? parseUrl(input) : null), [input]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <div>
          <label htmlFor="url-parser-input" className="mb-1.5 block text-sm font-medium text-foreground">
            URL
          </label>
          <input
            id="url-parser-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="https://user:pass@sub.example.com:8080/path?foo=bar#section"
            spellCheck={false}
            className="h-10 w-full rounded-md border border-input bg-surface px-3.5 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {result && !result.success && <ErrorMessage title="Invalid URL" message={result.error} />}

        {result?.success && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Field label="Protocol" value={result.protocol} />
              <Field label="Hostname" value={result.hostname} />
              <Field label="Port" value={result.port} />
              <Field label="Pathname" value={result.pathname} />
              <Field label="Username" value={result.username} />
              <Field label="Password" value={result.password} />
              <Field label="Query string" value={result.search} />
              <Field label="Hash" value={result.hash} />
            </div>

            {result.params.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-foreground">Query parameters</p>
                <ul className="flex flex-col gap-1.5">
                  {result.params.map((param, index) => (
                    <li
                      key={`${param.key}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2 text-sm"
                    >
                      <span className="font-mono text-foreground">
                        <span className="text-primary">{param.key}</span> = {param.value}
                      </span>
                      <CopyButton text={param.value} size="sm" variant="ghost" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
