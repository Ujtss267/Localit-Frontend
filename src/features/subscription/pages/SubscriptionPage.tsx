import React from "react";
import {
  Alert,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  BillingCycle,
  PaymentMethod,
  cancelMySubscription,
  confirmSubscriptionPayment,
  createSubscriptionCheckout,
  getMySubscription,
  getSubscriptionPlans,
} from "@/features/subscription/api";

type Feature = { label: string; included: boolean };

type UiPlan = {
  id: number;
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  desc: string;
  highlight?: boolean;
  features: Feature[];
};

const paymentOptions: Array<{ value: PaymentMethod; label: string }> = [
  { value: "KAKAOPAY", label: "카카오페이" },
  { value: "TOSSPAY", label: "토스페이" },
  { value: "TOSSBANK", label: "토스뱅크" },
  { value: "NAVERPAY", label: "네이버페이" },
];

const EVENT_PLAN_FEATURES: Feature[] = [
  { label: "이벤트 생성/운영", included: true },
  { label: "참가자 목록 확인", included: true },
  { label: "QR 체크인", included: true },
  { label: "시리즈형 이벤트", included: true },
  { label: "결제/정산 연동", included: true },
];

function fmtPrice(v: string | number) {
  const n = typeof v === "string" ? Number(v) : v;
  if (!Number.isFinite(n)) return String(v);
  return new Intl.NumberFormat("ko-KR").format(n);
}

