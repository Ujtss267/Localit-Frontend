type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md";
  variant?: "solid" | "outline";
};
export default function Button({ size = "md", variant = "outline", className = "", ...rest }: Props) {
  const sizeCls = size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-2";
  const variantCls = variant === "solid" ? "bg-gray-900 text-white" : "border bg-white";
  return <button className={`rounded-xl shadow-sm active:scale-[0.98] disabled:opacity-50 ${sizeCls} ${variantCls} ${className}`} {...rest} />;
}
