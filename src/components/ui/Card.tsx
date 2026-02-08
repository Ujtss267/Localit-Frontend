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
      sx={{
        borderRadius: 3,
        boxShadow: 2,
        border: "1px solid",
        borderColor: "rgba(63, 63, 70, 0.9)",
        backgroundColor: "rgba(23, 23, 23, 0.92)",
        color: "rgb(245, 245, 245)",
      }}
      {...rest}
    >
      {header && <CardHeader title={header.title} subheader={header.subheader} />}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
