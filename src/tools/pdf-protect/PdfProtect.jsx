import { useState } from "react";
import { Info, LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Card, CardContent } from "../../components/common/Card.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { FileDropZone } from "../../components/common/FileDropZone.jsx";
import { ProcessingIndicator } from "../../components/common/ProcessingIndicator.jsx";
import { SegmentedControl } from "../../components/common/SegmentedControl.jsx";
import { SelectedFile } from "../../components/common/SelectedFile.jsx";
import { PdfResult } from "../../components/pdf/PdfResult.jsx";
import { PasswordForm, PrivacyNote } from "../../components/pdf/PdfUpload.jsx";
import { getToolById } from "../../data/tools.js";
import { useTask } from "../../hooks/useTask.js";
import { appendToFilename, formatBytes } from "../../utils/file.js";
import { getPdfErrorMessage, PDF_ACCEPT, readPdfFile } from "../../utils/pdf/engine.js";
import { inspectEncryption, passwordIssues, protectPdf, unlockPdf } from "./protectPdf.js";

const tool = getToolById("pdf-protect");

function usePickedPdf() {
  const [state, setState] = useState({ status: "idle" });
  const pick = async (file) => {
    setState({ status: "loading", file });
    try {
      const bytes = await readPdfFile(file);
      const info = await inspectEncryption(bytes);
      setState({ status: "ready", file, bytes, ...info });
    } catch (error) {
      setState({ status: "error", file, error: getPdfErrorMessage(error, "This PDF couldn't be opened.") });
    }
  };
  return { ...state, pick, reset: () => setState({ status: "idle" }) };
}

function PasswordInput({ id, label, value, onChange, autoComplete = "new-password" }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <input id={id} type="password" value={value} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    </div>
  );
}

function FilePicker({ picked, task, title }) {
  if (picked.status === "idle" || picked.status === "loading" || picked.status === "error") {
    return (
      <div className="flex flex-col gap-3">
        <FileDropZone onFile={(file) => { task.reset(); picked.pick(file); }} accept={PDF_ACCEPT} title={title} hint="PDF files up to 200 MB" disabled={picked.status === "loading"} />
        {picked.status === "idle" && <PrivacyNote />}
        {picked.status === "loading" && <ProcessingIndicator label="Checking PDF…" />}
        {picked.status === "error" && <ErrorMessage title="Couldn't open this PDF" message={picked.error} />}
      </div>
    );
  }
  return (
    <SelectedFile
      name={picked.file.name}
      details={["PDF", `${picked.pageCount} page${picked.pageCount === 1 ? "" : "s"}`, formatBytes(picked.file.size), picked.encrypted ? "Encrypted" : "Not encrypted"]}
      accept={PDF_ACCEPT}
      onReplace={(file) => { task.reset(); picked.pick(file); }}
      onClear={() => { task.reset(); picked.reset(); }}
    />
  );
}

function ProtectPanel() {
  const picked = usePickedPdf();
  const task = useTask();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const issue = passwordIssues(password, confirm);

  return (
    <div className="flex flex-col gap-5">
      <FilePicker picked={picked} task={task} title="Drop the PDF to protect" />
      {picked.status === "ready" && picked.encrypted && (
        <ErrorMessage title="Already password-protected" message="Unlock it first in the Unlock tab, then protect it with a new password." />
      )}
      {picked.status === "ready" && !picked.encrypted && task.status !== "done" && (
        <Card>
          <CardContent className="flex flex-col gap-4 pt-4 sm:pt-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <PasswordInput id="protect-password" label="Password" value={password} onChange={(v) => { task.reset(); setPassword(v); }} />
              <PasswordInput id="protect-confirm" label="Confirm password" value={confirm} onChange={(v) => { task.reset(); setConfirm(v); }} />
            </div>
            <p className={password && issue ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
              {password && issue ? issue : "Anyone opening the PDF will need this password. There’s no way to recover it if it’s lost."}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => task.run(async () => ({ blob: await protectPdf(picked.bytes, password) }))} disabled={Boolean(issue) || task.isRunning} size="md">
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Protect PDF
              </Button>
              {task.isRunning && <ProcessingIndicator label="Encrypting…" />}
            </div>
            <p className="flex gap-1.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Uses AES-256 encryption (PDF 2.0). Opens in current versions of Acrobat, Chrome, Edge, Firefox and macOS Preview; very old PDF readers may not support it.
            </p>
          </CardContent>
        </Card>
      )}
      {task.status === "error" && <ErrorMessage title="Couldn't protect this PDF" message={task.error} />}
      {task.status === "done" && (
        <PdfResult blob={task.result.blob} filename={appendToFilename(picked.file.name, "-protected", "pdf")}
          items={[{ label: "Encryption", value: "AES-256" }]} onReset={() => { task.reset(); picked.reset(); setPassword(""); setConfirm(""); }} />
      )}
    </div>
  );
}

function UnlockPanel() {
  const picked = usePickedPdf();
  const task = useTask();

  return (
    <div className="flex flex-col gap-5">
      <FilePicker picked={picked} task={task} title="Drop the password-protected PDF" />
      {picked.status === "ready" && !picked.encrypted && (
        <div className="flex gap-2 rounded-lg border border-border bg-surface p-4 text-sm text-foreground" role="status">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          This PDF isn’t password-protected, so there’s nothing to unlock.
        </div>
      )}
      {picked.status === "ready" && picked.encrypted && task.status !== "done" && (
        <>
          <PasswordForm
            id="unlock-password"
            submitLabel="Unlock PDF"
            checking={task.isRunning}
            error={task.status === "error" ? task.error : null}
            onSubmit={(password) => task.run(() => unlockPdf(picked.bytes, password))}
          />
          <p className="text-xs text-muted-foreground">
            Enter the password you were given. If the PDF opens without a password but restricts printing or copying, enter its owner password to remove the restrictions. Passwords are never guessed or bypassed.
          </p>
        </>
      )}
      {task.status === "done" && (
        <PdfResult blob={task.result.blob} filename={appendToFilename(picked.file.name, "-unlocked", "pdf")}
          items={[{ label: "Pages", value: String(task.result.pages) }, { label: "Password", value: "Removed" }]}
          onReset={() => { task.reset(); picked.reset(); }} />
      )}
    </div>
  );
}

export default function PdfProtect() {
  const [mode, setMode] = useState("protect");
  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        <SegmentedControl value={mode} onChange={setMode} options={[
          { value: "protect", label: "Protect with password" },
          { value: "unlock", label: "Unlock (remove password)" },
        ]} />
        {mode === "protect" ? <ProtectPanel /> : <UnlockPanel />}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <LockKeyholeOpen className="h-3.5 w-3.5" aria-hidden="true" />
          Passwords are used only in this tab to encrypt or decrypt — they’re never stored or sent anywhere.
        </p>
      </div>
    </ToolLayout>
  );
}
