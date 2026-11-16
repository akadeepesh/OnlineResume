import { MAX_ORIGINAL_FILE_BYTES, type Plan } from "@/lib/db/schema";

// ============================================================================
// What each plan allows. Kept in code, not in database constraints, so limits
// can change without a migration. Server actions check these before writing.
// ============================================================================

export interface PlanLimits {
  /** Resumes a user can keep. */
  resumes: number;
  /** AI-assisted imports per day. */
  aiImportsPerDay: number;
  /** Largest original file (PDF/DOCX) we store. */
  maxFileBytes: number;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: { resumes: 5, aiImportsPerDay: 5, maxFileBytes: MAX_ORIGINAL_FILE_BYTES },
};

/** Limits for a plan. Unknown plans (e.g. a removed one) get the free limits. */
export function limitsFor(plan: string | null | undefined): PlanLimits {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.free;
}
