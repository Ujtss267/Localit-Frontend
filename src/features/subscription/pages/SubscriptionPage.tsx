import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  Stack,
  Divider,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";

type Feature = { label: string; included: boolean };

type Plan = {
  id: string;
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  desc: string;
  highlight?: boolean;
  features: Feature[];
};

type BillingCycle = "MONTHLY" | "YEARLY";

const EVENT_PLANS: Plan[] = [
  {
    id: "event-free",
    name: "이벤트-무료",
    monthlyPrice: "₩0 / 월",
    yearlyPrice: "₩0 / 년",
    desc: "참여 위주 사용자 또는 가끔 모임 여는 사람",
    features: [
      { label: "공개 이벤트 참여", included: true },
      { label: "기본 프로필", included: true },
      { label: "내 이벤트 등록 (동시 1건)", included: true },
      { label: "참가자 목록 확인", included: false },
      { label: "QR 체크인", included: false },
    ],
  },
  {
    id: "event-host-pro",
    name: "이벤트-호스트 PRO",
    monthlyPrice: "₩4,900 / 월",
    yearlyPrice: "₩49,000 / 년", // 예시: 약 2개월 할인
    desc: "스터디/소모임/원데이 클래스를 자주 운영하는 호스트",
    highlight: true,
    features: [
      { label: "이벤트 동시 운영 (무제한 권장, 정책에 따라 제한 가능)", included: true },
      { label: "참가자 목록 확인", included: true },
      { label: "QR 체크인", included: true },
      { label: "시리즈형 이벤트 (준비 중)", included: true },
      { label: "유료 이벤트 정산 연동 (추후 제공)", included: true },
    ],
  },
];

export default function SubscriptionPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("MONTHLY");

  const handleBillingChange = (_: React.MouseEvent<HTMLElement>, value: BillingCycle | null) => {
    if (!value) return;
    setBillingCycle(value);
  };

  const handleSelect = (planId: string) => {
    // TODO: 결제/구독 플로우 연결
    // - planId: "event-free" | "event-host-pro"
    // - billingCycle: "MONTHLY" | "YEARLY"
    console.log("selected plan:", planId, "cycle:", billingCycle);
  };

  const renderPlanCards = (plans: Plan[]) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
        gap: 2.5,
      }}
      className="mt-4"
    >
      {plans.map((plan) => {
        const priceText = billingCycle === "MONTHLY" ? plan.monthlyPrice : plan.yearlyPrice;

        return (
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
            {plan.highlight && (
              <Chip
                label={billingCycle === "MONTHLY" ? "가장 많이 선택하는 플랜" : "연간 할인 추천"}
                color="primary"
                size="small"
                sx={{ position: "absolute", top: 14, right: 14 }}
              />
            )}
            <CardHeader
              title={
                <Typography variant="h6" fontWeight={700}>
                  {plan.name}
                </Typography>
              }
              subheader={<Typography color="text.secondary">{plan.desc}</Typography>}
            />
            <CardContent className="flex flex-col flex-1">
              <Typography variant="h5" fontWeight={700} className="mb-1">
                {priceText}
              </Typography>
              {billingCycle === "YEARLY" && plan.id === "event-host-pro" && (
                <Typography variant="caption" color="text.secondary" className="mb-3">
                  월 구독 대비 약 2개월치 할인 (예시 금액)
                </Typography>
              )}
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
        );
      })}
    </Box>
  );

  return (
    <Box className="w-full min-h-screen" sx={{ py: 3 }}>
      {/* 공통 헤더 */}
      <Box className="mx-auto max-w-5xl px-4">
        <Typography variant="overline" color="primary">
          Localit Subscription
        </Typography>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700} gutterBottom>
          이벤트 운영을 위한 구독을 선택하세요
        </Typography>
        <Typography variant="body1" color="text.secondary" className="mb-4">
          참여만 하는 사용자부터 자주 모임을 여는 호스트까지, 역할에 맞는 요금제를 선택할 수 있어요. 월간으로 시작해보고, 자주 쓰게 되면 연간으로
          전환해도 좋아요.
        </Typography>

        {/* 월간 / 연간 토글 */}
        <ToggleButtonGroup size="small" value={billingCycle} exclusive onChange={handleBillingChange} sx={{ mt: 1 }}>
          <ToggleButton value="MONTHLY">월간 구독</ToggleButton>
          <ToggleButton value="YEARLY">연간(연구독)</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 섹션 1: 이벤트 운영자 */}
      <Box className="mx-auto max-w-5xl px-4 mt-6 mb-10">
        <Typography variant="h6" fontWeight={700}>
          이벤트 운영자용
        </Typography>
        <Typography variant="body2" color="text.secondary">
          스터디, 원데이 클래스, 오프라인 모임을 자주 여는 호스트라면 PRO 플랜이 더 편합니다.
        </Typography>
        {renderPlanCards(EVENT_PLANS)}
      </Box>

      {/* 하단 안내: 1회 이벤트 패스 안내 */}
      <Box className="mx-auto max-w-5xl px-4 mb-16">
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              “이번에 딱 한 번만 모임을 열어보고 싶다면?”
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mb-1">
              정기 구독이 부담된다면, 추후 제공될 <b>1회 이벤트 호스트 패스</b>(예: 이벤트 1건당 소액 결제)를 통해 가볍게 테스트해볼 수 있어요.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              자주 모임을 여는 시점부터는 <b>이벤트-호스트 PRO</b> 월간/연간 구독으로 전환하는 흐름을 추천합니다.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
