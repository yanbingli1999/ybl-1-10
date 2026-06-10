import { useGameStore } from '@/store/useGameStore'
import { getDayConfig, getDiseaseWave } from '@/data/gameData'
import { Calendar, Sun, Sunset, Moon, Home, Target, TrendingUp, Clock, AlertTriangle, Zap } from 'lucide-react'

const SHIFT_TOTAL = 12

export default function DayHeader() {
  const currentDay = useGameStore(s => s.currentDay)
  const shiftPhase = useGameStore(s => s.shiftPhase)
  const shiftProgress = useGameStore(s => s.shiftProgress)
  const effectiveRent = useGameStore(s => s.effectiveRent)
  const effectiveCureTarget = useGameStore(s => s.effectiveCureTarget)
  const dailyStats = useGameStore(s => s.dailyStats)
  const player = useGameStore(s => s.player)
  const advanceShift = useGameStore(s => s.advanceShift)
  const triggerEndDay = useGameStore(s => s.triggerEndDay)
  const resetGame = useGameStore(s => s.resetGame)
  const gamePhase = useGameStore(s => s.gamePhase)

  const dayConfig = getDayConfig(currentDay)
  const wave = dayConfig?.diseaseWaveId ? getDiseaseWave(dayConfig.diseaseWaveId) : null

  const totalSeen = dailyStats.curedToday + dailyStats.misdiagnosedToday
  const cureRate = totalSeen > 0 ? Math.floor((dailyStats.curedToday / totalSeen) * 100) : 0
  const targetCureRate = dayConfig ? Math.floor(dayConfig.cureRateTarget * 100) : 60
  const shiftPercent = Math.min(100, (shiftProgress / SHIFT_TOTAL) * 100)
  const cureProgress = Math.min(100, (dailyStats.curedToday / Math.max(1, effectiveCureTarget)) * 100)
  const canAdvance = gamePhase === 'idle' || gamePhase === 'diagnosing'

  const shiftIcon = shiftPhase === 'morning' ? Sun : shiftPhase === 'afternoon' ? Sunset : shiftPhase === 'evening' ? Moon : Home
  const shiftLabel = shiftPhase === 'morning' ? '早班' : shiftPhase === 'afternoon' ? '午班' : shiftPhase === 'evening' ? '晚班' : '打烊'
  const shiftColor = shiftPhase === 'morning' ? 'text-yellow-300' : shiftPhase === 'afternoon' ? 'text-orange-300' : shiftPhase === 'evening' ? 'text-indigo-300' : 'text-gray-400'

  return (
    <header className="px-4 py-2 border-b border-cyan-900/30 bg-gray-950/90 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-900/20 border border-cyan-700/30">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="font-display text-sm text-cyan-300 tracking-wide">第 {currentDay} 天</span>
              <span className="text-[10px] text-gray-500 ml-2">{dayConfig?.name}</span>
            </div>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/40 border border-gray-700/30 ${shiftColor}`}>
            {shiftPhase !== 'closed' && <Clock className="w-3.5 h-3.5 animate-pulse" />}
            {shiftPhase === 'closed' && <Home className="w-3.5 h-3.5" />}
            <span className="text-xs font-medium">{shiftLabel}</span>
            <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden ml-1">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
                style={{ width: `${shiftPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500">{shiftProgress}/{SHIFT_TOTAL}</span>
          </div>

          {wave && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/20 border border-red-700/40 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-red-300 font-medium">{wave.name}</span>
              <Zap className="w-3 h-3 text-red-400" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-gray-800/40 border border-gray-700/30">
            <div className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-[10px] text-gray-400">租金</span>
              <span className="text-xs font-display text-yellow-300">{effectiveRent} ⬡</span>
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[10px] text-gray-400">治愈</span>
              <span className="text-xs font-display">
                <span className={dailyStats.curedToday >= effectiveCureTarget ? 'text-green-300' : 'text-orange-300'}>
                  {dailyStats.curedToday}
                </span>
                <span className="text-gray-500">/{effectiveCureTarget}</span>
              </span>
              <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${cureProgress >= 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                  style={{ width: `${cureProgress}%` }}
                />
              </div>
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-[10px] text-gray-400">治愈率</span>
              <span className={`text-xs font-display ${cureRate >= targetCureRate ? 'text-green-300' : 'text-red-300'}`}>
                {cureRate}%
                <span className="text-gray-500 text-[10px]">/{targetCureRate}%</span>
              </span>
            </div>
          </div>

          {shiftPhase !== 'closed' && (
            <button
              onClick={() => canAdvance && advanceShift()}
              disabled={!canAdvance}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${canAdvance
                  ? 'bg-purple-900/30 border border-purple-700/40 text-purple-300 hover:bg-purple-900/50'
                  : 'bg-gray-800/30 border border-gray-700/30 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <Clock className="w-3.5 h-3.5" />
              推进时间
            </button>
          )}
          {shiftPhase === 'evening' && shiftProgress >= SHIFT_TOTAL - 1 && (
            <button
              onClick={triggerEndDay}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-900/30 border border-orange-700/40 text-orange-300 text-xs font-medium hover:bg-orange-900/50 transition-colors animate-pulse"
            >
              <Home className="w-3.5 h-3.5" />
              结束今日
            </button>
          )}
          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/20 border border-red-700/30 text-red-400 text-xs hover:bg-red-900/40 transition-colors"
          >
            重新挑战
          </button>
        </div>
      </div>

      {dayConfig?.description && (
        <div className="mt-1.5 text-[10px] text-gray-500 pl-1">
          💡 {dayConfig.description}
        </div>
      )}
    </header>
  )
}
