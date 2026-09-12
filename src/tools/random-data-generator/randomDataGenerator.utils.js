import { generateUuid } from "../uuid/uuid.utils.js";

const FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
];
const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Wilson", "Anderson", "Taylor", "Moore", "Jackson", "Martin",
];
const EMAIL_DOMAINS = ["example.com", "test.dev", "mail.test", "sample.org"];

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateName() {
  return `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
}

export function generateEmail() {
  const local = `${randomItem(FIRST_NAMES)}.${randomItem(LAST_NAMES)}`.toLowerCase();
  return `${local}${randomInt(1, 99)}@${randomItem(EMAIL_DOMAINS)}`;
}

export function generatePhoneNumber() {
  return `+1-${randomInt(200, 999)}-${randomInt(200, 999)}-${String(randomInt(0, 9999)).padStart(4, "0")}`;
}

export function generateNumber() {
  return randomInt(1, 100000);
}

export function generateDate() {
  const start = new Date(2015, 0, 1).getTime();
  const end = Date.now();
  return new Date(start + Math.random() * (end - start)).toISOString().slice(0, 10);
}

export function generateBoolean() {
  return Math.random() < 0.5;
}

export const DATA_TYPES = [
  { id: "name", label: "Full Name", generate: generateName },
  { id: "email", label: "Email", generate: generateEmail },
  { id: "phone", label: "Phone Number", generate: generatePhoneNumber },
  { id: "uuid", label: "UUID", generate: generateUuid },
  { id: "number", label: "Number", generate: generateNumber },
  { id: "date", label: "Date", generate: generateDate },
  { id: "boolean", label: "Boolean", generate: generateBoolean },
];

export function generateRandomData(typeId, count) {
  const type = DATA_TYPES.find((t) => t.id === typeId);
  if (!type) return [];
  const safeCount = Math.min(Math.max(Number(count) || 1, 1), 500);
  return Array.from({ length: safeCount }, () => type.generate());
}
