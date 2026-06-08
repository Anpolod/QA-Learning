type ProgressCardProps = {
  label: string;
  value: string;
  progress: number;
};

export function ProgressCard({ label, value, progress }: ProgressCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{label}</p>
        <strong className="text-lg">{value}</strong>
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-mint" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}

