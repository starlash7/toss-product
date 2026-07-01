import { useMemo, useState } from "react";
import { attendees, slots } from "./data";
import { recommendSlot, type Attendee, type Recommendation, type TimeSlot } from "./scheduler";

type Step = "create" | "conditions" | "result" | "confirmed";
type SlotTone = "recommended" | "blocked" | "optional" | "avoid" | "open";

const stepLabels: Record<Step, string> = {
  create: "회의 만들기",
  conditions: "조건 입력",
  result: "추천 결과",
  confirmed: "확정/공유"
};

const calendarDays = ["월", "화", "수", "목"];
const calendarTimes = ["10:00", "13:00", "15:00", "16:00"];

export default function App() {
  const [step, setStep] = useState<Step>("create");
  const recommendation = useMemo(() => recommendSlot(attendees, slots), []);

  return (
    <main className="app-shell">
      <section className="prototype">
        <header className="top-bar">
          <div>
            <p className="eyebrow">일정 조율</p>
            <h1>다음 주 제품 리뷰</h1>
          </div>
          <div className="top-meta" aria-label="회의 조건">
            <span>1시간</span>
            <span>필수4 · 선택2</span>
          </div>
        </header>

        <StepNav activeStep={step} />

        {step === "create" && (
          <CreateMeeting recommendation={recommendation} onNext={() => setStep("conditions")} />
        )}
        {step === "conditions" && (
          <ConditionInput recommendation={recommendation} onNext={() => setStep("result")} />
        )}
        {step === "result" && (
          <RecommendationResult
            recommendation={recommendation}
            onBack={() => setStep("conditions")}
            onConfirm={() => setStep("confirmed")}
          />
        )}
        {step === "confirmed" && (
          <Confirmation recommendation={recommendation} onReset={() => setStep("create")} />
        )}
      </section>
    </main>
  );
}

function StepNav({ activeStep }: { activeStep: Step }) {
  const steps = Object.entries(stepLabels) as [Step, string][];
  const activeIndex = steps.findIndex(([key]) => key === activeStep);

  return (
    <nav className="step-nav" aria-label="진행 단계">
      <span>{activeIndex + 1}/4</span>
      <strong>{stepLabels[activeStep]}</strong>
    </nav>
  );
}

function CreateMeeting({
  recommendation,
  onNext
}: {
  recommendation: Recommendation;
  onNext: () => void;
}) {
  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">회의 만들기</p>
        <h2>다음 주 후보 시간</h2>
      </div>

      <CalendarBoard recommendation={recommendation} />

      <div className="summary-strip" aria-label="회의 요약">
        <SummaryItem label="후보" value={`${slots.length}개`} />
        <SummaryItem label="참석자" value="6명" />
      </div>

      <button className="primary-button" type="button" onClick={onNext}>
        조건 입력하기
      </button>
    </section>
  );
}

function ConditionInput({
  recommendation,
  onNext
}: {
  recommendation: Recommendation;
  onNext: () => void;
}) {
  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">조건 입력</p>
        <h2>불가능과 선호를 구분</h2>
      </div>

      <CalendarBoard recommendation={recommendation} />

      <div className="attendee-list">
        {attendees.map((attendee) => (
          <AttendeeRow attendee={attendee} key={attendee.name} />
        ))}
      </div>

      <button className="primary-button" type="button" onClick={onNext}>
        추천 시간 보기
      </button>
    </section>
  );
}

function RecommendationResult({
  recommendation,
  onBack,
  onConfirm
}: {
  recommendation: Recommendation;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const alternative = recommendation.alternatives[0];

  return (
    <section className="result-layout">
      <div className="recommendation-card">
        <p className="eyebrow">추천 시간</p>
        <h2>{formatSlotTitle(recommendation.slot)}</h2>
        <div className="evidence-list">
          <EvidenceBadge tone="good" label="필수 전원 가능" />
          <EvidenceBadge tone="warning" label="선택 1명 조정" />
          <EvidenceBadge tone="neutral" label="선호 충돌 1명" />
        </div>
        <button className="primary-button" type="button" onClick={onConfirm}>
          이 시간으로 확정
        </button>
      </div>

      <div className="calendar-panel">
        <CalendarBoard recommendation={recommendation} />
        {alternative && (
          <details className="alternative">
            <summary>2순위 보기</summary>
            <div className="alternative-body">
              <strong>{formatSlotTitle(alternative.slot)}</strong>
              <p>
                선택 {alternative.optionalUnavailable.length}명 · 선호{" "}
                {alternative.avoidConflicts.length}명
              </p>
            </div>
          </details>
        )}
        <button className="secondary-button" type="button" onClick={onBack}>
          조건 다시 보기
        </button>
      </div>
    </section>
  );
}

function Confirmation({
  recommendation,
  onReset
}: {
  recommendation: Recommendation;
  onReset: () => void;
}) {
  const shareText = `다음 주 제품 리뷰는 ${recommendation.slot.label}에 진행합니다. 필수 참석자는 모두 가능하고, 선택 참석자 1명만 참석이 어렵습니다.`;

  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">확정/공유</p>
        <h2>확정 완료</h2>
      </div>

      <CalendarBoard recommendation={recommendation} compact />

      <div className="share-box">
        <strong>{formatSlotTitle(recommendation.slot)}</strong>
        <p>필수 전원 가능 · 선택 1명 조정</p>
      </div>

      <button
        className="primary-button"
        type="button"
        onClick={() => navigator.clipboard?.writeText(shareText)}
      >
        공유 문구 복사
      </button>
      <button className="text-button" type="button" onClick={onReset}>
        다시 보기
      </button>
    </section>
  );
}

