type Props = React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean };
export default function Card({ className = "", ...rest }: Props) {
  return <div className={`rounded-2xl border bg-white shadow-sm ${className}`} {...rest} />;
}
