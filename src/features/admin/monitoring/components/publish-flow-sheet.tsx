import { Fragment, type ComponentType } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Box,
  Danger,
  DirectInbox,
  ExportSquare,
  Global,
  Hierarchy,
  Lock,
  MagicStar,
  Send2,
  Status,
  TickCircle,
} from "iconsax-reactjs";
import { Modal } from "@/components/common/modal";
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
} from "../types";
import { STEP_TONE } from "./stage";

const STEP_ICON: Record<number, ComponentType<{ className?: string }>> = {
  1: DirectInbox,
  2: MagicStar,
  3: Hierarchy,
  4: Box,
  5: Lock,
  6: Send2,
  7: Status,
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
      title={`${run.websiteName} publish flow`}
      hideTitle
      side="right"
      closeHref={closeHref}
    >
      <header className="border-b border-border px-7 pt-6 pb-4 pr-20">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-2xl font-semibold tracking-[-0.3px] text-foreground">
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
          href={`https://${run.domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
        >
          <Global aria-hidden className="size-4" />
          {run.domain}
          <ExportSquare aria-hidden className="size-3.5" />
        </a>
      </header>

      <div className="space-y-5 px-6 py-5">
        <section aria-labelledby="publish-flow-title">
          <h3
            id="publish-flow-title"
            className="mb-3 text-base font-semibold text-foreground"
          >
            Publish flow
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
    <div className="rounded-[22px] border border-border bg-primary-soft/40 bg-[radial-gradient(var(--color-placeholder)_1px,transparent_1.2px)] bg-size-[14px_14px] px-4 pt-3 pb-3">
      {/* Always-visible thin scrollbar (Figma shows the track under the steps). */}
      <div className="overflow-x-auto pt-3 pb-3 [scrollbar-color:var(--color-placeholder)_var(--color-border)] [scrollbar-width:thin]">
        <ol className="flex w-max items-stretch pr-1">
          {GROUPS.map((group, g) => {
            const groupSteps = group.steps
              .map((n) => steps[n - 1])
              .filter(Boolean);
            return (
              <Fragment key={group.label}>
                {g > 0 && <Connector from={steps[group.steps[0] - 2]} />}
                <li className="relative rounded-2xl border border-border bg-background/70 p-3.5 pt-6">
                  <span className="absolute -top-3 left-3 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-semibold text-foreground">
                    {group.label}{" "}
                    <span className="font-normal text-muted-foreground">
                      {group.range}
                    </span>
                  </span>
                  <ol className="flex items-center">
                    {groupSteps.map((step, i) => (
                      <Fragment key={step.number}>
                        {i > 0 && <Connector from={groupSteps[i - 1]} />}
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
      </div>
      <p
        aria-hidden
        className="mt-1 flex items-center justify-end gap-1 text-xs text-muted-foreground"
      >
        Scroll <ArrowRight className="size-3.5" />
      </p>
    </div>
  );
}

function Connector({ from }: { from: PipelineStep | undefined }) {
  const done = from?.status === "DONE";
  return (
    <span aria-hidden className="flex w-8 shrink-0 items-center self-center">
      <span
        className={cn(
          "size-2 shrink-0 rounded-full border-2 bg-background",
          done ? "border-success" : "border-border",
        )}
      />
      <span
        className={cn(
          "h-0 flex-1 border-t-2",
          done ? "border-success" : "border-dashed border-border",
        )}
      />
      <span
        className={cn(
          "size-2 shrink-0 rounded-full border-2 bg-background",
          done ? "border-success" : "border-border",
        )}
      />
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
        "flex h-[140px] w-[136px] flex-col rounded-2xl border bg-background p-3",
        tone.border,
        notStarted && "bg-surface/80",
      )}
    >
      <div className="flex items-start justify-between">
        <span
          aria-hidden
          className={cn(
            "grid size-8 place-items-center rounded-lg [&_svg]:size-4",
            tone.chip,
          )}
        >
          <Icon />
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {String(step.number).padStart(2, "0")}
        </span>
      </div>
      <p
        className={cn(
          "mt-2.5 text-[13px] font-semibold",
          notStarted ? "text-foreground-soft" : "text-foreground",
        )}
      >
        {step.title}
      </p>
      <p
        className="truncate text-xs text-muted-foreground"
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

  return (
    <section
      aria-labelledby="current-step-title"
      className="space-y-4 rounded-[22px] border border-border p-5"
    >
      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Step {run.currentStep} · {current.phase}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h3
            id="current-step-title"
            className="text-2xl font-semibold text-foreground"
          >
            {current.title}
          </h3>
          <StatusBadge status={live ? "LIVE" : current.status} />
          {current.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex h-6 items-center rounded-full bg-neutral-soft px-2.5 text-xs font-medium text-foreground-soft"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {facts.length > 0 && (
        <dl className="grid gap-2.5 [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))]">
          {facts.map((f) => (
            <div key={f.label} className="rounded-xl bg-muted px-3.5 py-3">
              <dt className="text-xs text-muted-foreground">{f.label}</dt>
              <dd
                className={cn(
                  "mt-1",
                  live ? "font-heading text-xl font-semibold" : "text-[15px]",
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
                <dd className="mt-0.5 text-xs text-muted-foreground">
                  {f.hint}
                </dd>
              )}
            </div>
          ))}
        </dl>
      )}

      {current.checkGroup && <StepChecks group={current.checkGroup} />}

      {live && logs && (
        <LiveLogs run={run} logs={logs} searchParams={searchParams} />
      )}
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
          <p className="text-[13px] text-muted-foreground">
            What {run.domain} is logging as visitors use it · newest first
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <nav
            aria-label="Filter logs by level"
            className="inline-flex rounded-full border border-border bg-surface p-1"
          >
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={tableHref(searchParams, {
                  log: tab.value === "ALL" ? null : tab.value,
                })}
                scroll={false}
                aria-current={active === tab.value ? "true" : undefined}
                className={cn(
                  "rounded-full px-3 py-1 text-[13px] transition-colors",
                  active === tab.value
                    ? "bg-background font-semibold text-foreground shadow-button"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}{" "}
                <span className="font-normal text-placeholder tabular-nums">
                  {tab.count.toLocaleString("en-US")}
                </span>
              </Link>
            ))}
          </nav>
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-success-soft px-3 text-[13px] font-semibold text-success">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-success motion-safe:animate-pulse"
            />
            Streaming
          </span>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13px]">
          <thead className="bg-muted text-left text-[11px] font-semibold tracking-wide text-placeholder uppercase">
            <tr>
              <th className="px-4 py-2.5">Time</th>
              <th className="px-4 py-2.5">Level</th>
              <th className="px-4 py-2.5">Request</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No{" "}
                  {active === "ALL"
                    ? ""
                    : `${LEVEL_LABEL[active as LogLevel].toLowerCase()} `}
                  lines in the last 15 minutes.
                </td>
              </tr>
            )}
            {logs.items.map((line) => (
              <tr
                key={line.id}
                className={cn(
                  line.level === "WARN" && "bg-warning-soft/40",
                  line.level === "ERROR" && "bg-danger-soft/40",
                )}
              >
                <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                  {formatLogTime(line.at)}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 font-mono text-xs",
                      LEVEL_STYLE[line.level],
                    )}
                  >
                    {line.level.toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-foreground">
                  {line.method} &nbsp;{line.path}
                  {line.note && (
                    <span
                      className={cn(
                        "ml-3",
                        line.level === "ERROR" ? "text-danger" : "text-warning",
                      )}
                    >
                      {line.note}
                    </span>
                  )}
                </td>
                <td
                  className={cn(
                    "px-4 py-2.5 tabular-nums",
                    line.statusCode >= 500
                      ? "text-danger"
                      : line.statusCode >= 400
                        ? "text-warning"
                        : "text-success",
                  )}
                >
                  {line.statusCode}
                </td>
                <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                  {line.durationMs} ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-border bg-surface px-4 py-2.5 text-xs text-muted-foreground">
        Showing the latest {logs.items.length} lines · updates every 2 seconds ·
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
      <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {group.title}
      </h4>
      <ul className="grid gap-2.5 sm:grid-cols-2">
        {group.checks.map((check, i) => (
          <li
            key={check.title}
            className="flex items-center gap-3.5 rounded-xl bg-muted px-4 py-3"
          >
            {check.status === "PASSED" ? (
              <TickCircle
                variant="Bold"
                aria-label="Passed"
                className="size-6 shrink-0 text-success"
              />
            ) : check.status === "FAILED" ? (
              <Danger
                variant="Bold"
                aria-label="Failed"
                className="size-6 shrink-0 text-danger"
              />
            ) : (
              <span
                aria-label={`Waiting, step ${i + 1}`}
                className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-semibold text-primary-foreground"
              >
                {i + 1}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                {check.title}
              </span>
              <span className="block truncate text-[13px] text-muted-foreground">
                {check.detail}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
