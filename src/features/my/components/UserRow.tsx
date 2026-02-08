// src/features/my/components/UserRow.tsx
import React from "react";
import { UserBriefDto } from "../types";

interface UserRowProps {
  user: UserBriefDto;
  onToggleFollow: (userId: number) => void;
}

export function UserRow({ user, onToggleFollow }: UserRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-neutral-100">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800">
          {user.avatarUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img src={user.avatarUrl} alt={user.displayName} className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div>
          <div className="text-sm font-medium text-neutral-100">{user.displayName}</div>
          <div className="text-xs text-neutral-300/70">{user.isFollowingMe ? "나를 팔로우함" : "아직 나를 팔로우하지 않음"}</div>
        </div>
      </div>
      <button
        onClick={() => onToggleFollow(user.userId)}
        className={"min-h-11 rounded-full border border-neutral-700 px-3 py-2 text-sm " + (user.iFollow ? "bg-neutral-700 text-neutral-100" : "hover:bg-neutral-800")}
      >
        {user.iFollow ? "언팔로우" : "팔로우"}
      </button>
    </div>
  );
}
