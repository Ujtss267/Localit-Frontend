type Props = { title: string; right?: React.ReactNode; className?: string };
export default function PageHeader({ title, right, className = "" }: Props) {
  return (
    <header className={`flex items-center justify-between ${className}`}>
      <h1 className="text-lg font-semibold">{title}</h1>
      {right}
    </header>
  );
}
