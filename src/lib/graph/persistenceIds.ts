/**
 * Scope graph entity IDs by graph record ID to avoid global PK collisions
 * across projects while keeping API-level IDs stable.
 */
export function scopeGraphEntityId(graphRecordId: string, id: string): string {
  const prefix = `${graphRecordId}:`;
  return id.startsWith(prefix) ? id : `${prefix}${id}`;
}

export function unscopeGraphEntityId(
  graphRecordId: string,
  id: string
): string {
  const prefix = `${graphRecordId}:`;
  return id.startsWith(prefix) ? id.slice(prefix.length) : id;
}
