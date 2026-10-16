// Integration tests for accounts and history against a real MongoDB:
// MONGODB_TEST_URI if set, otherwise an in-memory server (mongodb-memory-server,
// which downloads a mongod binary on first use). Skipped when neither works.
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import request from "supertest";
import { createServer } from "../app.js";
import { User } from "../models/User.js";
import { HistoryEntry } from "../models/HistoryEntry.js";

let memoryServer;
let available = false;

beforeAll(async () => {
  try {
    let uri = process.env.MONGODB_TEST_URI;
    if (!uri) {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri();
    }
    await mongoose.connect(uri, { dbName: "dsa-visualizer-test" });
    await Promise.all([User.init(), HistoryEntry.init()]);
    available = true;
  } catch (error) {
    console.warn(
      `Skipping API integration tests: no MongoDB (${error.message.split("\n")[0]})`,
    );
  }
});

afterAll(async () => {
  if (available) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await memoryServer?.stop();
});

beforeEach(async (context) => {
  if (!available) return context.skip();
  await Promise.all([User.deleteMany({}), HistoryEntry.deleteMany({})]);
});

const app = createServer();
const newUser = {
  name: "Ada",
  email: "ada@example.com",
  password: "correct horse",
};

async function signedInAgent(user = newUser) {
  const agent = request.agent(app);
  await agent.post("/api/auth/register").send(user).expect(201);
  return agent;
}

const runEntry = (overrides = {}) => ({
  kind: "algorithm",
  itemId: "quick-sort",
  title: "Quick Sort",
  input: { array: [5, 2, 8] },
  summary: { steps: 12, comparisons: 3, swaps: 2, result: "Sorted!" },
  link: "/visualizer?algo=quick-sort&arr=5%2C2%2C8",
  ...overrides,
});

describe("auth", () => {
  it("registers, keeps the session in an httpOnly cookie, and logs out", async () => {
    const agent = request.agent(app);
    const res = await agent
      .post("/api/auth/register")
      .send(newUser)
      .expect(201);
    expect(res.body.user).toMatchObject({
      name: "Ada",
      email: "ada@example.com",
    });
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.headers["set-cookie"][0]).toMatch(/dsa_session=.*HttpOnly/i);

    await agent.get("/api/auth/me").expect(200);
    await agent.post("/api/auth/logout").expect(204);
    const after = await agent.get("/api/auth/me").expect(200);
    expect(after.body.user).toBeNull();
  });

  it("stores a bcrypt hash, never the password", async () => {
    await signedInAgent();
    const stored = await User.findOne({ email: newUser.email }).select(
      "+passwordHash",
    );
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(stored.passwordHash).not.toContain(newUser.password);
  });

  it("rejects duplicate emails (case-insensitive)", async () => {
    await signedInAgent();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...newUser, email: "ADA@example.com" })
      .expect(409);
    expect(res.body.fields.email).toBeTruthy();
  });

  it("logs in with the right password only, with the same error for unknown emails", async () => {
    await signedInAgent();
    await request(app)
      .post("/api/auth/login")
      .send({ email: newUser.email, password: newUser.password })
      .expect(200);
    const wrong = await request(app)
      .post("/api/auth/login")
      .send({ email: newUser.email, password: "wrong password" })
      .expect(401);
    const unknown = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "whatever1" })
      .expect(401);
    expect(wrong.body.error).toBe(unknown.body.error);
  });

  it("takes about as long for an unknown email as for a wrong password", async () => {
    await signedInAgent();
    const time = async (email) => {
      const start = performance.now();
      await request(app)
        .post("/api/auth/login")
        .send({ email, password: "wrong password" });
      return performance.now() - start;
    };
    const known = await time(newUser.email);
    const unknown = await time("nobody@example.com");
    // Both run a full bcrypt comparison (well over 50ms at 12 rounds)
    expect(unknown).toBeGreaterThan(known / 3);
  });

  it("validates input", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "", email: "bad", password: "short" })
      .expect(400);
    expect(Object.keys(res.body.fields).sort()).toEqual([
      "email",
      "name",
      "password",
    ]);
  });

  it("updates the name and changes the password", async () => {
    const agent = await signedInAgent();
    const res = await agent
      .patch("/api/auth/me")
      .send({ name: "Ada L." })
      .expect(200);
    expect(res.body.user.name).toBe("Ada L.");

    await agent
      .put("/api/auth/password")
      .send({ currentPassword: "nope", newPassword: "new password 1" })
      .expect(400);
    await agent
      .put("/api/auth/password")
      .send({
        currentPassword: newUser.password,
        newPassword: "new password 1",
      })
      .expect(204);
    await request(app)
      .post("/api/auth/login")
      .send({ email: newUser.email, password: "new password 1" })
      .expect(200);
  });

  it("deletes the account and its history after confirming the password", async () => {
    const agent = await signedInAgent();
    await agent.post("/api/history").send(runEntry()).expect(201);
    await agent.delete("/api/auth/me").send({ password: "wrong" }).expect(400);
    await agent
      .delete("/api/auth/me")
      .send({ password: newUser.password })
      .expect(204);
    expect(await User.countDocuments()).toBe(0);
    expect(await HistoryEntry.countDocuments()).toBe(0);
  });
});

