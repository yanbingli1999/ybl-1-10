import { useGameStore } from '@/store/useGameStore'
import { Star, TrendingUp, AlertTriangle, Heart, RotateCcw, Award, Wallet, Pill } from 'lucide-react'

export default function PlayerProgress() {
  const player = useGameStore(s => s.player)
  const dailyStats = useGameStore(s => s.dailyStats)
  const resetGame = useGameStore(s => s.resetGame)

  const expPercent = (player.exp / 100) * 100
  const repPercent = Math.min(100, Math.max(0, player.reputation))
  const repColor =
    repPercent >= 70
      ? 'from-green-600 to-green-400'
      : repPercent >= 40
      ? 'from-yellow-600 to-yellow-400'
      : 'from-red-600 to-red-400'
  const repTextColor =
    repPercent >= 70
      ? 'text-green-300'
      : repPercent >= 40
      ? 'text-yellow-300'
      : 'text-red-300'
  const totalSeen = dailyStats.curedToday + dailyStats.misdiagnosedToday
  const todayRate = totalSeen > 0 ? Math.floor((dailyStats.curedToday / totalSeen) * 100) : 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xs tracking-widest text-gray-400 uppercase">
          星际兽医档案
        </h3>
        <button
          onClick={resetGame}
          className="text-gray-600 hover:text-gray-400 transition-colors"
          title="重置游戏"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="font-display text-sm text-yellow-300">Lv.{player.level}</span>
          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${expPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-500">{player.exp}/100</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">⬡</span>
          <span className="font-display text-xl text-cyan-300 coin-display">{player.coins}</span>
          <span className="text-xs text-gray-500">星币</span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span className={`text-xs font-medium ${repTextColor}`}>
              声誉 {player.reputation}
            </span>
            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${repColor} rounded-full transition-all duration-500`}
                style={{ width: `${repPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500">/100</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-green-900/20 rounded-lg p-2 text-center border border-green-800/20">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Heart className="w-3 h-3 text-green-400" />
              <span className="text-[10px] text-green-500">治愈</span>
            </div>
            <span className="font-display text-base text-green-300">{player.cured}</span>
          </div>
          <div className="bg-red-900/20 rounded-lg p-2 text-center border border-red-800/20">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="text-[10px] text-red-500">误诊</span>
            </div>
            <span className="font-display text-base text-red-300">{player.misdiagnosed}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-900/40 rounded p-1.5">
          <TrendingUp className="w-3 h-3 text-cyan-500" />
          <span className="text-[10px] text-gray-400">累计收入</span>
          <span className="text-xs text-cyan-400 ml-auto">{player.totalIncome} ⬡</span>
        </div>
      </div>

      <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-800/30">
        <h4 className="text-[10px] tracking-widest text-purple-400 uppercase mb-2 flex items-center gap-1">
          <Wallet className="w-3 h-3" />
          今日统计
        </h4>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">今日收入</span>
            <span className="text-green-300 font-display">+{dailyStats.income} ⬡</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              <Pill className="w-2.5 h-2.5 inline mr-1" />
              药/食费
            </span>
            <span className="text-red-300 font-display">-{dailyStats.medicineCostTotal} ⬡</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">治愈 / 误诊</span>
            <span className="font-display">
              <span className="text-green-300">{dailyStats.curedToday}</span>
              <span className="text-gray-600 mx-0.5">/</span>
              <span className="text-red-300">{dailyStats.misdiagnosedToday}</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">今日治愈率</span>
            <span className={`font-display ${todayRate >= 60 ? 'text-green-300' : 'text-orange-300'}`}>
              {todayRate}%
            </span>
          </div>
          {dailyStats.reputationChange !== 0 && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-800/30">
              <span className="text-gray-500">声誉变化</span>
              <span className={`font-display ${dailyStats.reputationChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {dailyStats.reputationChange >= 0 ? '+' : ''}
                {dailyStats.reputationChange}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
