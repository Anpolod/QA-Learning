"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { api, type LeaderboardRow } from "@/lib/api";

// Sample standings shown until enough real players are on the board.
const MOCK: LeaderboardRow[] = [
  { position: 1, userId: -1, displayName: "Alex Rivera", xp: 1620, rank: "Automation Explorer", level: 7, achievementsUnlocked: 6, completedLessons: 28 },
  { position: 2, userId: -2, displayName: "Priya Nair", xp: 1395, rank: "Test Analyst", level: 6, achievementsUnlocked: 5, completedLessons: 24 },
  { position: 3, userId: -3, displayName: "Marco Bianchi", xp: 1180, rank: "Test Analyst", level: 5, achievementsUnlocked: 4, completedLessons: 21 },
  { position: 4, userId: -4, displayName: "Sara Kim", xp: 940, rank: "Bug Hunter", level: 4, achievementsUnlocked: 4, completedLessons: 17 },
  { position: 5, userId: -5, displayName: "Tom Becker", xp: 760, rank: "Bug Hunter", level: 4, achievementsUnlocked: 3, completedLessons: 13 },
  { position: 6, userId: -6, displayName: "Lena Park", xp: 540, rank: "QA Rookie", level: 3, achievementsUnlocked: 2, completedLessons: 9 },
  { position: 7, userId: -7, displayName: "Diego Cruz", xp: 360, rank: "QA Rookie", level: 2, achievementsUnlocked: 2, completedLessons: 6 },
  { position: 8, userId: -8, displayName: "Mia Wong", xp: 180, rank: "QA Rookie", level: 1, achievementsUnlocked: 1, completedLessons: 3 }
];

const MEDAL: Record<number, string> = {
  1: "bg-amber/20 text-amber-700",
  2: "bg-slate-200 text-slate-600",
  3: "bg-coral/15 text-coral"
};

export function LeaderboardPanel({ limit = 8 }: { limit?: number }) {
  const [rows, setRows] = useState<LeaderboardRow[]>(MOCK);
  const [isMock, setIsMock] = useState(true);

  useEffect(() => {
    api
      .leaderboard()
      .then((data) => {
        if (data.length >= 3) {
          setRows(data);
          setIsMock(false);
        }
      })
      .catch(() => {});
  }, []);

  const top = rows.slice(0, limit);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber" />
          <h2 className="text-lg font-semibold text-ink">Leaderboard</h2>
        </div>
        {isMock ? (
          <span className="text-xs text-slate-400">Sample standings</span>
        ) : rows.length > limit ? (
          <span className="text-xs text-slate-400">Top {limit} of {rows.length}</span>
        ) : null}
      </div>
      <div className="mt-4 space-y-2">
        {top.map((row) => (
          <div key={row.userId} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-md bg-slate-50 p-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${MEDAL[row.position] ?? "bg-white text-ink"}`}>
              {row.position}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{row.displayName || "Anonymous"}</p>
              <p className="text-xs text-slate-500">
                {row.rank} · {row.completedLessons} lessons
              </p>
            </div>
            <p className="font-bold text-mint">{row.xp.toLocaleString()} XP</p>
          </div>
        ))}
      </div>
    </article>
  );
}
