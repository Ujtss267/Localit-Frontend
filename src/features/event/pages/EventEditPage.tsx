// src/features/event/pages/EventEditPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEventById, useUpdateEvent } from "../queries";
import { EventForm } from "../components/EventForm";

export default function EventEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const eventId = Number(id);
  const { data, isLoading } = useEventById(eventId);
  const updateMut = useUpdateEvent(eventId);

  if (isLoading || !data) {
    return <div>로딩중…</div>;
  }

  return (
    <EventForm
      mode="edit"
      initialValues={{
        title: data.title,
        desc: data.description,
        location: data.location,
        startLocal: data.startTime,
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
      isSubmitting={updateMut.isPending}
    />
  );
}