export default function SubscriptionPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const qc = useQueryClient();
  const [sp, setSp] = useSearchParams();

  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("MONTHLY");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("KAKAOPAY");

  const { data: plans = [], isLoading: plansLoading, error: plansError } = useQuery({
    queryKey: ["subscription", "plans"],
    queryFn: getSubscriptionPlans,
  });

  const { data: mySub, error: mySubError } = useQuery({
    queryKey: ["subscription", "me"],
    queryFn: getMySubscription,
  });

  const checkoutMut = useMutation({
    mutationFn: createSubscriptionCheckout,
  });

  const confirmMut = useMutation({
    mutationFn: ({ paymentId, pgTid }: { paymentId: number; pgTid?: string }) => confirmSubscriptionPayment(paymentId, pgTid),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["subscription", "me"] });
      const next = new URLSearchParams(sp);
      next.delete("status");
      next.delete("paymentId");
      next.delete("pgTid");
      setSp(next, { replace: true });
    },
  });

  const cancelMut = useMutation({
    mutationFn: cancelMySubscription,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["subscription", "me"] });
    },
  });

  React.useEffect(() => {
    const status = sp.get("status");
    const paymentId = Number(sp.get("paymentId"));
    const pgTid = sp.get("pgTid") ?? undefined;

    if (status !== "success") return;
    if (!Number.isFinite(paymentId) || paymentId <= 0) return;
    if (confirmMut.isPending || confirmMut.isSuccess) return;

    confirmMut.mutate({ paymentId, pgTid });
  }, [sp, confirmMut]);

  const handleBillingChange = (_: React.MouseEvent<HTMLElement>, value: BillingCycle | null) => {
    if (!value) return;
    setBillingCycle(value);
  };

  const handleSelect = async (planId: number) => {
    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/subscription?status=success`;
    const cancelUrl = `${baseUrl}/subscription?status=cancel`;

    const res = await checkoutMut.mutateAsync({
      planId,
      billingCycle,
      paymentMethod,
      successUrl,
      cancelUrl,
      merchantUid: `sub-${planId}-${Date.now()}`,
    });

    window.location.href = res.checkoutUrl;
  };

  const monthlyPlan = plans.find((p) => p.billingCycle === "MONTHLY");
  const yearlyPlan = plans.find((p) => p.billingCycle === "YEARLY");

  const uiPlans: UiPlan[] =
    monthlyPlan || yearlyPlan
      ? [
          {
            id: (billingCycle === "MONTHLY" ? monthlyPlan?.planId : yearlyPlan?.planId) ?? monthlyPlan?.planId ?? yearlyPlan!.planId,
            name: "이벤트-호스트 PRO",
            monthlyPrice: monthlyPlan ? `₩${fmtPrice(monthlyPlan.price)} / 월` : "미지원",
            yearlyPrice: yearlyPlan ? `₩${fmtPrice(yearlyPlan.price)} / 년` : "미지원",
            desc: "유료 구독으로 이벤트 운영/QR 출석 기능을 사용할 수 있습니다.",
            highlight: true,
            features: EVENT_PLAN_FEATURES,
          },
        ]
      : [];

  const activePlanName = mySub?.active?.plan?.name;
  const activePlanExpires = mySub?.active?.expiresAt;

  return (
    <Box className="w-full min-h-screen" sx={{ py: 3 }}>
      <Box className="mx-auto max-w-5xl px-4">
        <Typography variant="overline" color="primary">
          Localit Subscription
        </Typography>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700} gutterBottom>
          월/연 구독 결제를 시작하세요
        </Typography>
        <Typography variant="body1" color="text.secondary" className="mb-4">
          카카오페이, 토스페이(토스뱅크), 네이버페이로 결제를 시작할 수 있습니다.
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
          <ToggleButtonGroup size="small" value={billingCycle} exclusive onChange={handleBillingChange}>
            <ToggleButton value="MONTHLY">월간 구독</ToggleButton>
            <ToggleButton value="YEARLY">연간 구독</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            size="small"
            value={paymentMethod}
            exclusive
            onChange={(_, v) => v && setPaymentMethod(v)}
          >
            {paymentOptions.map((o) => (
              <ToggleButton key={o.value} value={o.value}>
                {o.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        {mySub?.active && (
          <Alert sx={{ mt: 2 }} severity="success" action={<Button color="inherit" size="small" onClick={() => cancelMut.mutate()} disabled={cancelMut.isPending}>구독 해지</Button>}>
            현재 활성 구독: {activePlanName ?? "호스트 플랜"}
            {activePlanExpires ? ` (만료: ${new Date(activePlanExpires).toLocaleString("ko-KR")})` : ""}
          </Alert>
        )}
        {!mySub?.active && mySub?.access && (
          <Alert sx={{ mt: 2 }} severity="info">
            현재 무료 권한: 월 {mySub.access.freeEventCreateMonthlyLimit}회 중 {mySub.access.freeEventCreateUsedThisMonth}회 사용
            (남은 횟수 {mySub.access.freeEventCreateRemainingThisMonth}회)
          </Alert>
        )}

        {sp.get("status") === "cancel" && <Alert sx={{ mt: 2 }} severity="warning">결제가 취소되었습니다.</Alert>}
        {confirmMut.isPending && <Alert sx={{ mt: 2 }} severity="info">결제 확정 처리 중입니다...</Alert>}
        {confirmMut.isSuccess && <Alert sx={{ mt: 2 }} severity="success">구독 결제가 완료되었습니다.</Alert>}
        {(checkoutMut.error || confirmMut.error || plansError || mySubError || cancelMut.error) && (
          <Alert sx={{ mt: 2 }} severity="error">
            {((checkoutMut.error as any)?.response?.data?.message as string) ||
              ((confirmMut.error as any)?.response?.data?.message as string) ||
              ((plansError as any)?.response?.data?.message as string) ||
              ((mySubError as any)?.response?.data?.message as string) ||
              ((cancelMut.error as any)?.response?.data?.message as string) ||
              "구독 처리 중 오류가 발생했습니다."}
          </Alert>
        )}
      </Box>

      <Box className="mx-auto max-w-5xl px-4 mt-6 mb-10">
        <Typography variant="h6" fontWeight={700}>
          이벤트 운영자용
        </Typography>
        <Typography variant="body2" color="text.secondary">
          월 구독/연 구독 중 하나를 선택하고 결제 수단을 고르면 결제가 시작됩니다.
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(1, minmax(0, 1fr))" },
            gap: 2.5,
          }}
          className="mt-4"
        >
          {plansLoading && <Alert severity="info">구독 플랜을 불러오는 중입니다...</Alert>}
          {!plansLoading && uiPlans.length === 0 && (
            <Alert severity="warning">활성 구독 플랜이 없습니다. 관리자에서 `SubscriptionPlan` 데이터를 먼저 등록해 주세요.</Alert>
          )}

          {uiPlans.map((plan) => {
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
                    label={billingCycle === "MONTHLY" ? "월 구독" : "연 구독"}
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
                    disabled={checkoutMut.isPending}
                    sx={{ mt: "auto", borderRadius: 2 }}
                  >
                    {checkoutMut.isPending ? "결제 준비 중..." : `${paymentOptions.find((o) => o.value === paymentMethod)?.label}로 결제`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
