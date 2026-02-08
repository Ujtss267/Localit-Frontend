type Props = { rows?: number; className?: string };
export default function SkeletonList({ rows = 4, className = "" }: Props) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 rounded-2xl bg-neutral-800/80 animate-pulse" />
      ))}
    </div>
  );
}
