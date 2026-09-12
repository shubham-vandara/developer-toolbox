export function encodeHtmlEntities(input) {
  try {
    const div = document.createElement("div");
    div.textContent = input;
    return {
      success: true,
      value: div.innerHTML.replaceAll('"', "&quot;").replaceAll("'", "&#39;"),
    };
  } catch {
    return { success: false, error: "Unable to encode this input." };
  }
}

export function decodeHtmlEntities(input) {
  try {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = input;
    return { success: true, value: textarea.value };
  } catch {
    return { success: false, error: "Unable to decode this input." };
  }
}
