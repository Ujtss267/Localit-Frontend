type Props = { rows?: number; className?: string };
export default function SkeletonList({ rows = 4, className = "" }: Props) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}
