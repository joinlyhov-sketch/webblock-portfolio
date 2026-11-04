import { Fragment, type ComponentType } from "react";
import {
  Activity,
  Box,
  Calendar,
  Clock,
  Danger,
  DirectInbox,
  ExportSquare,
  Global,
  Hierarchy,
  Lock,
  MagicStar,
  Refresh,
  Send2,
  Status,
  Timer1,
  TickCircle,
} from "iconsax-reactjs";
import { CompactTable } from "@/components/common/compact-table";
import { Modal } from "@/components/common/modal";
import { ScrollStrip } from "@/components/common/scroll-strip";
import { SegmentedTabs } from "@/components/common/segmented-tabs";
import { StatusBadge } from "@/components/common/status-badge";
import type { Page } from "@/lib/api/types";
import { formatLogTime, formatRelative, formatTime } from "@/lib/format";
import { tableHref, type SearchParams } from "@/lib/table-query";
import { cn } from "@/lib/utils";
import type {
  LogLevel,
  LogLine,
  PipelineRun,
  PipelineStep,
  StepCheck,
  StepFact,
  StepStatus,
} from "../types";
import { STEP_TONE } from "./stage";

const STEP_ICON: Record<number, ComponentType<{ className?: string; variant?: "Outline" }>> = {
  1: DirectInbox,
  2: MagicStar,
  3: Hierarchy,
  4: Box,
  5: Lock,
  6: Send2,
  7: Status,
};

type IconType = ComponentType<{ className?: string; variant?: "Outline" }>;

const FACT_TONE = {
  brand: "bg-brand-soft text-brand",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  violet: "bg-violet-soft text-violet",
};

/** Icon and colour beside each fact card, by what it means: time = blue, health = green, errors = red,
 *  deadlines = amber, releases = violet. Anything not listed gets a blue clock. */
const FACT_ICON: Record<string, { icon: IconType; tone: keyof typeof FACT_TONE }> = {
  Started: { icon: Calendar, tone: "brand" },
  "Live since": { icon: Calendar, tone: "brand" },
  "Last heartbeat": { icon: Activity, tone: "success" },
  Deadline: { icon: Clock, tone: "warning" },
  Next: { icon: Refresh, tone: "brand" },
  Release: { icon: Box, tone: "violet" },
  Requests: { icon: Activity, tone: "brand" },
  Errors: { icon: Danger, tone: "danger" },
  "Avg response": { icon: Timer1, tone: "warning" },
};

const GROUPS = [
  { label: "Request", range: "Step 1", steps: [1] },
  { label: "Generation", range: "Steps 2 to 3", steps: [2, 3] },
  { label: "Release", range: "Steps 4 to 6", steps: [4, 5, 6] },
  { label: "Live", range: "Step 7", steps: [7] },
];

const LEVEL_STYLE = {
  INFO: "bg-info-soft text-info",
  WARN: "bg-warning-soft text-warning",
  ERROR: "bg-danger-soft text-danger",
} satisfies Record<LogLevel, string>;

const LEVEL_LABEL = {
  INFO: "Info",
  WARN: "Warning",
  ERROR: "Error",
} satisfies Record<LogLevel, string>;

/**
 * "Publish flow" side panel for one website (opened with `?run=<websiteId>`): the 7 steps grouped by
 * stage, the current step's details, and — once live — traffic numbers and live logs.
 */