function CalendarBoard({
  recommendation,
  compact = false
}: {
  recommendation: Recommendation;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "calendar compact" : "calendar"} aria-label="다음 주 후보 시간">
      <div className="calendar-head empty-cell" />
      {calendarDays.map((day) => (
        <div className="calendar-head" key={day}>
          <strong>{day}</strong>
          <span>{slots.find((slot) => slot.day === day)?.date}</span>
        </div>
      ))}

      {calendarTimes.map((time) => (
        <CalendarRow key={time} recommendation={recommendation} time={time} />
      ))}
    </div>
  );
}

function CalendarRow({ recommendation, time }: { recommendation: Recommendation; time: string }) {
  return (
    <>
      <div className="time-label">{time}</div>
      {calendarDays.map((day) => {
        const slot = slots.find((candidate) => candidate.day === day && candidate.time === time);

        return slot ? (
          <CalendarSlotCell key={`${day}-${time}`} recommendation={recommendation} slot={slot} />
        ) : (
          <div className="calendar-cell empty-slot" key={`${day}-${time}`} />
        );
      })}
    </>
  );
}

function CalendarSlotCell({
  recommendation,
  slot
}: {
  recommendation: Recommendation;
  slot: TimeSlot;
}) {
  const detail = getSlotDetail(recommendation, slot);
  const tone = getSlotTone(recommendation, detail);

  return (
    <div className={`calendar-cell ${tone}`}>
      <strong>{getSlotCaption(tone)}</strong>
      <span>{getSlotMeta(tone, detail)}</span>
    </div>
  );
}

function AttendeeRow({ attendee }: { attendee: Attendee }) {
  return (
    <article className="attendee-row">
      <div>
        <strong>{attendee.name}</strong>
        <span className={attendee.role === "required" ? "role required" : "role optional"}>
          {attendee.role === "required" ? "필수" : "선택"}
        </span>
      </div>
      <p>
        불가능 {labelSlots(attendee.unavailable)} · 피하고 싶음 {labelSlots(attendee.avoid)}
      </p>
    </article>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EvidenceBadge({ label, tone }: { label: string; tone: "good" | "warning" | "neutral" }) {
  return <span className={`evidence ${tone}`}>{label}</span>;
}

function getSlotDetail(recommendation: Recommendation, slot: TimeSlot) {
  return [recommendation, ...recommendation.alternatives].find((item) => item.slot.id === slot.id);
}

function getSlotTone(recommendation: Recommendation, detail?: Recommendation): SlotTone {
  if (!detail) {
    return "open";
  }

  if (detail.slot.id === recommendation.slot.id) {
    return "recommended";
  }

  if (detail.requiredUnavailable.length > 0) {
    return "blocked";
  }

  if (detail.optionalUnavailable.length > 0) {
    return "optional";
  }

  if (detail.avoidConflicts.length > 0) {
    return "avoid";
  }

  return "open";
}

function getSlotCaption(tone: SlotTone) {
  return {
    recommended: "추천",
    blocked: "필수 불가",
    optional: "선택 조정",
    avoid: "선호 충돌",
    open: "가능"
  }[tone];
}

function getSlotMeta(tone: SlotTone, detail?: Recommendation) {
  if (!detail) {
    return "";
  }

  if (tone === "recommended") {
    return "최선";
  }

  if (tone === "blocked") {
    return `${detail.requiredUnavailable.length}명`;
  }

  if (tone === "optional") {
    return `${detail.optionalUnavailable.length}명`;
  }

  if (tone === "avoid") {
    return `${detail.avoidConflicts.length}명`;
  }

  return "";
}

function formatSlotTitle(slot: TimeSlot) {
  return `${slot.day}요일 ${slot.time}`;
}

function labelSlots(ids: string[]) {
  return ids.map((id) => slots.find((slot) => slot.id === id)?.label ?? id).join(", ");
}
