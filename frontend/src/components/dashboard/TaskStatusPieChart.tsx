interface TaskStatusPieChartProps {
  todo: number;
  inProgress: number;
  done: number;
}

const COLORS = {
  todo: "#EF4444",
  progress: "#F97316",
  done: "#22C55E",
};

export function TaskStatusPieChart({ todo, inProgress, done }: TaskStatusPieChartProps) {
  const total = todo + inProgress + done || 1;
  const segments = [
    { label: "To Do", value: todo, color: COLORS.todo, pct: Math.round((todo / total) * 100) },
    {
      label: "In Progress",
      value: inProgress,
      color: COLORS.progress,
      pct: Math.round((inProgress / total) * 100),
    },
    { label: "Done", value: done, color: COLORS.done, pct: Math.round((done / total) * 100) },
  ];

  let cumulative = 0;
  const gradientStops = segments
    .map((s) => {
      const start = cumulative;
      cumulative += (s.value / total) * 100;
      return `${s.color} ${start}% ${cumulative}%`;
    })
    .join(", ");

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-base font-bold text-slate-900">Trạng thái Task</h2>

      <section className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
        <section
          className="relative h-44 w-44 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${gradientStops})` }}
        >
          <section className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white">
            <span className="text-2xl font-bold text-slate-900">{total}</span>
            <span className="text-xs text-slate-400">Tasks</span>
          </section>
        </section>

        <section className="space-y-3">
          {segments.map((s) => (
            <section key={s.label} className="flex items-center gap-3 text-sm">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="w-24 text-slate-600">{s.label}</span>
              <span className="font-semibold text-slate-900">{s.pct}%</span>
            </section>
          ))}
        </section>
      </section>
    </article>
  );
}
