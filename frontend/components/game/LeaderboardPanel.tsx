"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { api } from "@/lib/api";

type Row = {
  position: number;
  userId: number;
  fullName: string;
  email: string;
  xp: number;
  rank: string;
  completedLessons: number;
};

// Sample standings shown until enough real players are on the board.
const MOCK: Row[] = [
  { position: 1, userId: -1, fullName: "Alex Rivera", email: "", xp: 1620, rank: "Automation Explorer", completedLessons: 28 },
  { position: 2, userId: -2, fullName: "Priya Nair", email: "", xp: 1395, rank: "Test Analyst", completedLessons: 24 },
  { position: 3, userId: -3, fullName: "Marco Bianchi", email: "", xp: 1180, rank: "Test Analyst", completedLessons: 21 },
  { position: 4, userId: -4, fullName: "Sara Kim", email: "", xp: 940, rank: "Bug Hunter", completedLessons: 17 },
  { position: 5, userId: -5, fullName: "Tom Becker", email: "", xp: 760, rank: "Bug Hunter", completedLessons: 13 },
  { position: 6, userId: -6, fullName: "Lena Park", email: "", xp: 540, rank: "QA Rookie", completedLessons: 9 },
  { position: 7, userId: -7, fullName: "Diego Cruz", email: "", xp: 360, rank: "QA Rookie", completedLessons: 6 },
  { position: 8, userId: -8, fullName: "Mia Wong", email: "", xp: 180, rank: "QA Rookie", completedLessons: 3 }
];

const MEDAL = ["bg-amber/20 text-amber-700", "bg-slate-200 text-slate-600", "bg-coral/15 text-coral"];

function displayName(row: Row) {
  return row.fullName || row.email.split("@")[0] || "Anonymous";
}

export function LeaderboardPanel({ limit = 8 }: { limit?: number }) {
  const [rows, setRows] = useState<Row[]>(MOCK);
  const [isMock, setIsMock] = useState(true);

  useEffect(() => {
    api
      .leaderboard()
      .then((data) => {
        if (data.length >= 3) {
          setRows(data as Row[]);
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
        {isMock ? <span className="text-xs text-slate-400">Sample standings</span> : null}
      </div>
      <div className="mt-4 space-y-2">
        {top.map((row, i) => (
          <div key={row.userId} className="grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-md bg-slate-50 p-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${MEDAL[i] ?? "bg-white text-ink"}`}>
              {i + 1}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{displayName(row)}</p>
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
