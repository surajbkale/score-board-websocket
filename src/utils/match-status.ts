import { MATCH_STATUS } from "../validation/matches.js";

type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];

type MatchLike = {
  startTime: Date | string | number;
  endTime: Date | string | number;
  status: MatchStatus;
};

type updateStatusFn = (status: MatchStatus) => void | Promise<void>;

export function getMatchStatus(
  startTime: Date,
  endTime: Date,
  now = new Date(),
) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  if (now < start) {
    return MATCH_STATUS.SCHEDULED;
  }

  if (now >= end) {
    return MATCH_STATUS.FINISHED;
  }

  return MATCH_STATUS.LIVE;
}

export async function syncMatchStatus(
  match: MatchLike,
  updateStatus: updateStatusFn,
) {
  const nextStatus = getMatchStatus(
    match.startTime as Date,
    match.endTime as Date,
  );
  if (!nextStatus) {
    return match.status;
  }

  if (match.status !== nextStatus) {
    await updateStatus(nextStatus);
    match.status = nextStatus;
  }
  return match.status;
}
