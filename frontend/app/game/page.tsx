import Link from "next/link";
import { Award, CheckCircle2, Crown, Flame, Medal, Rocket, ShieldCheck, Sparkles, Star, Trophy, Users } from "lucide-react";
import { api } from "@/lib/api";

const iconMap = {
  sparkles: Sparkles,
  check: CheckCircle2,
  map: Rocket,
  target: Star,
  clipboard: ShieldCheck,
  code: Rocket,
  brain: Sparkles,
  rocket: Rocket,
  crown: Crown,
  trophy: Trophy
};

export default async function GamePage() {
  const player = await api.playerStats().catch(() => null);
  const leaderboard = await api.leaderboard().catch(() => []);

  if (!player) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-bold">Game profile is not ready</h1>
          <p className="mt-2 text-sm text-slate-600">Open the backend and refresh this page to load player stats.</p>
        </section>
      </main>
    );
  }

  const nextRankProgress =
    player.nextRankXp && player.xpToNextRank !== null
      ? Math.min(((player.xp - (player.ranks.findLast((rank) => rank.reached)?.threshold ?? 0)) / (player.nextRankXp - (player.ranks.findLast((rank) => rank.reached)?.threshold ?? 0))) * 100, 100)
      : 100;
  const unlocked = player.achievements.filter((achievement) => achievement.unlocked);
  const locked = player.achievements.filter((achievement) => !achievement.unlocked);
  const quests = [
    {
      title: "Complete next lesson",
      description: "Finish one lesson to earn XP and move your rank bar.",
      reward: "+25 XP",
      href: "/dashboard"
    },
    {
      title: "Finish a quiz",
      description: "Use quizzes as boss checks for each topic.",
      reward: "+20 XP",
      href: "/courses"
    },
    {
      title: "Submit homework",
      description: "Practice tasks give the strongest skill XP.",
      reward: "+35 XP",
      href: "/progress"
    }
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-coral">Player hub</p>
          <h1 className="text-3xl font-bold text-ink">QA skill game</h1>
        </div>
        <Link href="/dashboard" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
          Continue learning
        </Link>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Current rank</p>
              <h2 className="mt-1 flex items-center gap-2 text-3xl font-bold text-ink">
                <Crown className="h-7 w-7 text-amber" />
                {player.rank}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Level {player.level} · {player.xp} XP · {player.streakDays} day streak
              </p>
            </div>
            <div className="rounded-md bg-slate-50 px-4 py-3 text-right">
              <p className="text-sm text-slate-500">Achievements</p>
              <p className="text-2xl font-bold text-ink">
                {player.achievementsUnlocked}/{player.achievementsTotal}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{player.rank}</span>
              <span className="text-slate-500">{player.nextRank ? `Next: ${player.nextRank}` : "Max rank reached"}</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-mint" style={{ width: `${nextRankProgress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {player.xpToNextRank !== null ? `${player.xpToNextRank} XP to next rank` : "You reached the top rank."}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Completed" value={`${player.completedLessons}/${player.totalLessons}`} />
            <Stat label="Opened" value={String(player.openedLessons)} />
            <Stat label="Quizzes" value={String(player.quizCompleted)} />
            <Stat label="Homework" value={String(player.homeworkSubmitted)} />
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-coral" />
            <h2 className="text-lg font-semibold text-ink">Daily quests</h2>
          </div>
          <div className="mt-4 space-y-3">
            {quests.map((quest) => (
              <Link key={quest.title} href={quest.href} className="block rounded-md border border-slate-200 p-3 transition hover:border-mint">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{quest.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{quest.description}</p>
                  </div>
                  <span className="shrink-0 rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{quest.reward}</span>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-mint" />
            <h2 className="text-lg font-semibold text-ink">Leaderboard</h2>
          </div>
          <div className="mt-4 space-y-2">
            {leaderboard.map((row) => (
              <div key={row.userId} className="grid grid-cols-[42px_1fr_auto] items-center gap-3 rounded-md bg-slate-50 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white font-bold text-ink">#{row.position}</div>
                <div>
                  <p className="font-semibold text-ink">{row.fullName || row.email}</p>
                  <p className="text-xs text-slate-500">{row.rank} · {row.completedLessons} lessons</p>
                </div>
                <p className="font-bold text-mint">{row.xp} XP</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-amber" />
            <h2 className="text-lg font-semibold text-ink">Rank path</h2>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {player.ranks.map((rank) => (
              <div key={rank.title} className={`rounded-md border p-3 ${rank.reached ? "border-mint bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                <p className="font-semibold text-ink">{rank.title}</p>
                <p className="text-sm text-slate-600">{rank.threshold} XP</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-coral" />
          <h2 className="text-lg font-semibold text-ink">Achievements</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[...unlocked, ...locked].map((achievement) => {
            const Icon = iconMap[achievement.icon as keyof typeof iconMap] ?? Trophy;
            return (
              <div
                key={achievement.code}
                className={`rounded-md border p-4 ${achievement.unlocked ? "border-mint bg-emerald-50" : "border-slate-200 bg-slate-50 opacity-75"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`rounded-md p-2 ${achievement.unlocked ? "bg-white text-mint" : "bg-white text-slate-400"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-ink">{achievement.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{achievement.description}</p>
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      {achievement.unlocked ? `Unlocked · +${achievement.xpReward} XP` : `Locked · +${achievement.xpReward} XP`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-ink">{value}</p>
    </div>
  );
}
