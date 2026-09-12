import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { Button } from "../../components/common/Button.jsx";
import { CopyButton } from "../../components/common/CopyButton.jsx";
import { Checkbox } from "../../components/common/Checkbox.jsx";
import { ErrorMessage } from "../../components/common/ErrorMessage.jsx";
import { cn } from "../../utils/cn.js";
import { getToolById } from "../../data/tools.js";
import { calculatePasswordStrength, generatePassword } from "./passwordGenerator.utils.js";

const tool = getToolById("password-generator");

const STRENGTH_COLORS = ["bg-destructive", "bg-destructive", "bg-warning", "bg-primary", "bg-success"];

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [seed, setSeed] = useState(0);

  const options = { length, uppercase, lowercase, numbers, symbols, excludeAmbiguous };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const result = useMemo(() => generatePassword(options), [length, uppercase, lowercase, numbers, symbols, excludeAmbiguous, seed]);
  const password = result.success ? result.value : "";
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col gap-6">
        {result.success ? (
          <div className="rounded-lg border border-border bg-code-background p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="break-all font-mono text-lg text-foreground">{password}</p>
              <div className="flex shrink-0 gap-2">
                <CopyButton text={password} />
                <Button variant="outline" size="icon" onClick={() => setSeed((s) => s + 1)} aria-label="Generate new password">
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex flex-1 gap-1" role="img" aria-label={`Password strength: ${strength.label}`}>
                {Array.from({ length: 4 }, (_, i) => (
                  <span
                    key={i}
                    className={cn("h-1.5 flex-1 rounded-full bg-muted", i <= strength.score - 1 && STRENGTH_COLORS[strength.score])}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-muted-foreground">{strength.label}</span>
            </div>
          </div>
        ) : (
          <ErrorMessage title="Can't generate a password" message={result.error} />
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password-length" className="text-sm font-medium text-foreground">
              Length
            </label>
            <span className="font-mono text-sm text-muted-foreground">{length}</span>
          </div>
          <input
            id="password-length"
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={(event) => setLength(Number(event.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          <Checkbox id="pw-uppercase" checked={uppercase} onChange={setUppercase} label="Uppercase (A-Z)" />
          <Checkbox id="pw-lowercase" checked={lowercase} onChange={setLowercase} label="Lowercase (a-z)" />
          <Checkbox id="pw-numbers" checked={numbers} onChange={setNumbers} label="Numbers (0-9)" />
          <Checkbox id="pw-symbols" checked={symbols} onChange={setSymbols} label="Symbols (!@#$)" />
          <Checkbox id="pw-ambiguous" checked={excludeAmbiguous} onChange={setExcludeAmbiguous} label="Exclude ambiguous" />
        </div>

        <Button onClick={() => setSeed((s) => s + 1)} className="w-fit">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Generate password
        </Button>
      </div>
    </ToolLayout>
  );
}
