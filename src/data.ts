import type { Attendee, TimeSlot } from "./scheduler";

export const slots: TimeSlot[] = [
  { id: "mon-10", label: "월요일 오전 10:00" },
  { id: "tue-13", label: "화요일 오후 1:00" },
  { id: "tue-15", label: "화요일 오후 3:00" },
  { id: "wed-10", label: "수요일 오전 10:00" },
  { id: "thu-16", label: "목요일 오후 4:00" }
];

export const attendees: Attendee[] = [
  {
    name: "민준",
    role: "required",
    unavailable: ["mon-10"],
    avoid: ["tue-13"]
  },
  {
    name: "서연",
    role: "required",
    unavailable: ["thu-16"],
    avoid: ["tue-13", "mon-10"]
  },
  {
    name: "지우",
    role: "required",
    unavailable: ["wed-10"],
    avoid: ["thu-16"]
  },
  {
    name: "유나",
    role: "required",
    unavailable: ["tue-13"],
    avoid: ["mon-10"]
  },
  {
    name: "도윤",
    role: "optional",
    unavailable: ["tue-15"],
    avoid: ["wed-10"]
  },
  {
    name: "하은",
    role: "optional",
    unavailable: ["wed-10"],
    avoid: ["tue-15"]
  }
];
