// src/features/event/pages/EventEditPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEventById, useUpdateEvent } from "../queries";
import { EventForm } from "../components/EventForm";

export default function EventEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEventById(Number(id));
  const updateMut = useUpdateEvent(Number(id));

  if (isLoading || !data) return <div>로딩중…</div>;

  // 권한 체크(내가 만든 이벤트인지)도 여기서 해주면 안전
  // if (data.createdByUserId !== me.userId) return <div>권한 없음</div>;

  return (
    <EventForm
      mode="edit"
      initialValues={{
        title: data.title,
        desc: data.description,
        location: data.location,
        startLocal: data.startTime, // 필요하면 local 변환
        endLocal: data.endTime,
        capacity: data.capacity ?? "",
        genderControl: {
          maleLimit: data.genderControl?.maleLimit ?? false,
          femaleLimit: data.genderControl?.femaleLimit ?? false,
          balanceRequired: data.genderControl?.balanceRequired ?? false,
        },
      }}
      onSubmit={(values) => {
        updateMut.mutate(
          {
            // id: Number(id), // Removed as it does not exist in type 'Partial<CreateEventDto>'
            title: values.title,
            description: values.desc,
            location: values.location,
            startTime: values.startLocal,
            endTime: values.endLocal,
            capacity: Number(values.capacity),
          },
          {
            onSuccess: () => {
              navigate(`/event/${id}`, { replace: true });
            },
          }
        );
      }}
      isSubmitting={updateMut.isPending}
    />
  );
}
