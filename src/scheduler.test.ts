import { describe, expect, it } from "vitest";
import { recommendSlot, type Attendee, type TimeSlot } from "./scheduler";

describe("recommendSlot", () => {
  it("keeps every required attendee available before considering optional attendees", () => {
    const slots: TimeSlot[] = [
      { id: "mon-14", label: "월요일 오후 2:00" },
      { id: "tue-15", label: "화요일 오후 3:00" }
    ];
    const attendees: Attendee[] = [
      { name: "민준", role: "required", unavailable: ["mon-14"], avoid: [] },
      { name: "서연", role: "required", unavailable: [], avoid: [] },
      { name: "도윤", role: "optional", unavailable: ["tue-15"], avoid: [] }
    ];

    const result = recommendSlot(attendees, slots);

    expect(result.slot.id).toBe("tue-15");
    expect(result.requiredUnavailable).toHaveLength(0);
    expect(result.optionalUnavailable).toEqual(["도윤"]);
  });

  it("uses avoid counts after required and optional availability are equal", () => {
    const slots: TimeSlot[] = [
      { id: "mon-14", label: "월요일 오후 2:00" },
      { id: "tue-15", label: "화요일 오후 3:00" }
    ];
    const attendees: Attendee[] = [
      { name: "민준", role: "required", unavailable: [], avoid: ["mon-14"] },
      { name: "서연", role: "required", unavailable: [], avoid: [] },
      { name: "도윤", role: "optional", unavailable: [], avoid: ["mon-14"] }
    ];

    const result = recommendSlot(attendees, slots);

    expect(result.slot.id).toBe("tue-15");
    expect(result.avoidConflicts).toHaveLength(0);
  });
});
