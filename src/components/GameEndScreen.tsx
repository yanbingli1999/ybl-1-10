import { useGameStore } from '@/store/useGameStore'
import type { GameEndSummary } from '@/data/gameData'
import {
  Trophy, Star, Heart, AlertTriangle, Coins,
  RotateCcw, Award, Sparkles, Target, TrendingUp
} from 'lucide-react'

function RatingBadge({ rating }: { rating: GameEndSummary['overallRating'] }) {
  const configs: Record<string, { color: string; glow: string; bg: string }> = {
    S: { color: 'text-yellow-200', glow: 'shadow-yellow-500/50', bg: 'from-yellow-600 via-yellow-400 to-yellow-200' },
    A: { color: 'text-green-200', glow: 'shadow-green-500/50', bg: 'from-green-600 via-green-400 to-green-200' },
    B: { color: 'text-cyan-200', glow: 'shadow-cyan-500/50', bg: 'from-cyan-600 via-cyan-400 to-cyan-200' },
    C: { color: 'text-blue-200', glow: 'shadow-blue-500/50', bg: 'from-blue-600 via-blue-400 to-blue-200' },
    D: { color: 'text-orange-200', glow: 'shadow-orange-500/50', bg: 'from-orange-600 via-orange-400 to-orange-200' },
    F: { color: 'text-red-200', glow: 'shadow-red-500/50', bg: 'from-red-600 via-red-400 to-red-200' },
  }
  const cfg = configs[rating] || configs.F

  return (
    <div className="relative">
      <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 bg-gradient-to-br ${cfg.bg}`} />
      <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${cfg.bg} flex items-center justify-center shadow-2xl ${cfg.glow}`}>
        <span className={`font-display text-7xl ${cfg.color} drop-shadow-lg`}>{rating}</span>
      </div>
      {rating === 'S' && (
        <div className="absolute -top-2 -right-2 text-3xl animate-bounce">👑</div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  Icon,
  iconColor,
  borderColor,
  bg,
}: {
  label: string
  value: string | number
  sub?: string
  Icon: typeof Coins
  iconColor: string
  borderColor: string
  bg: string
}) {
  return (
    <div className={`rounded-xl border ${borderColor} ${bg} p-3 text-center`}>
      <Icon className={`w-4 h-4 ${iconColor} mx-auto mb-1`} />
      <div className="font-display text-2xl text-gray-100">{value}</div>
      <div className={`text-[10px] ${iconColor} tracking-wide uppercase`}>{label}</div>
      {sub && <div className="text-[9px] text-gray-500 mt-0.5">{sub}</div>}
    </div>
  )
}

export default function GameEndScreen() {
  const summary = useGameStore(s => s.gameEndSummary)
  const player = useGameStore(s => s.player)
  const daysPassedList = useGameStore(s => s.daysPassedList)
  const daysFailedList = useGameStore(s => s.daysFailedList)
  const gamePhase = useGameStore(s => s.gamePhase)
  const resetGame = useGameStore(s => s.resetGame)

  if (gamePhase !== 'game_end' || !summary) return null

  const accuracy = summary.totalCured + summary.totalMisdiagnosed > 0
    ? Math.floor((summary.totalCured / (summary.totalCured + summary.totalMisdiagnosed)) * 100)
    : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative z-10 w-full max-w-xl my-8">
        <div className="bg-gray-900 border border-purple-700/30 rounded-3xl shadow-2xl shadow-purple-900/30 overflow-hidden">
          <div className="relative px-6 pt-8 pb-6 text-center bg-gradient-to-b from-purple-900/40 via-indigo-900/20 to-transparent">
            {[...Array(8)].map((_, i) => (
              <Sparkles
                key={i}
                className="absolute text-yellow-300/40 animate-pulse"
                style={{
                  width: `${10 + Math.random() * 14}px`,
                  height: `${10 + Math.random() * 14}px`,
                  left: `${5 + Math.random() * 90}%`,
                  top: `${5 + Math.random() * 80}%`,
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
            <div className="flex justify-center mb-4">
              <RatingBadge rating={summary.overallRating} />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h2 className="font-display text-2xl tracking-widest text-gray-100">
                三天挑战结束
              </h2>
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-sm text-purple-200 max-w-md mx-auto">
              {summary.finalMessage}
            </p>
          </div>

          <div className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <StatCard
                label="最终星币"
                value={`${summary.totalCoins} ⬡`}
                Icon={Coins}
                iconColor="text-cyan-400"
                borderColor="border-cyan-700/40"
                bg="bg-cyan-900/20"
              />
              <StatCard
                label="总治愈"
                value={summary.totalCured}
                Icon={Heart}
                iconColor="text-green-400"
                borderColor="border-green-700/40"
                bg="bg-green-900/20"
              />
              <StatCard
                label="总误诊"
                value={summary.totalMisdiagnosed}
                Icon={AlertTriangle}
                iconColor="text-red-400"
                borderColor="border-red-700/40"
                bg="bg-red-900/20"
              />
              <StatCard
                label="最终声誉"
                value={`${summary.finalReputation}/100`}
                Icon={Star}
                iconColor="text-yellow-400"
                borderColor="border-yellow-700/40"
                bg="bg-yellow-900/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-purple-700/40 bg-purple-900/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-purple-300 tracking-wide uppercase">三天完成情况</span>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map(d => {
                    const passed = daysPassedList.includes(d)
                    const failed = daysFailedList.includes(d)
                    return (
                      <div
                        key={d}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                          passed
                            ? 'bg-green-900/30 border border-green-700/30'
                            : failed
                            ? 'bg-red-900/30 border border-red-700/30'
                            : 'bg-gray-800/50 border border-gray-700/30'
                        }`}
                      >
                        {passed ? (
                          <Award className="w-3.5 h-3.5 text-green-400" />
                        ) : failed ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        ) : (
                          <Star className="w-3.5 h-3.5 text-gray-500" />
                        )}
                        <span className={`text-xs font-medium flex-1 ${
                          passed ? 'text-green-300' : failed ? 'text-red-300' : 'text-gray-500'
                        }`}>
                          第 {d} 天
                        </span>
                        <span className={`text-[10px] ${
                          passed ? 'text-green-400' : failed ? 'text-red-400' : 'text-gray-500'
                        }`}>
                          {passed ? '✓ 达标' : failed ? '✗ 未达标' : '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-indigo-700/40 bg-indigo-900/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs text-indigo-300 tracking-wide uppercase">总体统计</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">诊断准确率</span>
                    <span className={`font-display text-sm ${accuracy >= 70 ? 'text-green-300' : accuracy >= 50 ? 'text-yellow-300' : 'text-red-300'}`}>
                      {accuracy}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${accuracy >= 70 ? 'bg-green-500' : accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-400">等级</span>
                    <span className="font-display text-sm text-yellow-300">Lv.{player.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">累计收入</span>
                    <span className="font-display text-sm text-cyan-300">{player.totalIncome} ⬡</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">医疗事故</span>
                    <span className="font-display text-sm text-orange-300">{summary.totalAccidents} 次</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">达标天数</span>
                    <span className="font-display text-sm text-green-300">{daysPassedList.length} / 3</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={resetGame}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-500 text-white font-display tracking-widest text-sm hover:from-cyan-500 hover:to-purple-400 transition-all shadow-lg shadow-cyan-900/30 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                重新挑战三天经营
              </button>
            </div>
            <p className="text-[10px] text-center text-gray-600">
              感谢游玩！你的星际兽医之旅暂告一段落 🌟
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
