import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

type Props = {
  onChange: (p: { categoryId?: number; startTime?: string; endTime?: string; location?: string }) => void;
};

export default function EventFilter({ onChange }: Props) {
  const [sp, setSp] = useSearchParams();
  const [categoryId, setCategoryId] = useState<string>(sp.get("categoryId") ?? "");
  const [location, setLocation] = useState<string>(sp.get("location") ?? "");
  const [startTime, setStartTime] = useState<string>(sp.get("startTime") ?? "");
  const [endTime, setEndTime] = useState<string>(sp.get("endTime") ?? "");

  const params = useMemo(() => {
    const p: any = {};
    if (categoryId) p.categoryId = Number(categoryId);
    if (location) p.location = location;
    if (startTime) p.startTime = startTime;
    if (endTime) p.endTime = endTime;
    return p;
  }, [categoryId, location, startTime, endTime]);

  useEffect(() => {
    onChange(params);
    const next = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => next.set(k, String(v)));
    setSp(next, { replace: true });
  }, [params, onChange, setSp]);

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <input
        className="border rounded px-3 py-2"
        placeholder="카테고리 ID (숫자)"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      />
      <input className="border rounded px-3 py-2" placeholder="지역" value={location} onChange={(e) => setLocation(e.target.value)} />
      <input type="datetime-local" className="border rounded px-3 py-2" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      <input type="datetime-local" className="border rounded px-3 py-2" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
    </div>
  );
}
