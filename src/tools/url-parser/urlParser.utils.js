export function parseUrl(input) {
  const trimmed = input.trim();
  if (!trimmed) return { success: false, error: "Enter a URL to parse." };

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return {
      success: false,
      error: "That doesn't look like a valid, fully-qualified URL. Make sure to include the protocol, e.g. https://",
    };
  }

  const defaultPorts = { "http:": "80", "https:": "443", "ftp:": "21" };
  const params = Array.from(url.searchParams.entries()).map(([key, value]) => ({ key, value }));

  return {
    success: true,
    href: url.href,
    protocol: url.protocol,
    origin: url.origin,
    username: url.username,
    password: url.password,
    hostname: url.hostname,
    port: url.port || defaultPorts[url.protocol] || "",
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    params,
  };
}
