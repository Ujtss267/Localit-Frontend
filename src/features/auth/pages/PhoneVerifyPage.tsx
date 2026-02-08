// src/features/auth/pages/PhoneVerifyPage.tsx
import { useState, useMemo, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";

export default function PhoneVerifyPage() {
  const nav = useNavigate();

  // ✅ 변경: 주민번호 앞자리는 6자리(YYMMDD)로 받습니다.
  const [name, setName] = useState("");
  const [birth6, setBirth6] = useState(""); // YYMMDD (6자리)
  const [rrnBackFirst, setRrnBackFirst] = useState(""); // 주민번호 뒤 첫 자리(1~4 등)
  const [carrier, setCarrier] = useState<"" | "SKT" | "KT" | "LGU" | "MVNO">("");
  const [phone, setPhone] = useState("");

  const onlyNums = (v: string) => v.replace(/\D+/g, "");
  const fmtPhone = (v: string) => {
    const n = onlyNums(v).slice(0, 11);
    if (n.length < 4) return n;
    if (n.length < 8) return `${n.slice(0, 3)}-${n.slice(3)}`;
    return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`;
  };

  const isValid = useMemo(() => {
    const birthOk = /^\d{6}$/.test(birth6); // ✅ 6자리 검증
    const backOk = /^\d$/.test(rrnBackFirst); // 1자리 검증
    const phoneOk = onlyNums(phone).length >= 10;
    return name.trim().length > 1 && birthOk && backOk && !!carrier && phoneOk;
  }, [name, birth6, rrnBackFirst, carrier, phone]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    // TODO: 백엔드 본인인증 시작 API 호출
    alert("본인인증 요청(데모)");
  }

  return (
    <div className="mx-auto w-full max-w-sm px-5 py-6">
      <h1 className="text-2xl font-semibold">휴대폰 본인인증</h1>
      <p className="mt-1 text-sm text-gray-500">회원여부 확인 및 가입을 진행합니다.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {/* 이름 */}
        <FieldShell>
          <Label>이름</Label>
          <div className="relative">
            <input
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-green-500"
              placeholder="이름 입력"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {name && <Clear onClick={() => setName("")} />}
          </div>
        </FieldShell>

        {/* ✅ 주민등록번호 입력 UI (앞 6자리 + '-' + 뒷 1자리 입력 + 나머지 6자리 마스킹) */}
        <FieldShell>
          <Label>주민등록번호 앞 7자리</Label>
          <div className="flex items-center gap-2">
            {/* 앞 6자리 (YYMMDD) */}
            <div className="relative flex-1">
              <input
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-green-500"
                placeholder="생년월일 (YYMMDD)"
                inputMode="numeric"
                maxLength={6}
                value={birth6}
                onChange={(e) => setBirth6(e.target.value.replace(/\D+/g, ""))}
              />
              {birth6 && <Clear onClick={() => setBirth6("")} />}
            </div>

            {/* 하이픈 */}
            <span className="select-none text-lg text-gray-500">-</span>

            {/* 뒷 첫 자리 입력 */}
            <div className="relative w-16">
              <input
                className="w-full rounded-2xl border px-3 py-3 text-center text-sm outline-none focus:border-green-500"
                placeholder="0"
                inputMode="numeric"
                maxLength={1}
                value={rrnBackFirst}
                onChange={(e) => setRrnBackFirst(e.target.value.replace(/\D+/g, "").slice(0, 1))}
              />
              {rrnBackFirst && <Clear onClick={() => setRrnBackFirst("")} />}
            </div>

            {/* 나머지 6자리는 시각적으로 점(•) 마스킹 */}
            <MaskedDots count={6} />
          </div>
        </FieldShell>

        {/* 휴대폰번호 */}
        <FieldShell>
          <Label>휴대폰번호</Label>
          <div className="flex gap-2">
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value as any)}
              className="w-28 rounded-2xl border bg-gray-50 px-3 py-3 text-sm outline-none focus:border-green-500"
            >
              <option value="" disabled>
                통신사
              </option>
              <option value="SKT">SKT</option>
              <option value="KT">KT</option>
              <option value="LGU">LG U+</option>
              <option value="MVNO">알뜰폰</option>
            </select>

            <div className="relative flex-1">
              <input
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-green-500"
                placeholder="휴대폰번호 입력"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(fmtPhone(e.target.value))}
              />
              {phone && <Clear onClick={() => setPhone("")} />}
            </div>
          </div>
        </FieldShell>

        {/* 하단 액션 */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button type="button" className="py-3" onClick={() => nav(-1)}>
            취소
          </Button>
          <Button type="submit" variant="primary" className="py-3 bg-green-600 text-white disabled:opacity-50" disabled={!isValid}>
            다음
          </Button>
        </div>
      </form>

      <div className="h-6" />
    </div>
  );
}

/* ——— 작은 서브 컴포넌트들 ——— */
function FieldShell({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-gray-500">{children}</p>;
}
function Clear({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="clear"
      className="absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-full bg-gray-100 text-gray-500"
    >
      <svg width="14" height="14" viewBox="0 0 24 24">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

/** 나머지 6자리를 시각적으로 점(•)으로 표시 */
function MaskedDots({ count }: { count: number }) {
  return (
    <div className="ml-1 inline-flex h-[46px] items-center rounded-2xl bg-gray-50 px-3 text-lg text-gray-400 select-none" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="px-[2px]">
          •
        </span>
      ))}
    </div>
  );
}
