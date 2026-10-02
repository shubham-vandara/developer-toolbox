import { lazy } from "react";
import {
  Braces,
  Fingerprint,
  Binary,
  Clock,
  CaseSensitive,
  Link2,
  Code2,
  AlignLeft,
  ListMinus,
  ArrowDownAZ,
  Replace,
  Table2,
  FileJson,
  FileDiff,
  KeyRound,
  Dices,
  FileLock2,
  Hash,
  Globe,
  FileType,
  Database,
  FileCode,
  Code,
  Paintbrush,
  Calculator,
  Palette,
  CalendarRange,
  Timer,
  Regex,
  GitCompareArrows,
  FileCode2,
  NotebookText,
  BookOpen,
  Link,
  Ruler,
  QrCode,
  Percent,
  ScrollText,
  GitBranch,
  Grid3x3,
  SplitSquareHorizontal,
  FileX2,
  FileCog,
  FileText,
  Bug,
} from "lucide-react";

// Central tool registry. Adding a new tool means: create its component under
// src/tools/<id>/, add one entry here, and add its route in App.jsx.
export const categories = {
  json: "JSON & Data",
  encoding: "Encoding",
  generators: "Generators",
  "date-time": "Date & Time",
  text: "Text",
  conversion: "Conversion",
  formatting: "Formatting",
  security: "Security",
  networking: "Networking",
  reference: "Reference",
};

