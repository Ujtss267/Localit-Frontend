import { useParams } from "react-router-dom";

export default function MentoringDetailPage() {
  const { id } = useParams();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">멘토링 상세</h1>
      <p className="text-neutral-600">멘토링 ID: {id} (임시 더미)</p>
    </div>
  );
}
