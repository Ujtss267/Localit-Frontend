import { Link } from "react-router-dom";
import type { EventDTO } from "../api";

export default function EventCard({ e }: { e: EventDTO }) {
  return (
    <div className="border rounded-xl p-4 hover:shadow-sm transition">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{e.title}</h3>
        <span className="text-xs text-neutral-500">{new Date(e.startTime).toLocaleString()}</span>
      </div>
      <p className="text-sm text-neutral-700 mt-2 line-clamp-2">{e.description}</p>
      <div className="mt-3 text-sm text-neutral-600">📍 {e.location}</div>
      <div className="mt-4">
        <Link to={`/events/${e.id}`} className="px-3 py-1 bg-blue-600 text-white rounded">
          상세보기
        </Link>
      </div>
    </div>
  );
}
