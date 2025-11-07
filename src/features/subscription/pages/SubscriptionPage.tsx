// src/features/subscription/pages/SubscriptionPage.tsx
// src/pages/SubscriptionPage.tsx
import React from "react";
import { Box, Typography, Card, CardContent, CardHeader, Button, Chip, Stack, Divider, useMediaQuery } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";

type Feature = { label: string; included: boolean };
type Plan = {
  id: string;
  name: string;
  price: string;
  desc: string;
  highlight?: boolean;
  features: Feature[];
};

const EVENT_PLANS: Plan[] = [
  {
    id: "event-basic",
    name: "이벤트-기본",
    price: "₩0 / 월",
    desc: "참여 위주 사용자",
    features: [
      { label: "공개 이벤트 참여", included: true },
      { label: "기본 프로필", included: true },
      { label: "이벤트 등록 (1건)", included: false },
      { label: "시리즈형 이벤트", included: false },
      { label: "참가자 관리", included: false },
    ],
  },
  {
    id: "event-host",
    name: "이벤트-호스트",
    price: "₩2,000 / 월",
    desc: "스터디/소모임 운영자",
    highlight: true,
    features: [
      { label: "이벤트 등록 (무제한)", included: true },
      { label: "시리즈형 이벤트", included: true },
      { label: "참가자 목록 확인", included: true },
      { label: "QR 체크인", included: true },
      { label: "정산(준비 중)", included: false },
    ],
  },
  {
    id: "event-pro",
    name: "이벤트-Pro",
    price: "₩4,900 / 월",
    desc: "유료 모임 운영자",
    features: [
      { label: "이벤트 등록 (무제한)", included: true },
      { label: "시리즈형 이벤트", included: true },
      { label: "유료 이벤트 정산 연동", included: true },
      { label: "공개 범위 제어(Follower)", included: true },
      { label: "공간 예약 연동", included: false },
    ],
  },
];

const ROOM_PLANS: Plan[] = [
  {
    id: "room-basic",
    name: "공간-소개",
    price: "₩0 / 월",
    desc: "공간 1곳만 노출",
    features: [
      { label: "공간 1개 등록", included: true },
      { label: "기본 정보 노출", included: true },
      { label: "예약 캘린더", included: false },
      { label: "중복 예약 방지", included: false },
      { label: "정기 슬롯 생성", included: false },
    ],
  },
  {
    id: "room-manager",
    name: "공간-매니저",
    price: "₩5,900 / 월",
    desc: "소규모 공간 운영자",
    highlight: true,
    features: [
      { label: "공간 5개 등록", included: true },
      { label: "예약 캘린더", included: true },
      { label: "중복 예약 방지", included: true },
      { label: "이벤트와 연동", included: true },
      { label: "입장용 QR", included: true },
    ],
  },
  {
    id: "room-org",
    name: "공간-기관형",
    price: "₩12,000 / 월",
    desc: "교육센터/문화센터",
    features: [
      { label: "공간 무제한 등록", included: true },
      { label: "정기 타임슬롯(30분 단위)", included: true },
      { label: "직원 계정 초대", included: true },
      { label: "정산 리포트(준비 중)", included: true },
      { label: "API 연동", included: true },
    ],
  },
];

export default function SubscriptionPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSelect = (planId: string) => {
    // TODO: 여기에 결제/구독 플로우 연결
    console.log("selected plan:", planId);
  };

  const renderPlanCards = (plans: Plan[]) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
        gap: 2.5,
      }}
      className="mt-4"
    >
      {plans.map((plan) => (
        <Card
          key={plan.id}
          sx={{
            border: plan.highlight ? `2px solid ${theme.palette.primary.main}` : "1px solid #e2e8f0",
            boxShadow: plan.highlight ? 4 : 0,
            borderRadius: 3,
            position: "relative",
          }}
          className="flex flex-col"
        >
          {plan.highlight && <Chip label="추천" color="primary" size="small" sx={{ position: "absolute", top: 14, right: 14 }} />}
          <CardHeader
            title={
              <Typography variant="h6" fontWeight={700}>
                {plan.name}
              </Typography>
            }
            subheader={<Typography color="text.secondary">{plan.desc}</Typography>}
          />
          <CardContent className="flex flex-col flex-1">
            <Typography variant="h5" fontWeight={700} className="mb-4">
              {plan.price}
            </Typography>
            <Divider className="mb-4" />
            <Stack spacing={1.2} className="mb-6">
              {plan.features.map((f) => (
                <Stack key={f.label} direction="row" spacing={1} alignItems="center">
                  {f.included ? <CheckIcon fontSize="small" color="success" /> : <CloseIcon fontSize="small" color="disabled" />}
                  <Typography variant="body2" color={f.included ? "text.primary" : "text.disabled"} className={!f.included ? "line-through" : ""}>
                    {f.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Button
              variant={plan.highlight ? "contained" : "outlined"}
              fullWidth
              onClick={() => handleSelect(plan.id)}
              sx={{ mt: "auto", borderRadius: 2 }}
            >
              이 플랜 선택
            </Button>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  return (
    <Box className="w-full min-h-screen bg-slate-50" sx={{ py: 3 }}>
      {/* 공통 헤더 */}
      <Box className="mx-auto max-w-5xl px-4">
        <Typography variant="overline" color="primary">
          Localit Subscription
        </Typography>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700} gutterBottom>
          역할에 맞는 구독을 골라보세요
        </Typography>
        <Typography variant="body1" color="text.secondary" className="mb-6">
          이벤트를 운영하는 사람과 공간을 운영하는 사람은 필요한 기능이 다르니까, 요금제를 분리해서 보여줄게요.
        </Typography>
      </Box>

      {/* 섹션 1: 이벤트 운영자 */}
      <Box className="mx-auto max-w-5xl px-4 mt-6 mb-2">
        <Typography variant="h6" fontWeight={700}>
          이벤트 운영자용
        </Typography>
        <Typography variant="body2" color="text.secondary">
          스터디, 원데이 클래스, 오프라인 모임을 자주 여는 사람
        </Typography>
        {renderPlanCards(EVENT_PLANS)}
      </Box>

      {/* 섹션 2: 공간 운영자 */}
      <Box className="mx-auto max-w-5xl px-4 mt-10 mb-16">
        <Typography variant="h6" fontWeight={700}>
          공간/시설 운영자용
        </Typography>
        <Typography variant="body2" color="text.secondary">
          공간을 여러 개 등록하고 예약을 막고 싶거나, 기관처럼 운영하는 경우
        </Typography>
        {renderPlanCards(ROOM_PLANS)}
      </Box>

      {/* 하단 안내 */}
      <Box className="mx-auto max-w-5xl px-4 mb-16">
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              구독 체크 로직은 이렇게 하면 돼요
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mb-1">
              1) 사용자 테이블에 currentEventPlan, currentRoomPlan 같은 필드를 두거나
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mb-1">
              2) 별도 subscription 테이블을 두고 type = 'EVENT' | 'ROOM' 으로 나눠서 보관
            </Typography>
            <Typography variant="body2" color="text.secondary">
              API (이벤트 등록 / 공간 등록) 에서 해당 타입의 유효 구독이 있는지 확인한 후 허용하면 됩니다.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