export function PublishFlowSheet({
  run,
  logs,
  searchParams,
}: {
  run: PipelineRun;
  logs: Page<LogLine> | null;
  searchParams: SearchParams;
}) {
  const closeHref = tableHref(searchParams, { run: null, log: null });

  return (
    <Modal
      title={`${run.websiteName} deploy flow`}
      hideTitle
      side="right"
      closeHref={closeHref}
    >
      <header className="border-b border-border px-7 pt-6 pb-4 pr-20">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2
            title={run.websiteName}
            className="line-clamp-2 min-w-0 text-2xl font-semibold tracking-[-0.3px] break-words text-foreground"
          >
            {run.websiteName}
          </h2>
          <StatusBadge
            status={
              run.releaseState === "NONE_YET"
                ? run.requestStatus
                : run.releaseState
            }
          />
        </div>
        <a
          href={`/sites/${run.websiteId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex max-w-full items-center gap-1.5 text-sm text-brand hover:underline"
        >
          <Global variant="Outline" aria-hidden className="size-4 shrink-0" />
          <span className="truncate">{run.domain}</span>
          <ExportSquare variant="Outline" aria-hidden className="size-3.5 shrink-0" />
        </a>
      </header>

      <div className="space-y-5 px-6 py-5">
        <section aria-labelledby="publish-flow-title">
          <h3
            id="publish-flow-title"
            className="mb-3 text-base font-semibold text-foreground"
          >
            Deploy flow
          </h3>
          <FlowStrip steps={run.steps} />
        </section>

        <CurrentStepPanel run={run} logs={logs} searchParams={searchParams} />
      </div>
    </Modal>
  );
}

/** The dotted canvas with the step cards, grouped by stage; scrolls sideways on small screens. */
function FlowStrip({ steps }: { steps: PipelineStep[] }) {
  return (
    <div className="rounded-[22px] border border-border bg-primary-soft/50 bg-[radial-gradient(var(--color-canvas-dot)_1.2px,transparent_1.4px)] bg-size-[16px_16px] px-5 pt-1 pb-4">
      {/* Own thin scrollbar, on one row with "Scroll →" (Figma shows the track under the steps). */}
      <ScrollStrip label="Deploy steps" className="pt-5 pb-3">
        <ol className="flex w-max items-stretch pr-1">
          {GROUPS.map((group, g) => {
            const groupSteps = group.steps
              .map((n) => steps[n - 1])
              .filter(Boolean);
            return (
              <Fragment key={group.label}>
                {g > 0 && (
                  <Connector
                    between="groups"
                    from={steps[group.steps[0] - 2]}
                    to={steps[group.steps[0] - 1]}
                  />
                )}
                <li className="relative rounded-[20px] border border-border bg-background px-4 pt-7 pb-4">
                  <span className="absolute -top-3.5 left-4 rounded-full border border-border bg-background px-3 py-1 text-sm leading-4 font-semibold text-foreground">
                    {group.label}{" "}
                    <span className="font-normal text-muted-foreground">
                      {group.range}
                    </span>
                  </span>
                  <ol className="flex items-center">
                    {groupSteps.map((step, i) => (
                      <Fragment key={step.number}>
                        {i > 0 && (
                          <Connector from={groupSteps[i - 1]} to={step} />
                        )}
                        <li>
                          <StepCard step={step} />
                        </li>
                      </Fragment>
                    ))}
                  </ol>
                </li>
              </Fragment>
            );
          })}
        </ol>
      </ScrollStrip>
    </div>
  );
}

/** End-dot colour of a connector: the colour of the card it is pinned to. */
const JOINT = {
  DONE: "border-success",
  RUNNING: "border-primary",
  FAILED: "border-danger",
  STUCK: "border-warning",
  WAITING: "border-warning",
  NOT_STARTED: "border-placeholder/50",
} satisfies Record<StepStatus, string>;

/**
 * Line between two step cards. Its hollow end dots are centred on the cards' border lines (negative
 * margins pull them over the gap, and over the group padding and borders when `between="groups"`). Solid green
 * once the step before is done (green → blue into a running step), otherwise a dotted grey line.
 */
function Connector({
  from,
  to,
  between = "steps",
}: {
  from: PipelineStep | undefined;
  to: PipelineStep | undefined;
  between?: "steps" | "groups";
}) {
  const done = from?.status === "DONE";
  const intoRunning = done && to?.status === "RUNNING";
  const joint = "size-2.5 shrink-0 rounded-full border-2 bg-background";
  return (
    <span
      aria-hidden
      className={cn(
        "relative z-10 flex shrink-0 items-center self-center",
        between === "groups"
          ? // 10px gap between the groups; each dot is centred on the card's border line, which is
            // 17px (16px padding + 1px group border) inside the group, so 17.5 − 0.5 + 5px half dot = 22.5px
            // to pull in on each side. The card sits 6px below the group's middle.
            "-mx-[22.5px] w-[55px] translate-y-1.5"
          : // 40px gap between cards; each dot is centred on the card's 1px border (5px half dot + 0.5px).
            "-mx-[5.5px] w-[51px]",
      )}
    >
      <span className={cn(joint, from ? JOINT[from.status] : JOINT.NOT_STARTED)} />
      <span
        className={cn(
          "flex-1",
          done
            ? cn("h-0.5", intoRunning ? "bg-linear-to-r from-success to-primary" : "bg-success")
            : "h-[3px] bg-[radial-gradient(circle,var(--color-placeholder)_1.1px,transparent_1.5px)] bg-size-[6px_3px] bg-repeat-x opacity-50",
        )}
      />
      <span className={cn(joint, to ? JOINT[to.status] : JOINT.NOT_STARTED)} />
    </span>
  );
}

function StepCard({ step }: { step: PipelineStep }) {
  const tone = STEP_TONE[step.status];
  const Icon = STEP_ICON[step.number] ?? Status;
  const notStarted = step.status === "NOT_STARTED";
  return (
    <div
      className={cn(
        "flex size-[148px] flex-col rounded-[18px] border bg-background p-3.5",
        tone.border,
      )}
    >
      <div className="flex items-start justify-between">
        <span
          aria-hidden
          className={cn(
            "grid size-9 place-items-center rounded-xl [&_svg]:size-[18px]",
            tone.chip,
            step.status === "RUNNING" && "motion-safe:animate-pulse",
          )}
        >
          <Icon variant="Outline" />
        </span>
        <span className="pt-0.5 text-[13px] font-medium text-muted-foreground tabular-nums">
          {String(step.number).padStart(2, "0")}
        </span>
      </div>
      <p
        className={cn(
          "mt-3 truncate text-sm leading-5 font-semibold",
          notStarted ? "text-foreground-soft" : "text-foreground",
        )}
      >
        {step.title}
      </p>
      <p
        className="truncate text-[13px] leading-5 text-muted-foreground"
        title={step.subtitle}
      >
        {step.subtitle}
      </p>
      <div className="mt-auto">
        <StatusBadge status={step.status} />
      </div>
    </div>
  );
}

function CurrentStepPanel({
  run,
  logs,
  searchParams,
}: {
  run: PipelineRun;
  logs: Page<LogLine> | null;
  searchParams: SearchParams;
}) {
  const { current, live } = run;
  const facts: StepFact[] = live
    ? [
        {
          label: "Live since",
          value: formatTime(live.liveSince),
          hint: `${formatRelative(live.liveSince)}`,
          tone: "default",
        },
        {
          label: "Release",
          value: live.release,
          hint: live.previousRelease
            ? `previous ${live.previousRelease} kept`
            : null,
          tone: "default",
        },
        {
          label: "Requests",
          value: live.requests5m.toLocaleString("en-US"),
          hint: "last 5 min",
          tone: "default",
        },
        {
          label: "Errors",
          value: String(live.errors5m),
          hint: `last 5 min · ${live.errorRate5m}%`,
          tone: live.errors5m ? "danger" : "default",
        },
        {
          label: "Avg response",
          value: `${live.avgResponseMs} ms`,
          hint: "last 5 min",
          tone: "default",
        },
      ]
    : current.facts;

  const StepIcon = STEP_ICON[run.currentStep] ?? Status;

  return (
    <section
      aria-labelledby="current-step-title"
      className="overflow-hidden rounded-[22px] border border-border bg-background shadow-card"
    >
      {/* Header: step icon, eyebrow, title and the status / tag pills, on a flat light blue. */}
      <div className="border-b border-border px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <span
            aria-hidden
            className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand [&_svg]:size-7"
          >
            <StepIcon variant="Outline" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium tracking-wide text-muted-foreground uppercase">
              Step {run.currentStep} · {current.phase}
            </p>
            <h3
              id="current-step-title"
              className="mt-0.5 font-heading text-2xl leading-8 font-semibold text-foreground"
            >
              {current.title}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={live ? "LIVE" : current.status} />
            {current.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex h-6 items-center rounded-full bg-neutral-soft px-2.5 text-[13px] font-medium text-foreground-soft"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {facts.length > 0 && (
          <dl className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
            {facts.map((f) => {
              const meta = FACT_ICON[f.label] ?? { icon: Clock, tone: "brand" as const };
              const Icon = meta.icon;
              // A fact that is going wrong (late heartbeat, errors) turns red whatever its usual colour.
              const iconTone = f.tone === "danger" ? "danger" : meta.tone;
              return (
                <div
                  key={f.label}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-primary-soft/60 px-4 py-3.5"
                >
                  <span
                    aria-hidden
                    className={cn("grid size-9 shrink-0 place-items-center rounded-xl [&_svg]:size-5", FACT_TONE[iconTone])}
                  >
                    <Icon variant="Outline" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[13px] text-muted-foreground">{f.label}</dt>
                    <dd
                      className={cn(
                        "text-[15px] leading-6 font-medium",
                        f.tone === "danger"
                          ? "text-danger"
                          : f.tone === "info"
                            ? "text-brand"
                            : "text-foreground",
                      )}
                    >
                      {f.value}
                    </dd>
                    {f.hint && (
                      <dd className="text-[13px] text-muted-foreground">{f.hint}</dd>
                    )}
                  </div>
                </div>
              );
            })}
          </dl>
        )}

        {current.checkGroup && <StepChecks group={current.checkGroup} />}

        {live && logs && (
          <LiveLogs run={run} logs={logs} searchParams={searchParams} />
        )}
      </div>
    </section>
  );
}

function LiveLogs({
  run,
  logs,
  searchParams,
}: {
  run: PipelineRun;
  logs: Page<LogLine>;
  searchParams: SearchParams;
}) {
  const live = run.live!;
  const active =
    typeof searchParams.log === "string" ? searchParams.log : "ALL";
  const total =
    live.logCounts.INFO + live.logCounts.WARN + live.logCounts.ERROR;
  const tabs = [
    { value: "ALL", label: "All", count: total },
    ...(["INFO", "WARN", "ERROR"] as const).map((level) => ({
      value: level,
      label: LEVEL_LABEL[level],
      count: live.logCounts[level],
    })),
  ];

  return (
    <section
      aria-labelledby="live-logs-title"
      className="overflow-hidden rounded-2xl border border-border"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <h4
            id="live-logs-title"
            className="text-base font-semibold text-foreground"
          >
            Live logs
          </h4>
          <p className="text-sm text-muted-foreground">
            What {run.domain} is logging as visitors use it · newest first
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <SegmentedTabs
            label="Filter logs by level"
            size="sm"
            tabs={tabs.map((tab) => ({
              label: tab.label,
              count: tab.count,
              active: active === tab.value,
              href: tableHref(searchParams, {
                  log: tab.value === "ALL" ? null : tab.value,
              }),
            }))}
          />
        </div>
      </header>

      <div className="px-4 pt-3 pb-2">
        <CompactTable
          dense
          label="Log lines"
          rows={logs.items}
          rowKey={(line) => line.id}
          rowClassName={(line) =>
            cn(line.level === "WARN" && "bg-warning-soft/40", line.level === "ERROR" && "bg-danger-soft/40")
          }
          empty={
            <p className="py-2 text-center text-muted-foreground">
              No {active === "ALL" ? "" : `${LEVEL_LABEL[active as LogLevel].toLowerCase()} `}lines in the last 15
              minutes.
            </p>
          }
          columns={[
            {
              key: "time",
              header: "Time",
              cell: (line) => formatLogTime(line.at),
              className: "text-muted-foreground tabular-nums",
            },
            {
              key: "level",
              header: "Level",
              cell: (line) => (
                <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[13px]", LEVEL_STYLE[line.level])}>
                  {line.level.toLowerCase()}
                </span>
              ),
            },
            {
              key: "request",
              header: "Request",
              className: "text-foreground",
              cell: (line) => (
                <>
                  {line.method} &nbsp;{line.path}
                  {line.note && (
                    <span className={cn("ml-3", line.level === "ERROR" ? "text-danger" : "text-warning")}>
                      {line.note}
                    </span>
                  )}
                </>
              ),
            },
            {
              key: "status",
              header: "Status",
              cell: (line) => (
                <span
                  className={cn(
                    "tabular-nums",
                    line.statusCode >= 500 ? "text-danger" : line.statusCode >= 400 ? "text-warning" : "text-success",
                  )}
                >
                  {line.statusCode}
                </span>
              ),
            },
            {
              key: "duration",
              header: "Duration",
              align: "end",
              cell: (line) => `${line.durationMs} ms`,
              className: "text-muted-foreground tabular-nums",
            },
          ]}
        />
      </div>
      <p className="border-t border-border bg-surface px-4 py-2.5 text-[13px] text-muted-foreground">
        Showing the latest {logs.items.length} of {logs.totalItems} lines · updates every 5 seconds ·
        logs are kept for 15 minutes
      </p>
    </section>
  );
}

/** "Checks before queueing": two columns of pre-conditions; pending ones are numbered in order. */
function StepChecks({
  group,
}: {
  group: { title: string; checks: StepCheck[] };
}) {
  return (
    <div className="space-y-2.5">
      <h4 className="font-heading text-lg font-semibold text-foreground">
        {group.title}
      </h4>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {group.checks.map((check, i) => (
          <li
            key={check.title}
            className={cn(
              "flex items-center gap-3.5 rounded-xl border px-4 py-3",
              check.status === "PASSED"
                ? "border-success/20 bg-success-soft"
                : check.status === "FAILED"
                  ? "border-danger/20 bg-danger-soft"
                  : "border-brand-border/50 bg-brand-soft",
            )}
          >
            {check.status === "PASSED" ? (
              <TickCircle
                variant="Outline"
                aria-label="Passed"
                className="size-6 shrink-0 text-success"
              />
            ) : check.status === "FAILED" ? (
              <Danger
                variant="Outline"
                aria-label="Failed"
                className="size-6 shrink-0 text-danger"
              />
            ) : (
              <span
                aria-label={`Waiting, step ${i + 1}`}
                className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-[13px] font-semibold text-primary-foreground"
              >
                {i + 1}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                {check.title}
              </span>
              <span className="block truncate text-sm text-muted-foreground">
                {check.detail}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
