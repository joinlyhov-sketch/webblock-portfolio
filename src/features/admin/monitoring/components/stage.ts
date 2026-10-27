import type { PipelineStage, StepStatus } from "../types";

/** Which stage a step (1–7) belongs to. */
export function stageOfStep(step: number): PipelineStage {
  if (step === 1) return "REQUEST";
  if (step <= 3) return "GENERATION";
  if (step <= 6) return "RELEASE";
  return "LIVE";
}

export const STAGE_LABEL = {
  REQUEST: "Request",
  GENERATION: "Generation",
  RELEASE: "Release",
  LIVE: "Live",
} satisfies Record<PipelineStage, string>;

/** Dot / border colour of a step by status (tokens only). */
export const STEP_TONE = {
  DONE: {
    dot: "bg-success border-success",
    border: "border-border",
    chip: "bg-success-soft text-success",
  },
  RUNNING: {
    dot: "bg-primary border-primary",
    border: "border-primary ring-2 ring-primary/15",
    chip: "bg-info-soft text-info",
  },
  FAILED: {
    dot: "bg-danger border-danger",
    border: "border-danger ring-2 ring-danger/10",
    chip: "bg-danger-soft text-danger",
  },
  STUCK: {
    dot: "bg-warning border-warning",
    border: "border-warning ring-2 ring-warning/10",
    chip: "bg-warning-soft text-warning",
  },
  WAITING: {
    dot: "bg-background border-warning",
    border: "border-warning",
    chip: "bg-warning-soft text-warning",
  },
  NOT_STARTED: {
    dot: "bg-background border-border",
    border: "border-dashed border-border",
    chip: "bg-neutral-soft text-muted-foreground",
  },
} satisfies Record<StepStatus, { dot: string; border: string; chip: string }>;
