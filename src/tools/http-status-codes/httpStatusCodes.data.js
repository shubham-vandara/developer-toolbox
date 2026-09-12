export const STATUS_CATEGORIES = [
  { id: "1xx", label: "1xx Informational" },
  { id: "2xx", label: "2xx Success" },
  { id: "3xx", label: "3xx Redirection" },
  { id: "4xx", label: "4xx Client Error" },
  { id: "5xx", label: "5xx Server Error" },
];

export const HTTP_STATUS_CODES = [
  { code: 100, name: "Continue", category: "1xx", description: "The server has received the request headers and the client should proceed to send the request body." },
  { code: 101, name: "Switching Protocols", category: "1xx", description: "The requester has asked the server to switch protocols." },
  { code: 102, name: "Processing", category: "1xx", description: "The server has received and is processing the request, but no response is available yet." },

  { code: 200, name: "OK", category: "2xx", description: "The request has succeeded." },
  { code: 201, name: "Created", category: "2xx", description: "The request has succeeded and a new resource has been created." },
  { code: 202, name: "Accepted", category: "2xx", description: "The request has been accepted for processing, but processing is not complete." },
  { code: 204, name: "No Content", category: "2xx", description: "The server successfully processed the request and is not returning any content." },
  { code: 206, name: "Partial Content", category: "2xx", description: "The server is delivering only part of the resource due to a range header sent by the client." },

  { code: 300, name: "Multiple Choices", category: "3xx", description: "The request has more than one possible response." },
  { code: 301, name: "Moved Permanently", category: "3xx", description: "The resource has been permanently moved to a new URL." },
  { code: 302, name: "Found", category: "3xx", description: "The resource resides temporarily under a different URL." },
  { code: 303, name: "See Other", category: "3xx", description: "The response can be found under a different URL using a GET request." },
  { code: 304, name: "Not Modified", category: "3xx", description: "The resource has not been modified since the version specified by request headers." },
  { code: 307, name: "Temporary Redirect", category: "3xx", description: "The resource resides temporarily under a different URL; the method must not change." },
  { code: 308, name: "Permanent Redirect", category: "3xx", description: "The resource has been permanently moved; the method must not change." },

  { code: 400, name: "Bad Request", category: "4xx", description: "The server cannot process the request due to a client error." },
  { code: 401, name: "Unauthorized", category: "4xx", description: "Authentication is required and has failed or has not been provided." },
  { code: 402, name: "Payment Required", category: "4xx", description: "Reserved for future use." },
  { code: 403, name: "Forbidden", category: "4xx", description: "The server understood the request but refuses to authorize it." },
  { code: 404, name: "Not Found", category: "4xx", description: "The requested resource could not be found." },
  { code: 405, name: "Method Not Allowed", category: "4xx", description: "The request method is not supported for the requested resource." },
  { code: 406, name: "Not Acceptable", category: "4xx", description: "The requested resource is not available in a format acceptable to the client." },
  { code: 408, name: "Request Timeout", category: "4xx", description: "The server timed out waiting for the request." },
  { code: 409, name: "Conflict", category: "4xx", description: "The request conflicts with the current state of the server." },
  { code: 410, name: "Gone", category: "4xx", description: "The resource is no longer available and will not be available again." },
  { code: 411, name: "Length Required", category: "4xx", description: "The request did not specify the length of its content." },
  { code: 413, name: "Payload Too Large", category: "4xx", description: "The request entity is larger than limits defined by the server." },
  { code: 414, name: "URI Too Long", category: "4xx", description: "The URI provided was too long for the server to process." },
  { code: 415, name: "Unsupported Media Type", category: "4xx", description: "The request entity has a media type the server does not support." },
  { code: 422, name: "Unprocessable Entity", category: "4xx", description: "The request was well-formed but contains semantic errors." },
  { code: 429, name: "Too Many Requests", category: "4xx", description: "The client has sent too many requests in a given amount of time." },

  { code: 500, name: "Internal Server Error", category: "5xx", description: "The server encountered an unexpected condition." },
  { code: 501, name: "Not Implemented", category: "5xx", description: "The server does not support the functionality required to fulfill the request." },
  { code: 502, name: "Bad Gateway", category: "5xx", description: "The server, acting as a gateway, received an invalid response from an upstream server." },
  { code: 503, name: "Service Unavailable", category: "5xx", description: "The server is currently unavailable, usually due to maintenance or overload." },
  { code: 504, name: "Gateway Timeout", category: "5xx", description: "The server, acting as a gateway, did not receive a timely response from an upstream server." },
  { code: 505, name: "HTTP Version Not Supported", category: "5xx", description: "The server does not support the HTTP protocol version used in the request." },
];

export function filterStatusCodes(query, category = "all") {
  const q = query.trim().toLowerCase();
  return HTTP_STATUS_CODES.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (!q) return true;
    return `${item.code} ${item.name} ${item.description}`.toLowerCase().includes(q);
  });
}
