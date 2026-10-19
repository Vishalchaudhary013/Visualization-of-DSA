/** Validates req.body against a zod schema and replaces it with the parsed data. */
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const fields = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "form";
      fields[key] ??= issue.message;
    }
    return res.status(400).json({ error: Object.values(fields)[0], fields });
  }
  req.body = result.data;
  next();
};
