import { useMemo, useState } from "react";
import { attendees, slots } from "./data";
import { recommendSlot, type Attendee, type Recommendation } from "./scheduler";

type Step = "create" | "conditions" | "result" | "confirmed";

const stepLabels: Record<Step, string> = {
  create: "회의 만들기",
  conditions: "조건 입력",
  result: "추천 결과",
  confirmed: "확정/공유"
};

export default function App() {
  const [step, setStep] = useState<Step>("create");
  const recommendation = useMemo(() => recommendSlot(attendees, slots), []);

  return (
    <main className="app-shell">
      <section className="prototype">
        <header className="app-header">
          <p className="eyebrow">6명 회의 일정 조율</p>
          <h1>모두가 완벽히 원하는 시간보다, 모두가 납득할 수 있는 1시간</h1>
        </header>

        <StepNav activeStep={step} />

        {step === "create" && <CreateMeeting onNext={() => setStep("conditions")} />}
        {step === "conditions" && <ConditionInput onNext={() => setStep("result")} />}
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
      {steps.map(([key, label], index) => (
        <span className={index <= activeIndex ? "step is-active" : "step"} key={key}>
          <span className="step-number">{index + 1}</span>
          {label}
        </span>
      ))}
    </nav>
  );
}

function CreateMeeting({ onNext }: { onNext: () => void }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">회의 만들기</p>
        <h2>다음 주 제품 리뷰</h2>
        <p>회의 조건은 이미 정해져 있습니다. 이제 6명의 제약과 선호를 모아 확정 가능한 시간을 찾습니다.</p>
      </div>

      <div className="summary-grid">
        <SummaryItem label="회의 시간" value="1시간" />
        <SummaryItem label="일정 범위" value="다음 주" />
        <SummaryItem label="참석자" value="6명" />
        <SummaryItem label="중요도" value="필수 4명, 선택 2명" />
      </div>

      <button className="primary-button" type="button" onClick={onNext}>
        조건 입력하기
      </button>
    </section>
  );
}

function ConditionInput({ onNext }: { onNext: () => void }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <p className="eyebrow">6명 조건 입력</p>
        <h2>불가능한 시간과 피하고 싶은 시간을 나눠 봅니다</h2>
        <p>모든 조건을 같은 무게로 보지 않고, 필수 참석 여부와 시간의 성격을 구분합니다.</p>
      </div>

      <div className="attendee-grid">
        {attendees.map((attendee) => (
          <AttendeeCard attendee={attendee} key={attendee.name} />
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
    <section className="panel result-panel">
      <div className="recommendation-card">
        <p className="eyebrow">추천 결과</p>
        <h2>{recommendation.slot.label}</h2>
        <p className="result-copy">이 시간이 가장 덜 무리합니다.</p>

        <div className="evidence-list">
          <EvidenceBadge tone="good" label="필수 참석자 전원 가능" />
          <EvidenceBadge
            tone="warning"
            label={`선택 참석자 ${recommendation.optionalUnavailable.length}명 어려움`}
          />
          <EvidenceBadge
            tone="neutral"
            label={`선호 충돌 ${recommendation.avoidConflicts.length}명`}
          />
        </div>

        <p className="reason">
          필수 참석자는 모두 가능하고, 선택 참석자 1명과 선호 1건만 조정하면 확정할 수 있습니다.
        </p>
      </div>

      {alternative && (
        <details className="alternative">
          <summary>2순위 후보 보기</summary>
          <div className="alternative-body">
            <strong>{alternative.slot.label}</strong>
            <p>
              필수 참석자 {alternative.requiredUnavailable.length}명, 선택 참석자{" "}
              {alternative.optionalUnavailable.length}명, 선호 충돌{" "}
              {alternative.avoidConflicts.length}명이 걸립니다.
            </p>
          </div>
        </details>
      )}

      <div className="button-row">
        <button className="secondary-button" type="button" onClick={onBack}>
          조건 다시 보기
        </button>
        <button className="primary-button" type="button" onClick={onConfirm}>
          이 시간으로 확정
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
        <h2>{recommendation.slot.label}으로 확정했습니다</h2>
        <p>공유할 때도 결정 근거가 함께 보이도록 정리합니다.</p>
      </div>

      <div className="share-box">
        <p>
          다음 주 제품 리뷰는 <strong>{recommendation.slot.label}</strong>에 진행합니다.
          필수 참석자는 모두 가능하고, 선택 참석자 1명만 참석이 어렵습니다.
        </p>
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

function AttendeeCard({ attendee }: { attendee: Attendee }) {
  return (
    <article className="attendee-card">
      <div className="attendee-top">
        <strong>{attendee.name}</strong>
        <span className={attendee.role === "required" ? "role required" : "role optional"}>
          {attendee.role === "required" ? "필수" : "선택"}
        </span>
      </div>
      <ConditionLine label="불가능" values={labelSlots(attendee.unavailable)} tone="blocked" />
      <ConditionLine label="피하고 싶음" values={labelSlots(attendee.avoid)} tone="avoid" />
    </article>
  );
}

function ConditionLine({
  label,
  values,
  tone
}: {
  label: string;
  values: string[];
  tone: "blocked" | "avoid";
}) {
  return (
    <div className="condition-line">
      <span className={`condition-label ${tone}`}>{label}</span>
      <span>{values.join(", ")}</span>
    </div>
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

function labelSlots(ids: string[]) {
  return ids.map((id) => slots.find((slot) => slot.id === id)?.label ?? id);
}