describe("history", () => {
  it("requires a session", async () => {
    await request(app).get("/api/history").expect(401);
    await request(app).post("/api/history").send(runEntry()).expect(401);
  });

  it("saves runs with their input and lists them newest first", async () => {
    const agent = await signedInAgent();
    await agent.post("/api/history").send(runEntry()).expect(201);
    await agent
      .post("/api/history")
      .send(
        runEntry({
          itemId: "bfs",
          title: "Breadth-First Search",
          input: { graph: { vertices: 3 } },
          link: "/visualizer?algo=bfs",
        }),
      )
      .expect(201);

    const res = await agent.get("/api/history").expect(200);
    expect(res.body.total).toBe(2);
    expect(res.body.entries.map((e) => e.itemId)).toEqual([
      "bfs",
      "quick-sort",
    ]);
    expect(res.body.entries[1].input).toEqual({ array: [5, 2, 8] });

    const filtered = await agent
      .get("/api/history?itemId=quick-sort")
      .expect(200);
    expect(filtered.body.total).toBe(1);
  });

  it("paginates", async () => {
    const agent = await signedInAgent();
    for (let i = 0; i < 5; i++)
      await agent.post("/api/history").send(runEntry()).expect(201);
    const res = await agent.get("/api/history?limit=2&page=3").expect(200);
    expect(res.body).toMatchObject({ page: 3, totalPages: 3, total: 5 });
    expect(res.body.entries).toHaveLength(1);
  });

  it("rejects links that leave the app", async () => {
    const agent = await signedInAgent();
    await agent
      .post("/api/history")
      .send(runEntry({ link: "https://evil.example" }))
      .expect(400);
  });

  it("computes stats per algorithm and data structure", async () => {
    const agent = await signedInAgent();
    await agent.post("/api/history").send(runEntry()).expect(201);
    await agent.post("/api/history").send(runEntry()).expect(201);
    await agent
      .post("/api/history")
      .send({
        kind: "data-structure",
        itemId: "heap",
        title: "Heap",
        input: { values: [1] },
        link: "/data-structures/heap?values=1",
      })
      .expect(201);

    const res = await agent.get("/api/history/stats").expect(200);
    expect(res.body.total).toBe(3);
    expect(res.body.byKind).toEqual({ algorithm: 2, "data-structure": 1 });
    expect(res.body.byItem[0]).toMatchObject({
      itemId: "quick-sort",
      count: 2,
    });
  });

  it("only lets users update and delete their own entries", async () => {
    const ada = await signedInAgent();
    const bob = await signedInAgent({
      name: "Bob",
      email: "bob@example.com",
      password: "password b",
    });
    const { body } = await ada
      .post("/api/history")
      .send(runEntry())
      .expect(201);
    const id = body.entry.id;

    await bob
      .patch(`/api/history/${id}`)
      .send({ summary: { operations: 9 } })
      .expect(404);
    await bob.delete(`/api/history/${id}`).expect(404);
    await ada
      .patch(`/api/history/${id}`)
      .send({ summary: { operations: 9 } })
      .expect(200);
    await ada.delete("/api/history/not-an-id").expect(404);
    await ada.delete(`/api/history/${id}`).expect(204);
  });

  it("clears all history for the current user only", async () => {
    const ada = await signedInAgent();
    const bob = await signedInAgent({
      name: "Bob",
      email: "bob@example.com",
      password: "password b",
    });
    await ada.post("/api/history").send(runEntry()).expect(201);
    await bob.post("/api/history").send(runEntry()).expect(201);
    const res = await ada.delete("/api/history").expect(200);
    expect(res.body.deleted).toBe(1);
    expect(await HistoryEntry.countDocuments()).toBe(1);
  });
});

// Keep last: it uses up the shared failed-attempt budget for this process
describe("rate limiting", () => {
  it("blocks repeated failed logins but never counts successful ones", async () => {
    await signedInAgent();
    let lastStatus;
    for (let attempt = 0; attempt < 25 && lastStatus !== 429; attempt++) {
      ({ status: lastStatus } = await request(app)
        .post("/api/auth/login")
        .send({ email: newUser.email, password: "wrong password" }));
    }
    expect(lastStatus).toBe(429);
  }, 30_000); // each failed login runs a deliberately slow bcrypt check
});
