// src/features/event/pages/EventEditPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEventById, useUpdateEvent } from "../queries";
import { EventForm } from "../components/EventForm";
import { sampleData } from "@/mocks/sampleData"; // ✅ 샘플데이터
import { useMemo } from "react";

export default function EventEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const eventId = Number(id);
  const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE === "true";

  // ─────────────────────────────
  // 1) 샘플 모드일 때: sampleEvents에서 찾아오기
  // ─────────────────────────────
  const sampleEvent = useMemo(() => (USE_SAMPLE ? sampleData.events.find((e) => e.id === eventId) : null), [USE_SAMPLE, eventId]);

  // ─────────────────────────────
  // 2) 실제 API 모드일 때: 기존 훅 사용
  // ─────────────────────────────
  const { data, isLoading } = useEventById(eventId);
  const updateMut = useUpdateEvent(eventId);

  // 표시할 데이터 소스 선택
  const eventData = USE_SAMPLE ? sampleEvent : data;

  if ((USE_SAMPLE && !sampleEvent) || (!USE_SAMPLE && (isLoading || !data))) {
    return <div>로딩중…</div>;
  }

  return (
    <EventForm
      mode="edit"
      initialValues={{
        title: eventData!.title,
        desc: eventData!.description,
        location: eventData!.location,
        // 샘플 데이터는 ISO 그대로 들어있으니까 그대로 넣어도 되고,
        // 필요하면 여기서 local datetime 으로 변환해도 됨
        startLocal: eventData!.startTime,
        endLocal: eventData!.endTime,
        capacity: eventData!.capacity ?? "",
        genderControl: {
          maleLimit: eventData!.genderControl?.maleLimit ?? false,
          femaleLimit: eventData!.genderControl?.femaleLimit ?? false,
          balanceRequired: eventData!.genderControl?.balanceRequired ?? false,
        },
      }}
      onSubmit={(values) => {
        if (USE_SAMPLE) {
          // ✅ 샘플 모드: axios 안 타고 그냥 확인용
          console.log("[sample] update event", {
            id: eventId,
            ...values,
          });
          // 샘플이니까 그냥 상세로 보내버리기
          navigate(`/events/${eventId}`, { replace: true });
          return;
        }

        // ✅ 실제 모드: 기존처럼 업데이트 호출
        updateMut.mutate(
          {
            title: values.title,
            description: values.desc,
            location: values.location,
            startTime: values.startLocal,
            endTime: values.endLocal,
            capacity: Number(values.capacity),
            genderControl: values.genderControl,
          },
          {
            onSuccess: () => {
              navigate(`/events/${eventId}`, { replace: true });
            },
          }
        );
      }}
      isSubmitting={!USE_SAMPLE && updateMut.isPending}
    />
  );
}
