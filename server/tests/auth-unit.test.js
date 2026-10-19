import { describe, expect, it, vi } from "vitest";
import {
  SESSION_COOKIE,
  createSessionToken,
  readSessionToken,
} from "../utils/session.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { createHistorySchema, registerSchema } from "../validation/schemas.js";
import { PROBLEMS } from "../../shared/problems.js";

const mockResponse = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

describe("session tokens", () => {
  it("round-trips the user id", () => {
    expect(readSessionToken(createSessionToken("abc123"))).toBe("abc123");
  });

  it("rejects tampered or missing tokens", () => {
    const token = createSessionToken("abc123");
    expect(readSessionToken(`${token}x`)).toBeNull();
    expect(readSessionToken("not-a-token")).toBeNull();
    expect(readSessionToken(undefined)).toBeNull();
  });
});

describe("requireAuth", () => {
  it("rejects requests without a session", () => {
    const res = mockResponse();
    const next = vi.fn();
    requireAuth({ cookies: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("accepts a valid session and sets req.userId", () => {
    const userId = "65f1c0ffee0000000000abcd";
    const req = { cookies: { [SESSION_COOKIE]: createSessionToken(userId) } };
    const next = vi.fn();
    requireAuth(req, mockResponse(), next);
    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe(userId);
  });
});

describe("validateBody", () => {
  it("returns the first error and per-field messages", () => {
    const res = mockResponse();
    validateBody(registerSchema)({ body: { email: "x" } }, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toBeTruthy();
    expect(Object.keys(body.fields)).toEqual(
      expect.arrayContaining(["name", "email", "password"]),
    );
  });

  it("normalises valid input", () => {
    const req = {
      body: {
        name: "  Ada ",
        email: " ADA@Example.com",
        password: "longenough",
      },
    };
    const next = vi.fn();
    validateBody(registerSchema)(req, mockResponse(), next);
    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({
      name: "Ada",
      email: "ada@example.com",
      password: "longenough",
    });
  });
});

describe("history links", () => {
  const entry = (link) => ({
    kind: "algorithm",
    itemId: "quick-sort",
    title: "Quick Sort",
    link,
  });

  it.each([
    "/visualizer?algo=quick-sort&arr=5%2C2%2C8",
    "/data-structures/heap?values=1%2C2&mode=min",
  ])("accepts in-app link %s", (link) => {
    expect(createHistorySchema.safeParse(entry(link)).success).toBe(true);
  });

  it.each(Object.values(PROBLEMS).map((problem) => [problem.id, problem]))(
    "accepts a run of the %s problem",
    (_, problem) => {
      const example = problem.examples.at(-1);
      const params = new URLSearchParams({ problem: problem.id });
      for (const field of problem.fields)
        params.set(field.name, JSON.stringify(example[field.name]));
      const result = createHistorySchema.safeParse({
        kind: "problem",
        itemId: problem.id,
        title: problem.title,
        input: example,
        link: `/patterns/${problem.pattern}?${params}`,
      });
      expect(result.success).toBe(true);
    },
  );

  it.each([
    "//evil.example",
    "https://evil.example",
    "javascript:alert(1)",
    "/admin",
  ])("rejects %s", (link) => {
    expect(createHistorySchema.safeParse(entry(link)).success).toBe(false);
  });
});
