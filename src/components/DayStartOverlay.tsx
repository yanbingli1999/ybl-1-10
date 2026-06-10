import { useGameStore } from '@/store/useGameStore'
import { getDayConfig, getDiseaseWave, type DailyEvent } from '@/data/gameData'
import { Calendar, Target, Home, TrendingUp, AlertTriangle, CheckCircle, XCircle, Sparkles } from 'lucide-react'

function EventCard({ event }: { event: DailyEvent }) {
  const borderColor =
    event.type === 'positive'
      ? 'border-green-600/40 bg-green-900/20'
      : event.type === 'negative'
      ? 'border-red-600/40 bg-red-900/20'
      : 'border-blue-600/40 bg-blue-900/20'
  const titleColor =
    event.type === 'positive'
      ? 'text-green-300'
      : event.type === 'negative'
      ? 'text-red-300'
      : 'text-blue-300'
  const Icon = event.type === 'positive' ? CheckCircle : event.type === 'negative' ? XCircle : Sparkles
  const iconColor = event.type === 'positive' ? 'text-green-400' : event.type === 'negative' ? 'text-red-400' : 'text-blue-400'

  const effects: string[] = []
  if (event.effect.coins !== undefined) {
    effects.push(`${event.effect.coins > 0 ? '+' : ''}${event.effect.coins} ⬡ 星币`)
  }
  if (event.effect.reputation !== undefined) {
    effects.push(`${event.effect.reputation > 0 ? '+' : ''}${event.effect.reputation} 声誉`)
  }
  if (event.effect.rentModifier !== undefined) {
    effects.push(`租金 ×${event.effect.rentModifier}`)
  }
  if (event.effect.cureTargetModifier !== undefined) {
    effects.push(`治愈目标 +${event.effect.cureTargetModifier}`)
  }
  if (event.effect.immediateCases !== undefined) {
    effects.push(`突发病例 +${event.effect.immediateCases}`)
  }

  return (
    <div className={`rounded-xl border ${borderColor} p-4`}>
      <div className="flex items-start gap-3">
        <div className="text-4xl">{event.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-4 h-4 ${iconColor}`} />
            <h4 className={`font-display tracking-wide ${titleColor}`}>{event.title}</h4>
          </div>
          <p className="text-xs text-gray-300 mb-2">{event.description}</p>
          {effects.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {effects.map((e, i) => (
                <span
                  key={i}
                  className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700/40 text-gray-300"
                >
                  {e}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DayStartOverlay() {
  const currentDay = useGameStore(s => s.currentDay)
  const currentEvent = useGameStore(s => s.currentEvent)
  const effectiveRent = useGameStore(s => s.effectiveRent)
  const effectiveCureTarget = useGameStore(s => s.effectiveCureTarget)
  const player = useGameStore(s => s.player)
  const confirmDayStart = useGameStore(s => s.confirmDayStart)
  const startDay = useGameStore(s => s.startDay)
  const gamePhase = useGameStore(s => s.gamePhase)

  if (gamePhase !== 'day_start') return null

  const dayConfig = getDayConfig(currentDay)
  const wave = dayConfig?.diseaseWaveId ? getDiseaseWave(dayConfig.diseaseWaveId) : null
  const targetCureRate = dayConfig ? Math.floor(dayConfig.cureRateTarget * 100) : 60
  const isFirstDay = currentDay === 1 && !currentEvent

  if (isFirstDay) {
    startDay(1)
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg bg-gray-900 border border-cyan-700/30 rounded-2xl shadow-2xl shadow-cyan-900/20 overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-900/40 via-purple-900/30 to-cyan-900/40 px-6 py-5 border-b border-cyan-700/20">
          <div className="flex items-center gap-3 mb-1">
            <Calendar className="w-6 h-6 text-cyan-400" />
            <h2 className="font-display text-2xl text-cyan-300 tracking-widest">
              第 {currentDay} 天 — {dayConfig?.name}
            </h2>
          </div>
          <p className="text-xs text-gray-400 pl-9">{dayConfig?.description}</p>
        </div>

        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {currentEvent && <EventCard event={currentEvent} />}

          {wave && (
            <div className="rounded-xl border border-red-600/40 bg-red-900/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
                <h4 className="font-display tracking-wide text-red-300">⚠ 每日病潮预警</h4>
              </div>
              <p className="text-xs text-gray-300 mb-2">{wave.description}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/40 text-red-300 border border-red-700/40">
                  紧急病例激增
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/40 text-red-300 border border-red-700/40">
                  初始病例 +{wave.caseBonus}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-yellow-700/30 bg-yellow-900/20 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Home className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-[10px] text-yellow-400 tracking-wide">今日租金</span>
              </div>
              <div className="font-display text-xl text-yellow-300">{effectiveRent} ⬡</div>
              <div className="text-[10px] text-gray-500 mt-1">日终自动扣除</div>
            </div>

            <div className="rounded-xl border border-green-700/30 bg-green-900/20 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Target className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[10px] text-green-400 tracking-wide">治愈目标</span>
              </div>
              <div className="font-display text-xl text-green-300">{effectiveCureTarget} 例</div>
              <div className="text-[10px] text-gray-500 mt-1">未达标每例罚 20 ⬡</div>
            </div>

            <div className="rounded-xl border border-purple-700/30 bg-purple-900/20 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] text-purple-400 tracking-wide">治愈率目标</span>
              </div>
              <div className="font-display text-xl text-purple-300">{targetCureRate}%</div>
              <div className="text-[10px] text-gray-500 mt-1">未达标声誉 -10</div>
            </div>

            <div className="rounded-xl border border-cyan-700/30 bg-cyan-900/20 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] text-cyan-400 tracking-wide">当前星币</span>
              </div>
              <div className="font-display text-xl text-cyan-300">{player.coins} ⬡</div>
              <div className="text-[10px] text-gray-500 mt-1">声誉 {player.reputation}/100</div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={confirmDayStart}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-green-500 text-white font-display tracking-widest text-sm hover:from-cyan-500 hover:to-green-400 transition-all shadow-lg shadow-cyan-900/30 active:scale-[0.98]"
          >
            开始接诊 ➤
          </button>
          <p className="text-[10px] text-gray-500 text-center mt-2">
            ⏰ 点击「推进时间」推进班次，晚班后可结束当日
          </p>
        </div>
      </div>
    </div>
  )
}
