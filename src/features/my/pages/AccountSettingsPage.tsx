import { useAuth } from "@/app/providers/AuthProvider";
import { mobileText } from "@/components/ui/mobileTypography";
import { useNavigate } from "react-router-dom";

export default function AccountSettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
  };

  return (
    <div className="mx-auto max-w-3xl text-neutral-100">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">계정 설정</h1>
        <p className={`${mobileText.meta} text-neutral-400`}>인증 이메일, 프로필, 보안 관련 설정을 관리합니다.</p>
      </div>

      <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4">
        <section id="profile-photo" className="rounded-2xl border border-neutral-700 bg-neutral-900/90 p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm sm:text-base font-semibold">프로필 사진</div>
              <p className={`${mobileText.meta} mt-1 text-neutral-400`}>아바타 이미지를 변경합니다.</p>
            </div>
            <button
              type="button"
              onClick={() => alert("프로필 사진 업로드 기능은 준비 중입니다.")}
              className="h-10 sm:h-11 rounded-xl border border-neutral-700 px-3 sm:px-4 text-xs sm:text-sm hover:bg-neutral-800"
            >
              사진 변경
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-700 bg-neutral-900/90 p-3 sm:p-4">
          <div className="text-sm sm:text-base font-semibold">인증 이메일</div>
          <p className={`${mobileText.meta} mt-1 text-neutral-400`}>현재 로그인 계정의 인증 이메일입니다.</p>
          <div className="mt-3 rounded-xl border border-neutral-700 bg-neutral-950/70 px-3 py-2.5 text-sm text-neutral-200">
            {user?.email ?? "-"}
          </div>
          <div className="mt-2 text-xs text-neutral-500">이메일 변경/재인증 기능은 추후 추가 예정입니다.</div>
        </section>

        <section className="rounded-2xl border border-neutral-700 bg-neutral-900/90 p-3 sm:p-4">
          <div className="text-sm sm:text-base font-semibold">계정</div>
          <p className={`${mobileText.meta} mt-1 text-neutral-400`}>로그인 상태를 종료하거나 마이페이지로 돌아갈 수 있습니다.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate("/my")}
              className="h-10 sm:h-11 rounded-xl border border-neutral-700 px-3 sm:px-4 text-xs sm:text-sm hover:bg-neutral-800"
            >
              마이페이지로 이동
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="h-10 sm:h-11 rounded-xl border border-rose-600/60 px-3 sm:px-4 text-xs sm:text-sm text-rose-300 hover:bg-rose-900/20"
            >
              로그아웃
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
