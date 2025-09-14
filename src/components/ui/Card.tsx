import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
  header?: {
    title?: string;
    subheader?: string;
  };
};

export default function CustomCard({ className = "", children, header, ...rest }: Props) {
  return (
    <Card
      className={className}
      sx={{ borderRadius: 3, boxShadow: 2 }}
      {...rest}
    >
      {header && <CardHeader title={header.title} subheader={header.subheader} />}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
