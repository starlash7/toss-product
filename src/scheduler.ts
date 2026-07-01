export type AttendanceRole = "required" | "optional";

export type TimeSlot = {
  id: string;
  label: string;
};

export type Attendee = {
  name: string;
  role: AttendanceRole;
  unavailable: string[];
  avoid: string[];
};

export type Recommendation = {
  slot: TimeSlot;
  requiredUnavailable: string[];
  optionalUnavailable: string[];
  avoidConflicts: string[];
  alternatives: Recommendation[];
};

type RankedRecommendation = Recommendation & {
  rank: number;
};

export function recommendSlot(attendees: Attendee[], slots: TimeSlot[]): Recommendation {
  const ranked = rankSlots(attendees, slots);
  const [best, ...alternatives] = ranked;

  return {
    ...best,
    alternatives: alternatives.map(({ rank: _rank, ...recommendation }) => recommendation)
  };
}

function rankSlots(attendees: Attendee[], slots: TimeSlot[]): RankedRecommendation[] {
  return slots
    .map((slot, rank) => {
      const requiredUnavailable = namesMatching(attendees, slot.id, "required", "unavailable");
      const optionalUnavailable = namesMatching(attendees, slot.id, "optional", "unavailable");
      const avoidConflicts = attendees
        .filter((attendee) => attendee.avoid.includes(slot.id))
        .map((attendee) => attendee.name);

      return {
        slot,
        requiredUnavailable,
        optionalUnavailable,
        avoidConflicts,
        alternatives: [],
        rank
      };
    })
    .sort((a, b) => {
      return (
        a.requiredUnavailable.length - b.requiredUnavailable.length ||
        a.optionalUnavailable.length - b.optionalUnavailable.length ||
        a.avoidConflicts.length - b.avoidConflicts.length ||
        a.rank - b.rank
      );
    });
}

function namesMatching(
  attendees: Attendee[],
  slotId: string,
  role: AttendanceRole,
  field: "unavailable"
) {
  return attendees
    .filter((attendee) => attendee.role === role && attendee[field].includes(slotId))
    .map((attendee) => attendee.name);
}
