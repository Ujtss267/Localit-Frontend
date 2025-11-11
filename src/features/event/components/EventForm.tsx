// src/features/event/components/EventForm.tsx
import React from "react";
import {
  Container,
  Card,
  CardContent,
  CardActions,
  TextField,
  Stack,
  Typography,
  Button as MUIButton,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

type GenderControl = {
  maleLimit: boolean;
  femaleLimit: boolean;
  balanceRequired: boolean;
};

export type EventFormValues = {
  title: string;
  desc: string;
  location: string;
  startLocal: string;
  endLocal: string;
  capacity: number | "";
  genderControl: GenderControl;
};

export function EventForm({
  mode,
  initialValues,
  onSubmit,
  isSubmitting,
}: {
  mode: "create" | "edit";
  initialValues: EventFormValues;
  onSubmit: (values: EventFormValues) => void;
  isSubmitting?: boolean;
}) {
  const [title, setTitle] = React.useState(initialValues.title);
  const [desc, setDesc] = React.useState(initialValues.desc);
  const [location, setLocation] = React.useState(initialValues.location);
  const [startLocal, setStartLocal] = React.useState(initialValues.startLocal);
  const [endLocal, setEndLocal] = React.useState(initialValues.endLocal);
  const [capacity, setCapacity] = React.useState<number | "">(initialValues.capacity);
  const [genderControl, setGenderControl] = React.useState<GenderControl>(initialValues.genderControl);

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setGenderControl((prev) => ({ ...prev, [name]: checked }));
  };

  const valid =
    title.trim().length >= 2 &&
    desc.trim().length >= 5 &&
    location.trim().length >= 2 &&
    !!startLocal &&
    !!endLocal &&
    typeof capacity === "number" &&
    capacity > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      title,
      desc,
      location,
      startLocal,
      endLocal,
      capacity,
      genderControl,
    });
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <form onSubmit={submit}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {mode === "create" ? "이벤트 만들기" : "이벤트 수정"}
            </Typography>
            <Stack spacing={2}>
              <TextField label="제목" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
              <TextField label="설명" value={desc} onChange={(e) => setDesc(e.target.value)} multiline minRows={3} required fullWidth />
              <TextField label="위치" value={location} onChange={(e) => setLocation(e.target.value)} required fullWidth />
              <TextField
                label="시작"
                type="datetime-local"
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                label="종료"
                type="datetime-local"
                value={endLocal}
                onChange={(e) => setEndLocal(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />

              <Stack direction="row" spacing={2} alignItems="center">
                <FormGroup row>
                  <FormControlLabel
                    control={<Checkbox name="maleLimit" checked={genderControl.maleLimit} onChange={handleGenderChange} />}
                    label="남자 제한"
                  />
                  <FormControlLabel
                    control={<Checkbox name="femaleLimit" checked={genderControl.femaleLimit} onChange={handleGenderChange} />}
                    label="여자 제한"
                  />
                  <FormControlLabel
                    control={<Checkbox name="balanceRequired" checked={genderControl.balanceRequired} onChange={handleGenderChange} />}
                    label="성비 균형"
                  />
                </FormGroup>

                <TextField
                  label="정원"
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                  sx={{ width: 120 }}
                />
              </Stack>
            </Stack>
          </CardContent>
          <CardActions sx={{ p: 2 }}>
            <MUIButton
              type="submit"
              variant="contained"
              disabled={!valid || isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : undefined}
            >
              {mode === "create" ? "등록" : "수정"}
            </MUIButton>
          </CardActions>
        </Card>
      </form>
    </Container>
  );
}
