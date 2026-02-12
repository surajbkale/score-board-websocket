import { Router } from "express";
import {
  createMatcheSchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { getMatcheStatus } from "../utils/match-status.js";
import { desc } from "drizzle-orm";

export const matchesRouter: Router = Router();

const MAX_LIMIT = 100;

matchesRouter.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid query",
      details: JSON.stringify(parsed.error),
    });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);

    res.json({ data });
  } catch (error) {}
});

matchesRouter.post("/", async (req, res) => {
  const parsed = createMatcheSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid Payload",
      details: JSON.stringify(parsed.error),
    });
  }

  const {
    data: { startTime, endTime, homeScore, awayScore },
  } = parsed;

  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatcheStatus(new Date(startTime), new Date(endTime)) as
          | "scheduled"
          | "live"
          | "finished",
      })
      .returning();

    res.status(201).json({
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create match",
      details: JSON.stringify(error),
    });
  }
});
