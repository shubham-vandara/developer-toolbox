import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "../common/Button.jsx";
import { ErrorMessage } from "../common/ErrorMessage.jsx";
import { FileDropZone } from "../common/FileDropZone.jsx";
import { ProcessingIndicator } from "../common/ProcessingIndicator.jsx";
import { SelectedFile } from "../common/SelectedFile.jsx";
import { formatBytes } from "../../utils/file.js";
import { PDF_ACCEPT } from "../../utils/pdf/engine.js";

export const PDF_PRIVACY_NOTE = "Your files are processed locally in your browser and are not uploaded to a server.";

export function PrivacyNote() {
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
      {PDF_PRIVACY_NOTE}
    </p>
  );
}

export function PasswordForm({ onSubmit, error, checking, label = "PDF password", submitLabel = "Open PDF", id = "pdf-password" }) {
  const [password, setPassword] = useState("");
  return (
    <form
      className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(password);
      }}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
        This PDF is password-protected
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
          </label>
          <input
            id={id}
            type="password"
            autoComplete="off"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(error) || undefined}
            className="h-9 w-full rounded-md border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button type="submit" size="md" disabled={checking}>
          {checking ? "Checking…" : submitLabel}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </form>
  );
}

// Upload step for single-PDF tools, driven by usePdfFile().
export function PdfUpload({ source, title = "Drop a PDF here or click to browse", hint = "PDF files up to 200 MB" }) {
  return (
    <div className="flex flex-col gap-4">
      {source.status === "password" ? (
        <>
          <SelectedFile name={source.file.name} details={["PDF", formatBytes(source.file.size), "Locked"]} onClear={source.reset} />
          <PasswordForm onSubmit={source.submitPassword} error={source.error} checking={source.checking} />
        </>
      ) : (
        <FileDropZone onFile={source.load} accept={PDF_ACCEPT} title={title} hint={hint} disabled={source.status === "loading"} />
      )}
      {source.status === "idle" && <PrivacyNote />}
      {source.status === "loading" && <ProcessingIndicator label="Opening PDF…" />}
      {source.status === "error" && (
        <ErrorMessage
          title="Couldn't open this PDF"
          message={source.error}
          detail={
            source.code === "password" ? (
              <Link to="/tools/pdf-protect" className="font-medium text-primary hover:underline">
                Open Protect &amp; Unlock PDF →
              </Link>
            ) : undefined
          }
        />
      )}
    </div>
  );
}

export function PdfSourceBar({ source, extra }) {
  return (
    <SelectedFile
      name={source.file.name}
      details={["PDF", `${source.pageCount} page${source.pageCount === 1 ? "" : "s"}`, formatBytes(source.file.size), extra]}
      accept={PDF_ACCEPT}
      onReplace={source.load}
      onClear={source.reset}
    />
  );
}
