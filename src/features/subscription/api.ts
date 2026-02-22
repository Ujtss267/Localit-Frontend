import { api } from "@/lib/axios";

export type BillingCycle = "MONTHLY" | "YEARLY";
export type PaymentMethod = "KAKAOPAY" | "TOSSPAY" | "TOSSBANK" | "NAVERPAY";

export type SubscriptionPlanDto = {
  planId: number;
  product: "EVENT_HOST" | "ROOM_HOST" | "ALL_IN_ONE";
  name: string;
  description?: string | null;
  price: string | number;
  billingCycle: BillingCycle;
  isActive: boolean;
};

export type MySubscriptionDto = {
  active: {
    userSubscriptionId: number;
    status: string;
    expiresAt?: string | null;
    plan?: {
      planId: number;
      name: string;
      billingCycle: BillingCycle;
      price: string | number;
    } | null;
  } | null;
  pending: Array<{
    userSubscriptionId: number;
    status: string;
    plan?: {
      planId: number;
      name: string;
      billingCycle: BillingCycle;
      price: string | number;
    } | null;
  }>;
  access?: {
    role: "USER" | "HOST" | "ADMIN" | "SUPERADMIN";
    effectiveRole: "USER" | "HOST" | "ADMIN" | "SUPERADMIN";
    canCreateEvent: boolean;
    canUseQrCheckin: boolean;
    canUsePaidHostFeatures: boolean;
    freeEventCreateMonthlyLimit: number;
    freeEventCreateUsedThisMonth: number;
    freeEventCreateRemainingThisMonth: number;
  };
};

export type CreateCheckoutPayload = {
  planId: number;
  billingCycle: BillingCycle;
  paymentMethod: PaymentMethod;
  successUrl?: string;
  cancelUrl?: string;
  merchantUid?: string;
};

export type CreateCheckoutResponse = {
  paymentId: number;
  userSubscriptionId: number;
  pgProvider: string;
  checkoutUrl: string;
  amount: number;
  message: string;
};

export const getSubscriptionPlans = () =>
  api.get<SubscriptionPlanDto[]>("/subscription/plans").then((r) => r.data);

export const getMySubscription = () =>
  api.get<MySubscriptionDto>("/subscription/me").then((r) => r.data);

export const createSubscriptionCheckout = (payload: CreateCheckoutPayload) =>
  api.post<CreateCheckoutResponse>("/subscription/checkout", payload).then((r) => r.data);

export const confirmSubscriptionPayment = (paymentId: number, pgTid?: string) =>
  api.post("/subscription/confirm", { paymentId, pgTid }).then((r) => r.data);

export const cancelMySubscription = () =>
  api.post("/subscription/cancel").then((r) => r.data);
