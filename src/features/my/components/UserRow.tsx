// src/features/my/components/UserRow.tsx
import React from "react";
import { UserBriefDto } from "../types";

interface UserRowProps {
  user: UserBriefDto;
  onToggleFollow: (userId: number) => void;
}

export function UserRow({ user, onToggleFollow }: UserRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
          {user.avatarUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img src={user.avatarUrl} alt={user.displayName} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div>
          <div className="text-sm font-medium">{user.displayName}</div>
          <div className="text-xs opacity-70">{user.isFollowingMe ? "나를 팔로우함" : "아직 나를 팔로우하지 않음"}</div>
        </div>
      </div>
      <button
        onClick={() => onToggleFollow(user.userId)}
        className={"rounded-full border px-3 py-1 text-sm " + (user.iFollow ? "bg-black text-white" : "hover:bg-gray-50")}
      >
        {user.iFollow ? "언팔로우" : "팔로우"}
      </button>
    </div>
  );
}
