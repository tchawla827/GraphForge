"use client";

interface Stats {
  userCount: number;
  projectCount: number;
  shareCount: number;
  runCount: number;
}

export function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Users", value: stats.userCount },
    { label: "Active projects", value: stats.projectCount },
    { label: "Active shares", value: stats.shareCount },
    { label: "Algorithm runs", value: stats.runCount },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value }) => (
        <div key={label} className="rounded-lg border border-zinc-800 bg-zinc-900 px-5 py-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-zinc-100 mt-1">{value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
