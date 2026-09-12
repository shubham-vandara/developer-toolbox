export const UNIT_CATEGORIES = {
  length: {
    label: "Length",
    units: {
      meter: { label: "Meters", factor: 1 },
      kilometer: { label: "Kilometers", factor: 1000 },
      centimeter: { label: "Centimeters", factor: 0.01 },
      millimeter: { label: "Millimeters", factor: 0.001 },
      mile: { label: "Miles", factor: 1609.344 },
      yard: { label: "Yards", factor: 0.9144 },
      foot: { label: "Feet", factor: 0.3048 },
      inch: { label: "Inches", factor: 0.0254 },
    },
  },
  weight: {
    label: "Weight",
    units: {
      kilogram: { label: "Kilograms", factor: 1 },
      gram: { label: "Grams", factor: 0.001 },
      milligram: { label: "Milligrams", factor: 0.000001 },
      pound: { label: "Pounds", factor: 0.45359237 },
      ounce: { label: "Ounces", factor: 0.028349523125 },
      tonne: { label: "Metric tons", factor: 1000 },
    },
  },
  data: {
    label: "Data Size",
    units: {
      byte: { label: "Bytes", factor: 1 },
      kilobyte: { label: "Kilobytes", factor: 1024 },
      megabyte: { label: "Megabytes", factor: 1024 ** 2 },
      gigabyte: { label: "Gigabytes", factor: 1024 ** 3 },
      terabyte: { label: "Terabytes", factor: 1024 ** 4 },
      bit: { label: "Bits", factor: 0.125 },
    },
  },
  temperature: {
    label: "Temperature",
    units: {
      celsius: { label: "Celsius" },
      fahrenheit: { label: "Fahrenheit" },
      kelvin: { label: "Kelvin" },
    },
  },
};

function toCelsius(value, unit) {
  if (unit === "celsius") return value;
  if (unit === "fahrenheit") return ((value - 32) * 5) / 9;
  if (unit === "kelvin") return value - 273.15;
  throw new Error(`Unknown temperature unit: ${unit}`);
}

function fromCelsius(value, unit) {
  if (unit === "celsius") return value;
  if (unit === "fahrenheit") return (value * 9) / 5 + 32;
  if (unit === "kelvin") return value + 273.15;
  throw new Error(`Unknown temperature unit: ${unit}`);
}

export function convertUnit(category, value, fromUnit, toUnit) {
  const num = Number(value);
  if (!Number.isFinite(num)) return { success: false, error: "Enter a valid number." };

  const def = UNIT_CATEGORIES[category];
  if (!def) return { success: false, error: "Unknown category." };

  if (category === "temperature") {
    try {
      return { success: true, value: fromCelsius(toCelsius(num, fromUnit), toUnit) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  const from = def.units[fromUnit];
  const to = def.units[toUnit];
  if (!from || !to) return { success: false, error: "Unknown unit." };

  return { success: true, value: (num * from.factor) / to.factor };
}
