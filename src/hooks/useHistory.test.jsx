import { act, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { useHistory } from "./useHistory.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Minimal renderHook (StrictMode, so impure state updaters would be caught).
function renderHook(hook) {
  const result = { current: null };
  function Probe() {
    result.current = hook();
    return null;
  }
  act(() => createRoot(document.createElement("div")).render(<StrictMode><Probe /></StrictMode>));
  return { result };
}

describe("useHistory", () => {
  const setup = () => renderHook(() => useHistory(0));

  it("undoes and redoes discrete changes", () => {
    const { result } = setup();
    act(() => result.current.apply(1));
    act(() => result.current.apply(2));
    act(() => result.current.undo());
    expect(result.current.present).toBe(1);
    act(() => result.current.redo());
    expect(result.current.present).toBe(2);
  });

  it("records a whole gesture as one step, even in StrictMode", () => {
    const { result } = setup();
    act(() => result.current.begin());
    act(() => result.current.preview(5));
    act(() => result.current.preview(9));
    act(() => result.current.commit());
    expect(result.current.present).toBe(9);
    expect(result.current.canUndo).toBe(true);
    act(() => result.current.undo());
    expect(result.current.present).toBe(0);
  });

  it("ignores gestures that changed nothing", () => {
    const { result } = setup();
    act(() => result.current.begin());
    act(() => result.current.commit());
    expect(result.current.canUndo).toBe(false);
  });
});
