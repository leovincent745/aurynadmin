"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, LogOut, MessageCircle } from "lucide-react";

import { useAuth } from "@/lib/auth-context";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, email, logout } = useAuth();

  const displayEmail = email || "Admin";
  const displayInitial = displayEmail.charAt(0).toUpperCase();
  const userChatUrl = process.env.NEXT_PUBLIC_USER_CHAT_URL;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border-l pl-3 transition-opacity hover:opacity-75 sm:gap-3 sm:pl-4"
      >
        <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-sm font-semibold">
          {displayInitial}
        </div>
        <div className="hidden sm:block">
          <p className="max-w-[120px] truncate text-sm font-semibold text-slate-950">
            {displayEmail}
          </p>
          <p className="text-xs capitalize text-slate-500">
            {user?.role?.replace("_", " ") ?? "Admin"}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-950">{displayEmail}</p>
            <p className="text-xs capitalize text-slate-500">
              {user?.role?.replace("_", " ") ?? "Admin"}
            </p>
          </div>
          {userChatUrl ? (
            <Link
              href={userChatUrl}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setIsOpen(false)}
            >
              <MessageCircle className="h-4 w-4" />
              Back to chat
            </Link>
          ) : null}
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
