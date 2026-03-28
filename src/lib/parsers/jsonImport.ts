import { CanonicalGraphSchema } from "@/lib/graph/validate";
import type { CanonicalGraph } from "@/types/graph";
import type { ParseError, ParseResult } from "./types";

const MAX_INPUT_BYTES = 1024 * 1024;

/**
 * Validate a JSON string against the CanonicalGraph Zod schema.
 *
 * Returns the validated graph on success, or a list of ParseErrors on failure.
 */
export function parseJsonImport(input: string): ParseResult<CanonicalGraph> {
  if (new TextEncoder().encode(input).length > MAX_INPUT_BYTES) {
    return { ok: false, errors: [{ message: "Input exceeds maximum size of 1 MB" }] };
  }

  let json: unknown;
  try {
    json = JSON.parse(input);
  } catch (e) {
    return {
      ok: false,
      errors: [{ message: `Invalid JSON: ${(e as Error).message}` }],
    };
  }

  // Check schemaVersion before running full validation so the error is specific.
  if (typeof json !== "object" || json === null) {
    return { ok: false, errors: [{ message: "Expected a JSON object" }] };
  }

  const version = (json as Record<string, unknown>)["schemaVersion"];
  if (version === undefined) {
    return { ok: false, errors: [{ message: "Missing required field: schemaVersion" }] };
  }
  if (version !== 1) {
    return {
      ok: false,
      errors: [{ message: `Unsupported schema version: ${String(version)}` }],
    };
  }

  const result = CanonicalGraphSchema.safeParse(json);
  if (!result.success) {
    const errors: ParseError[] = result.error.issues.map((issue) => ({
      message: issue.message,
      context: issue.path.length > 0 ? issue.path.join(".") : undefined,
    }));
    return { ok: false, errors };
  }

  return { ok: true, data: result.data };
}