export const tools = [
  {
    id: "json-formatter",
    pageTitle: "JSON Formatter & Validator Online, Free",
    metaDescription:
      "Format, validate and minify JSON instantly in your browser. Spot syntax errors fast and copy clean, readable output in one click. Try it free.",
    name: "JSON Formatter & Validator",
    shortName: "JSON Formatter",
    description: "Format, validate and minify JSON instantly.",
    category: "json",
    path: "/tools/json-formatter",
    icon: Braces,
    popular: true,
    keywords: [
      "json",
      "formatter",
      "validator",
      "pretty print",
      "minify",
      "lint",
    ],
    component: lazy(() => import("../tools/json/JsonFormatter.jsx")),
  },
  {
    id: "uuid-generator",
    pageTitle: "UUID Generator - Create v4 UUIDs in Bulk ",
    metaDescription:
      "Need unique IDs for a database or test fixture? Generate random v4 UUIDs one at a time or in bulk, then copy them instantly. No sign-up needed.",
    name: "UUID Generator",
    shortName: "UUID Generator",
    description: "Generate v4 UUIDs, one at a time or in bulk.",
    category: "generators",
    path: "/tools/uuid-generator",
    icon: Fingerprint,
    popular: true,
    keywords: ["uuid", "guid", "generator", "random id", "unique id"],
    component: lazy(() => import("../tools/uuid/UuidGenerator.jsx")),
  },
  {
    id: "base64",
    pageTitle: "Base64 Encoder & Decoder with Unicode Support",
    metaDescription:
      "Encode text to Base64 or decode Base64 strings back to readable text, with full Unicode and emoji support. Runs in your browser. Start encoding.",
    name: "Base64 Encoder / Decoder",
    shortName: "Base64",
    description: "Encode and decode Base64, with full Unicode support.",
    category: "encoding",
    path: "/tools/base64",
    icon: Binary,
    popular: true,
    keywords: ["base64", "encode", "decode", "encoder", "decoder", "unicode"],
    component: lazy(() => import("../tools/base64/Base64Tool.jsx")),
  },
  {
    id: "timestamp",
    pageTitle: "Unix Timestamp Converter - Epoch to Date",
    metaDescription:
      "Convert Unix epoch timestamps into human-readable dates and turn dates back into timestamps. Paste a value and get the answer in seconds.",
    name: "Timestamp Converter",
    shortName: "Timestamp Converter",
    description: "Convert between Unix timestamps and human-readable dates.",
    category: "date-time",
    path: "/tools/timestamp",
    icon: Clock,
    popular: true,
    keywords: [
      "timestamp",
      "unix",
      "epoch",
      "date",
      "time",
      "converter",
      "utc",
    ],
    component: lazy(() => import("../tools/timestamp/TimestampConverter.jsx")),
  },
  {
    id: "text-case-converter",
    pageTitle: "Text Case Converter - camelCase, snake_case",
    metaDescription:
      "Switch text between camelCase, snake_case and other naming styles in one click. Ideal for renaming variables, keys and file names. Convert now.",
    name: "Text Case Converter",
    shortName: "Text Case Converter",
    description: "Convert text between camelCase, snake_case and more.",
    category: "text",
    path: "/tools/text-case-converter",
    icon: CaseSensitive,
    popular: true,
    keywords: [
      "text",
      "case",
      "camelcase",
      "snake_case",
      "kebab-case",
      "title case",
      "converter",
    ],
    component: lazy(() => import("../tools/text-case/TextCaseConverter.jsx")),
  },

  // Batch 1 — Text & Encoding
  {
    id: "url-encoder",
    pageTitle: "URL Encoder & Decoder - Encode URI Components",
    metaDescription:
      "If a query string breaks on special characters, encode it here. Percent-encode or decode full URLs and URI components safely. Free and instant.",
    name: "URL Encoder / Decoder",
    shortName: "URL Encoder",
    description: "Encode and decode URLs and URI components.",
    category: "encoding",
    path: "/tools/url-encoder",
    icon: Link2,
    keywords: [
      "url",
      "uri",
      "encode",
      "decode",
      "encodeuricomponent",
      "percent encoding",
    ],
    component: lazy(() => import("../tools/url-encoder/UrlEncoder.jsx")),
  },
  {
    id: "html-entities",
    pageTitle: "HTML Entity Encoder & Decoder - Free Online",
    metaDescription:
      "Escape characters like &lt; and &amp; into HTML entities, or decode entities back to plain text. Keep markup safe for display. Encode your HTML now.",
    name: "HTML Entity Encoder / Decoder",
    shortName: "HTML Entities",
    description: "Encode and decode HTML entities like &lt; and &amp;.",
    category: "encoding",
    path: "/tools/html-entities",
    icon: Code2,
    keywords: [
      "html",
      "entity",
      "entities",
      "encode",
      "decode",
      "escape",
      "unescape",
    ],
    component: lazy(() => import("../tools/html-entities/HtmlEntityTool.jsx")),
  },
  {
    id: "text-counter",
    pageTitle: "Word & Character Counter - Free Text Counter",
    metaDescription:
      "Count characters, words, lines, sentences and paragraphs in any text. Handy for meta tags, tweets and essays with length limits. Paste your text.",
    name: "Word & Character Counter",
    shortName: "Text Counter",
    description: "Count characters, words, lines, sentences and paragraphs.",
    category: "text",
    path: "/tools/text-counter",
    icon: AlignLeft,
    keywords: [
      "word count",
      "character count",
      "line count",
      "sentence",
      "paragraph",
      "counter",
    ],
    component: lazy(() => import("../tools/text-counter/TextCounter.jsx")),
  },
  {
    id: "remove-duplicate-lines",
    pageTitle: "Remove Duplicate Lines from Text Online",
    metaDescription:
      "Clean up lists, logs and exported columns by stripping repeated lines in seconds. Get a tidy, unique list back. Paste your text to start.",
    name: "Remove Duplicate Lines",
    shortName: "Remove Duplicates",
    description: "Remove duplicate lines from a block of text.",
    category: "text",
    path: "/tools/remove-duplicate-lines",
    icon: ListMinus,
    keywords: ["duplicate", "lines", "unique", "dedupe", "remove"],
    component: lazy(
      () => import("../tools/remove-duplicate-lines/RemoveDuplicateLines.jsx"),
    ),
  },
  {
    id: "sort-lines",
    pageTitle: "Sort Lines Online - Alphabetical, Numeric",
    metaDescription:
      "Sort lines of text in ascending or descending order, alphabetically, numerically or by length. Clean up lists and logs in seconds. Paste your text.",
    name: "Sort Lines",
    shortName: "Sort Lines",
    description: "Sort lines alphabetically, numerically or by length.",
    category: "text",
    path: "/tools/sort-lines",
    icon: ArrowDownAZ,
    keywords: ["sort", "lines", "alphabetical", "numeric", "order"],
    component: lazy(() => import("../tools/sort-lines/SortLines.jsx")),
  },
  {
    id: "find-replace",
    pageTitle: "Find & Replace Text Online with Regex Support ",
    metaDescription:
      "Search and replace text across large blocks at once, with optional regular expressions for complex patterns. Faster than an editor. Try it free.",
    name: "Find & Replace",
    shortName: "Find & Replace",
    description: "Find and replace text, with optional regular expressions.",
    category: "text",
    path: "/tools/find-replace",
    icon: Replace,
    keywords: ["find", "replace", "regex", "search", "substitute"],
    component: lazy(() => import("../tools/find-replace/FindReplace.jsx")),
  },

  // Batch 2 — Data Conversion
  {
    id: "json-to-csv",
    pageTitle: "JSON to CSV Converter - Export JSON Arrays",
    metaDescription:
      "Turn a JSON array of objects into clean CSV ready for Excel or Google Sheets, with column headers built from your keys. Convert your JSON now.",
    name: "JSON to CSV Converter",
    shortName: "JSON to CSV",
    description: "Convert a JSON array of objects into CSV.",
    category: "json",
    path: "/tools/json-to-csv",
    icon: Table2,
    keywords: ["json", "csv", "convert", "export", "spreadsheet"],
    component: lazy(() => import("../tools/json-to-csv/JsonToCsv.jsx")),
  },
  {
    id: "csv-to-json",
    pageTitle: "CSV to JSON Converter - Online & Free",
    metaDescription:
      "Paste CSV data and get formatted JSON back instantly, with headers mapped to keys. Useful for seeding APIs and test data. Convert your CSV now.",
    name: "CSV to JSON Converter",
    shortName: "CSV to JSON",
    description: "Convert CSV data into formatted JSON.",
    category: "json",
    path: "/tools/csv-to-json",
    icon: FileJson,
    keywords: ["csv", "json", "convert", "import", "spreadsheet"],
    component: lazy(() => import("../tools/csv-to-json/CsvToJson.jsx")),
  },
  {
    id: "json-diff",
    pageTitle: "JSON Diff - Compare Two JSON Files Online",
    metaDescription:
      "Compare two JSON documents and see added, removed and changed values highlighted. Debug API responses and config drift faster. Run a diff now.",
    name: "JSON Diff",
    shortName: "JSON Diff",
    description: "Compare two JSON documents and highlight differences.",
    category: "json",
    path: "/tools/json-diff",
    icon: FileDiff,
    keywords: ["json", "diff", "compare", "difference", "changes"],
    component: lazy(() => import("../tools/json-diff/JsonDiff.jsx")),
  },

  // Batch 3 — Developer Utilities
  {
    id: "password-generator",
    pageTitle: "Strong Password Generator - Random & Secure",
    metaDescription:
      "Create strong random passwords for accounts, servers and test users. Generated locally, so nothing leaves your browser. Get a secure password.",
    name: "Password Generator",
    shortName: "Password Generator",
    description: "Generate strong, random passwords locally.",
    category: "security",
    path: "/tools/password-generator",
    icon: KeyRound,
    popular: true,
    keywords: ["password", "generator", "random", "secure", "strength"],
    component: lazy(
      () => import("../tools/password-generator/PasswordGenerator.jsx"),
    ),
  },
  {
    id: "random-data-generator",
    pageTitle: "Random Data Generator - Fake Test Data Online",
    metaDescription:
      "Generate fake names, emails, dates and other test data for demos, QA and seeding databases. Produce a batch in seconds. Build your dataset.",
    name: "Random Data Generator",
    shortName: "Random Data",
    description: "Generate fake names, emails, dates and other test data.",
    category: "generators",
    path: "/tools/random-data-generator",
    icon: Dices,
    keywords: [
      "random",
      "fake data",
      "test data",
      "mock",
      "generator",
      "faker",
    ],
    component: lazy(
      () => import("../tools/random-data-generator/RandomDataGenerator.jsx"),
    ),
  },
  {
    id: "jwt-decoder",
    pageTitle: "JWT Decoder - Decode JSON Web Tokens Locally",
    metaDescription:
      "Paste a JSON Web Token to read its header and payload claims. Decoding happens locally, so your tokens stay private. Inspect your JWT now.",
    name: "JWT Decoder",
    shortName: "JWT Decoder",
    description: "Decode JWT headers and payloads locally.",
    category: "security",
    path: "/tools/jwt-decoder",
    icon: FileLock2,
    popular: true,
    keywords: ["jwt", "json web token", "decode", "token", "auth"],
    component: lazy(() => import("../tools/jwt-decoder/JwtDecoder.jsx")),
  },
  {
    id: "hash-generator",
    pageTitle: "Hash Generator - SHA-256, SHA-512 & SHA-1",
    metaDescription:
      "Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes from any text in your browser. Verify checksums and compare values quickly. Hash your text.",
    name: "Hash Generator",
    shortName: "Hash Generator",
    description: "Generate SHA-1, SHA-256, SHA-384 and SHA-512 hashes.",
    category: "security",
    path: "/tools/hash-generator",
    icon: Hash,
    popular: true,
    keywords: ["hash", "sha1", "sha256", "sha512", "checksum", "digest"],
    component: lazy(() => import("../tools/hash-generator/HashGenerator.jsx")),
  },
  {
    id: "http-status-codes",
    pageTitle: "HTTP Status Codes List & Quick Reference",
    metaDescription:
      "What does a 418 or 503 mean? Search every HTTP status code with a plain-English explanation of what it signals. Bookmark this quick reference.",
    name: "HTTP Status Code Reference",
    shortName: "HTTP Status Codes",
    description: "Searchable reference of HTTP status codes.",
    category: "networking",
    path: "/tools/http-status-codes",
    icon: Globe,
    keywords: ["http", "status", "codes", "reference", "404", "500"],
    component: lazy(
      () => import("../tools/http-status-codes/HttpStatusCodes.jsx"),
    ),
  },
  {
    id: "mime-types",
    pageTitle: "MIME Types List - File Extension Reference",
    metaDescription:
      "Look up the correct MIME type for any file extension, or find the extension for a content type. Useful for headers and uploads. Search the list.",
    name: "MIME Type Reference",
    shortName: "MIME Types",
    description: "Searchable reference of file extensions and MIME types.",
    category: "networking",
    path: "/tools/mime-types",
    icon: FileType,
    keywords: ["mime", "content-type", "file extension", "reference"],
    component: lazy(() => import("../tools/mime-types/MimeTypes.jsx")),
  },

  // Batch 4 — Formatting
  {
    id: "sql-formatter",
    pageTitle: "SQL Formatter - Beautify SQL Queries Online",
    metaDescription:
      "Paste messy, one-line SQL and get readable, properly indented queries back. Makes code reviews and debugging easier. Format your SQL for free.",
    name: "SQL Formatter",
    shortName: "SQL Formatter",
    description: "Format SQL queries for readability.",
    category: "formatting",
    path: "/tools/sql-formatter",
    icon: Database,
    keywords: ["sql", "formatter", "query", "pretty print"],
    component: lazy(() => import("../tools/sql-formatter/SqlFormatter.jsx")),
  },
  {
    id: "xml-formatter",
    pageTitle: "XML Formatter, Validator & Minifier Online",
    metaDescription:
      "Pretty-print XML with clean indentation, check it for errors, or minify it for production. Works with feeds, sitemaps and configs. Format XML now.",
    name: "XML Formatter",
    shortName: "XML Formatter",
    description: "Format, minify and validate XML.",
    category: "formatting",
    path: "/tools/xml-formatter",
    icon: FileCode,
    keywords: ["xml", "formatter", "validator", "minify", "pretty print"],
    component: lazy(() => import("../tools/xml-formatter/XmlFormatter.jsx")),
  },
  {
    id: "html-formatter",
    pageTitle: "HTML Formatter & Beautifier - Minify HTML",
    metaDescription:
      "Beautify minified HTML into readable, indented markup, or compress it to cut page weight. Handy when debugging templates. Paste your HTML.",
    name: "HTML Formatter",
    shortName: "HTML Formatter",
    description: "Format and minify HTML markup.",
    category: "formatting",
    path: "/tools/html-formatter",
    icon: Code,
    keywords: ["html", "formatter", "minify", "pretty print", "markup"],
    component: lazy(() => import("../tools/html-formatter/HtmlFormatter.jsx")),
  },
  {
    id: "css-formatter",
    pageTitle: "CSS Formatter & Minifier - Beautify CSS Online",
    metaDescription:
      "Format compressed stylesheets into readable CSS, or minify them to shrink file size and speed up pages. One click, no install. Try the CSS tool.",
    name: "CSS Formatter / Minifier",
    shortName: "CSS Formatter",
    description: "Format and minify CSS stylesheets.",
    category: "formatting",
    path: "/tools/css-formatter",
    icon: Paintbrush,
    keywords: ["css", "formatter", "minify", "pretty print", "stylesheet"],
    component: lazy(() => import("../tools/css-formatter/CssFormatter.jsx")),
  },

  // Batch 5 — Conversion & Date Utilities
  {
    id: "number-base-converter",
    pageTitle: "Number Base Converter - Binary, Hex, Decimal",
    metaDescription:
      "Convert numbers between binary, decimal, octal and hexadecimal instantly. Useful for bitwise work, colour codes and low-level debugging. Convert now.",
    name: "Number Base Converter",
    shortName: "Base Converter",
    description: "Convert numbers between binary, decimal, octal and hex.",
    category: "conversion",
    path: "/tools/number-base-converter",
    icon: Calculator,
    keywords: [
      "binary",
      "decimal",
      "octal",
      "hex",
      "hexadecimal",
      "base converter",
      "number",
    ],
    component: lazy(
      () => import("../tools/number-base-converter/NumberBaseConverter.jsx"),
    ),
  },
  {
    id: "color-converter",
    pageTitle: "Color Converter - HEX to RGB & HSL Online",
    metaDescription:
      "Convert colours between HEX, RGB and HSL formats in one step. Copy the values straight into your CSS or design tool. Enter a colour to begin.",
    name: "Color Converter",
    shortName: "Color Converter",
    description: "Convert colors between HEX, RGB and HSL.",
    category: "conversion",
    path: "/tools/color-converter",
    icon: Palette,
    keywords: ["color", "hex", "rgb", "hsl", "converter", "picker"],
    component: lazy(
      () => import("../tools/color-converter/ColorConverter.jsx"),
    ),
  },
  {
    id: "date-difference",
    pageTitle: "Date Difference Calculator - Days Between Dates",
    metaDescription:
      "How many days until a deadline? Calculate the exact gap between two dates for sprints, invoices and planning. Enter your dates to find out.",
    name: "Date Difference Calculator",
    shortName: "Date Difference",
    description: "Calculate the difference between two dates.",
    category: "date-time",
    path: "/tools/date-difference",
    icon: CalendarRange,
    keywords: ["date", "difference", "calculator", "days between", "duration"],
    component: lazy(
      () => import("../tools/date-difference/DateDifference.jsx"),
    ),
  },
  {
    id: "cron-helper",
    pageTitle: "Cron Expression Generator & Explainer",
    metaDescription:
      "Build cron schedules without memorising the syntax, and understand what any cron expression actually means. Stop guessing. Build your cron job.",
    name: "Cron Expression Helper",
    shortName: "Cron Helper",
    description: "Build and understand cron expressions.",
    category: "date-time",
    path: "/tools/cron-helper",
    icon: Timer,
    keywords: ["cron", "crontab", "schedule", "expression", "job"],
    component: lazy(() => import("../tools/cron-helper/CronHelper.jsx")),
  },

  // Batch 6 — Everyday developer additions
  {
    id: "regex-tester",
    pageTitle: "Regex Tester - Test Regular Expressions Live",
    metaDescription:
      "Test regular expressions against sample text with live match highlighting. Debug your patterns before they ship to production. Test your regex.",
    name: "Regex Tester",
    shortName: "Regex Tester",
    description:
      "Test regular expressions against sample text with live match highlighting.",
    category: "text",
    path: "/tools/regex-tester",
    icon: Regex,
    popular: true,
    keywords: ["regex", "regular expression", "pattern", "match", "test"],
    component: lazy(() => import("../tools/regex-tester/RegexTester.jsx")),
  },
  {
    id: "text-diff",
    pageTitle: "Text Diff Checker - Compare Text Online Free",
    metaDescription:
      "Compare two blocks of text and see every addition, deletion and change highlighted. Great for configs, contracts and drafts. Check the diff now.",
    name: "Text Diff Checker",
    shortName: "Text Diff",
    description: "Compare two blocks of text and highlight the differences.",
    category: "text",
    path: "/tools/text-diff",
    icon: GitCompareArrows,
    keywords: ["diff", "compare", "text", "difference", "changes"],
    component: lazy(() => import("../tools/text-diff/TextDiff.jsx")),
  },
  {
    id: "yaml-json",
    pageTitle: "YAML to JSON Converter & JSON to YAML",
    metaDescription:
      "Convert configuration files between YAML and JSON in both directions. Ideal for Kubernetes manifests, CI pipelines and app configs. Convert now.",
    name: "YAML ↔ JSON Converter",
    shortName: "YAML ↔ JSON",
    description: "Convert configuration files between YAML and JSON.",
    category: "json",
    path: "/tools/yaml-json",
    icon: FileCode2,
    keywords: ["yaml", "json", "convert", "config", "yml"],
    component: lazy(() => import("../tools/yaml-json/YamlJsonConverter.jsx")),
  },
  {
    id: "markdown-preview",
    pageTitle: "Markdown Previewer - Live Markdown Editor",
    metaDescription:
      "Write Markdown and see a live rendered preview as you type. Perfect for README files, docs and release notes. Open the editor and start writing.",
    name: "Markdown Previewer",
    shortName: "Markdown Preview",
    description: "Write Markdown and see a live rendered preview.",
    category: "formatting",
    path: "/tools/markdown-preview",
    icon: NotebookText,
    keywords: ["markdown", "preview", "render", "md", "gfm"],
    component: lazy(
      () => import("../tools/markdown-preview/MarkdownPreview.jsx"),
    ),
  },
  {
    id: "lorem-ipsum",
    pageTitle: "Lorem Ipsum Generator - Placeholder Text",
    metaDescription:
      "Generate lorem ipsum placeholder text for mockups, wireframes and layout tests. Copy it into your design in one click. Generate dummy text now.",
    name: "Lorem Ipsum Generator",
    shortName: "Lorem Ipsum",
    description: "Generate placeholder text for mockups and tests.",
    category: "generators",
    path: "/tools/lorem-ipsum",
    icon: BookOpen,
    keywords: ["lorem ipsum", "placeholder", "dummy text", "generator"],
    component: lazy(() => import("../tools/lorem-ipsum/LoremIpsum.jsx")),
  },
  {
    id: "slug-generator",
    pageTitle: "Slug Generator - Create SEO-Friendly URL Slugs",
    metaDescription:
      "Turn titles and headings into clean, lowercase, URL-safe slugs with spaces and symbols stripped out. Ideal for blogs and CMS pages. Create a slug.",
    name: "Slug Generator",
    shortName: "Slug Generator",
    description: "Convert any text into a clean, URL-safe slug.",
    category: "text",
    path: "/tools/slug-generator",
    icon: Link,
    keywords: ["slug", "url", "seo", "permalink", "kebab-case"],
    component: lazy(() => import("../tools/slug-generator/SlugGenerator.jsx")),
  },
  {
    id: "unit-converter",
    pageTitle: "Unit Converter - Length, Weight, Temp & Data",
    metaDescription:
      "Convert length, weight, temperature and data-size units, from metres to feet or megabytes to gigabytes, with instant results. Pick a unit to start.",
    name: "Unit Converter",
    shortName: "Unit Converter",
    description: "Convert length, weight, temperature and data-size units.",
    category: "conversion",
    path: "/tools/unit-converter",
    icon: Ruler,
    keywords: [
      "unit",
      "converter",
      "length",
      "weight",
      "temperature",
      "data size",
    ],
    component: lazy(() => import("../tools/unit-converter/UnitConverter.jsx")),
  },
  {
    id: "qr-code",
    pageTitle: "QR Code Generator - Free, No Sign-Up Needed",
    metaDescription:
      "Create a QR code from any URL or text in seconds. Everything is generated in your browser, so your data stays private. Make your QR code now.",
    name: "QR Code Generator",
    shortName: "QR Code",
    description:
      "Generate a QR code from text or a URL, entirely in your browser.",
    category: "generators",
    path: "/tools/qr-code",
    icon: QrCode,
    popular: true,
    keywords: ["qr", "qr code", "generator", "barcode"],
    component: lazy(() => import("../tools/qr-code/QrCodeGenerator.jsx")),
  },

  // Batch 7 — More everyday additions
  {
    id: "percentage-calculator",
    pageTitle: "Percentage Calculator - Percent Change & Ratio",
    metaDescription:
      "Work out percentages, percent increase or decrease and ratios in seconds. Handy for growth metrics, discounts and reports. Calculate it now.",
    name: "Percentage Calculator",
    shortName: "Percentage Calculator",
    description: "Calculate percentages, ratios and percent change.",
    category: "conversion",
    path: "/tools/percentage-calculator",
    icon: Percent,
    keywords: ["percentage", "percent", "calculator", "ratio", "change"],
    component: lazy(
      () => import("../tools/percentage-calculator/PercentageCalculator.jsx"),
    ),
  },
  {
    id: "regex-cheatsheet",
    pageTitle: "Regex Cheatsheet - Regular Expression Syntax",
    metaDescription:
      "A searchable cheatsheet of regex syntax: anchors, quantifiers, groups, lookaheads and character classes. Find the token you need in seconds.",
    name: "Regex Cheatsheet",
    shortName: "Regex Cheatsheet",
    description: "Searchable reference of common regular expression syntax.",
    category: "reference",
    path: "/tools/regex-cheatsheet",
    icon: ScrollText,
    keywords: [
      "regex",
      "regular expression",
      "cheatsheet",
      "reference",
      "syntax",
    ],
    component: lazy(
      () => import("../tools/regex-cheatsheet/RegexCheatsheet.jsx"),
    ),
  },
  {
    id: "git-cheatsheet",
    pageTitle: "Git Cheat Sheet - Common Git Commands List",
    metaDescription:
      "Forgot how to undo a commit or rename a branch? Search everyday Git commands with short, clear explanations. Keep this cheat sheet handy.",
    name: "Git Cheat Sheet",
    shortName: "Git Cheat Sheet",
    description: "Searchable reference of everyday Git commands.",
    category: "reference",
    path: "/tools/git-cheatsheet",
    icon: GitBranch,
    keywords: ["git", "cheatsheet", "reference", "commands", "version control"],
    component: lazy(() => import("../tools/git-cheatsheet/GitCheatsheet.jsx")),
  },
  {
    id: "url-parser",
    pageTitle: "URL Parser - Split a URL into Its Parts Online",
    metaDescription:
      "Break any URL into protocol, host, path and query parameters in a readable layout. Useful for debugging links, redirects and tracking tags. Parse one.",
    name: "URL Parser",
    shortName: "URL Parser",
    description:
      "Break a URL down into its protocol, host, path and query params.",
    category: "encoding",
    path: "/tools/url-parser",
    icon: SplitSquareHorizontal,
    keywords: ["url", "parser", "query params", "hostname", "uri"],
    component: lazy(() => import("../tools/url-parser/UrlParser.jsx")),
  },
  {
    id: "gitignore-generator",
    pageTitle: ">.gitignore Generator - Build One for Any Stack",
    metaDescription:
      "Generate a .gitignore file for your language and framework by picking your stack. Keep secrets and build files out of your repo. Build yours.",
    name: "Gitignore Generator",
    shortName: "Gitignore Generator",
    description: "Generate a .gitignore file for your stack.",
    category: "generators",
    path: "/tools/gitignore-generator",
    icon: FileX2,
    keywords: ["gitignore", "git", "generator", "ignore"],
    component: lazy(
      () => import("../tools/gitignore-generator/GitignoreGenerator.jsx"),
    ),
  },
  {
    id: "env-generator",
    pageTitle: ".env File Generator with .env.example",
    metaDescription:
      "Build a .env file and a matching .env.example from key-value pairs, ready to drop into your project. Share config safely with your team.",
    name: ".env Generator",
    shortName: ".env Generator",
    description:
      "Build a .env file (and matching .env.example) from key-value pairs.",
    category: "generators",
    path: "/tools/env-generator",
    icon: FileCog,
    keywords: ["env", "dotenv", "environment variables", "config", "generator"],
    component: lazy(() => import("../tools/env-generator/EnvGenerator.jsx")),
  },
  {
    id: "log-formatter",
    pageTitle: "Log Formatter - Pretty-Print Log Files Online",
    metaDescription:
      "Paste raw log lines and get readable, pretty-printed output with each severity level highlighted. Spot errors and warnings faster. Format your logs.",
    name: "Log Formatter",
    shortName: "Log Formatter",
    description:
      "Pretty-print raw log lines and highlight their severity level.",
    category: "formatting",
    path: "/tools/log-formatter",
    icon: FileText,
    keywords: ["log", "formatter", "json logs", "level", "pretty print"],
    component: lazy(() => import("../tools/log-formatter/LogFormatter.jsx")),
  },
  {
    id: "stack-trace-formatter",
    pageTitle: "Stack Trace Formatter - Java, JS & Python",
    metaDescription:
      "Clean up messy Java, JavaScript and Python stack traces with highlighting that surfaces the frames that matter. Debug quicker. Paste a trace.",
    name: "Stack Trace Formatter",
    shortName: "Stack Trace Formatter",
    description:
      "Clean up and highlight Java, JavaScript and Python stack traces.",
    category: "formatting",
    path: "/tools/stack-trace-formatter",
    icon: Bug,
    popular: true,
    keywords: [
      "stack trace",
      "exception",
      "error",
      "java",
      "javascript",
      "python",
    ],
    component: lazy(
      () => import("../tools/stack-trace-formatter/StackTraceFormatter.jsx"),
    ),
  },
  {
    id: "ascii-reference",
    pageTitle: "ASCII Table & Unicode Character Reference",
    metaDescription:
      "Search a full ASCII table with character codes and control characters explained. A quick reference for encoding and parsing work. Look it up now.",
    name: "ASCII / Unicode Reference",
    shortName: "ASCII Reference",
    description: "Searchable table of ASCII codes and control characters.",
    category: "reference",
    path: "/tools/ascii-reference",
    icon: Grid3x3,
    keywords: ["ascii", "unicode", "character codes", "reference", "table"],
    component: lazy(
      () => import("../tools/ascii-reference/AsciiReference.jsx"),
    ),
  },
];

export function getToolById(id) {
  return tools.find((tool) => tool.id === id);
}

export function getToolsByCategory(categoryId) {
  return tools.filter((tool) => tool.category === categoryId);
}

export function getActiveCategories() {
  const present = new Set(tools.map((tool) => tool.category));
  return Object.entries(categories)
    .filter(([id]) => present.has(id))
    .map(([id, name]) => ({ id, name, count: getToolsByCategory(id).length }));
}

export function getPopularTools() {
  return tools.filter((tool) => tool.popular);
}

export function getToolCount() {
  return tools.length;
}

export function getCategoryCount() {
  return new Set(tools.map((tool) => tool.category)).size;
}

export function searchTools(query) {
  const q = query.trim().toLowerCase();
  if (!q) return tools;
  return tools.filter((tool) => {
    const haystack = [
      tool.name,
      tool.description,
      categories[tool.category],
      ...tool.keywords,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
