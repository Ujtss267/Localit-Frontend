type Props = { title?: string; description?: string; action?: React.ReactNode };
export default function EmptyState({ title = "데이터가 없습니다", description, action }: Props) {
  return (
    <div className="rounded-2xl border p-6 text-center">
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
