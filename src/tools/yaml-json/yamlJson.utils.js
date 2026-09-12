import { dump, load } from "js-yaml";

export function yamlToJson(input) {
  if (!input.trim()) return { success: false, error: "Enter some YAML to convert." };
  try {
    const parsed = load(input);
    return { success: true, value: JSON.stringify(parsed, null, 2) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Invalid YAML." };
  }
}

export function jsonToYaml(input) {
  if (!input.trim()) return { success: false, error: "Enter some JSON to convert." };
  let parsed;
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    return { success: false, error: `Invalid JSON. ${err.message}` };
  }
  try {
    return { success: true, value: dump(parsed) };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unable to convert this JSON to YAML." };
  }
}
