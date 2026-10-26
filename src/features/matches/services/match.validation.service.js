import { matchReadRepository } from "../repositories/match.read.repository";

const MINUTE_MS = 60 * 1000;

function overlaps(startA, durationA, startB, durationB) {
  const aStart = new Date(startA).getTime();
  const bStart = new Date(startB).getTime();
  if (Number.isNaN(aStart) || Number.isNaN(bStart)) return false;

  const aEnd = aStart + Number(durationA || 60) * MINUTE_MS;
  const bEnd = bStart + Number(durationB || 60) * MINUTE_MS;

  return aStart < bEnd && bStart < aEnd;
}

export async function validateMatchRules(data, excludeId = null) {
  if (!data?.courtId || !data?.scheduledAt) {
    return {
      success: false,
      error: "La cancha y la fecha del partido son obligatorias.",
    };
  }

  const candidates = await matchReadRepository.findForCourtAround(
    data.courtId,
    data.scheduledAt,
    excludeId
  );

  const conflict = candidates.find((candidate) =>
    overlaps(data.scheduledAt, data.durationMins, candidate.scheduledAt, candidate.durationMins)
  );

  if (conflict) {
    return {
      success: false,
      error: `Ya hay un partido programado en esa cancha en ese horario («${conflict.title}»).`,
      details: {
        scheduledAt: ["El horario se solapa con otro partido en la misma cancha."],
      },
    };
  }

  return { success: true };
}
