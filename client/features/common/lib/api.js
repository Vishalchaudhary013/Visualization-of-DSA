/** Error from the API with the HTTP status and per-field messages, if any. */
export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

/** JSON fetch wrapper for /api routes; the session cookie is sent automatically. */
export async function api(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection.", 0);
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      data.error ?? "Something went wrong. Please try again.",
      response.status,
      data.fields,
    );
  }
  return data;
}
