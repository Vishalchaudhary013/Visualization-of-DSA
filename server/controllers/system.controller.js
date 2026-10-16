// GET /api/ping - health check
export const ping = (_req, res) => {
  res.json({ message: process.env.PING_MESSAGE ?? "ping" });
};
