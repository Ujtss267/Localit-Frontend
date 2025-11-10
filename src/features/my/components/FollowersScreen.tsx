// src/features/my/components/FollowersScreen.tsx
import React from "react";
import { UserBriefDto } from "../types";
import { UserRow } from "./UserRow";

interface FollowersScreenProps {
  list: UserBriefDto[];
  onBack: () => void;
  onToggleFollow: (userId: number) => void;
}

export function FollowersScreen({ list, onBack, onToggleFollow }: FollowersScreenProps) {
  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">팔로워</h2>
        <button onClick={onBack} className="rounded-xl border px-3 py-1 text-sm hover:bg-gray-50">
          ← 돌아가기
        </button>
      </div>
      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="rounded-xl border p-6 text-center text-sm opacity-70">아직 팔로워가 없습니다.</div>
        ) : (
          list.map((u) => <UserRow key={u.userId} user={u} onToggleFollow={onToggleFollow} />)
        )}
      </div>
    </div>
  );
}
