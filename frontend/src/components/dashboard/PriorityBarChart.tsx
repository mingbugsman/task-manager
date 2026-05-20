interface PriorityBarChartProps {
  low: number;
  medium: number;
  high: number;
}

export function PriorityBarChart({ low, medium, high }: PriorityBarChartProps) {
  const data = [
    { label: "Low", value: low },
    { label: "Medium", value: medium },
    { label: "High", value: high },
  ];
  const max = Math.max(low, medium, high, 1);

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-base font-bold text-slate-900">Phân bổ độ ưu tiên</h2>

      <section className="flex h-48 items-end justify-around gap-6 px-4">
        {data.map((item) => {
          const height = `${Math.max(8, (item.value / max) * 100)}%`;
          return (
            <section key={item.label} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-sm font-bold text-slate-800">{item.value}</span>
              <section
                className="w-full max-w-[72px] rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all"
                style={{ height }}
              />
              <span className="text-xs font-medium text-slate-500">{item.label}</span>
            </section>
          );
        })}
      </section>
    </article>
  );
}
