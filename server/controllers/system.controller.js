// GET /api/ping - health check
export const ping = (_req, res) => {
  res.json({ message: process.env.PING_MESSAGE ?? "ping" });
};

// GET /api/demo - example endpoint
export const demo = (_req, res) => {
  res.status(200).json({ message: "Hello from Express server" });
};
