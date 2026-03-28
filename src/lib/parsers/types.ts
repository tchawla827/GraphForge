export interface ParseError {
  line?: number;
  column?: number;
  message: string;
  context?: string;
}

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: ParseError[] };
