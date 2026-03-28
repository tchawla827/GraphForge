export function ReadOnlyBadge() {
  return (
    <div
      className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
      data-testid="read-only-badge"
    >
      <span className="bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1 text-xs text-zinc-400 font-medium">
        Read-only
      </span>
    </div>
  );
}
