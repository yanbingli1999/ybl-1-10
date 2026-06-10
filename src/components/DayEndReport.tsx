import { useGameStore } from '@/store/useGameStore'
import type { DayEndReport as DayEndReportType } from '@/data/gameData'
import {
  Calendar, Coins, TrendingUp, TrendingDown, Heart, AlertTriangle,
  Wrench, Pill, CheckCircle, XCircle, ArrowRight, Home, Target, Award
} from 'lucide-react'

function ReportRow({
  label,
  value,
  positive,
  Icon,
  iconColor,
}: {
  label: string
  value: string | number
  positive?: boolean | null
  Icon: typeof Coins
  iconColor?: string
}) {
  const valueColor =
    positive === true ? 'text-green-300' : positive === false ? 'text-red-300' : 'text-gray-200'
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800/50 last:border-b-0">
      <div className="flex items-center gap-2">
        <Icon className={`w-3.5 h-3.5 ${iconColor || 'text-gray-400'}`} />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <span className={`text-xs font-display ${valueColor}`}>{value}</span>
    </div>
  )
}

function TargetStatus({ met, label, detail }: { met: boolean; label: string; detail?: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
      met
        ? 'bg-green-900/20 border-green-700/40'
        : 'bg-red-900/20 border-red-700/40'
    }`}>
      {met ? (
        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium ${met ? 'text-green-300' : 'text-red-300'}`}>
          {label}
        </div>
        {detail && <div className="text-[10px] text-gray-500 mt-0.5">{detail}</div>}
      </div>
    </div>
  )
}

export default function DayEndReport() {
  const report = useGameStore(s => s.dayEndReport)
  const currentDay = useGameStore(s => s.currentDay)
  const proceedNextDayOrEnd = useGameStore(s => s.proceedNextDayOrEnd)
  const gamePhase = useGameStore(s => s.gamePhase)
  const daysPassedList = useGameStore(s => s.daysPassedList)
  const daysFailedList = useGameStore(s => s.daysFailedList)

  if (gamePhase !== 'day_end' || !report) return null

  const r: DayEndReportType = report
  const totalPenalty = r.stats.penaltiesApplied.reduce((a, b) => a + b, 0)
  const cureRateStr = `${Math.floor(r.cureRate * 100)}%`
  const targetRateStr = `${Math.floor(r.cureRateTarget * 100)}%`
  const isLastDay = currentDay >= 3

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-xl bg-gray-900 border border-cyan-700/30 rounded-2xl shadow-2xl shadow-cyan-900/20 overflow-hidden">
        <div className={`px-6 py-5 border-b ${
          r.allTargetsMet
            ? 'bg-gradient-to-r from-green-900/40 via-cyan-900/30 to-green-900/40 border-green-700/20'
            : 'bg-gradient-to-r from-red-900/40 via-orange-900/30 to-red-900/40 border-red-700/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className={`w-6 h-6 ${r.allTargetsMet ? 'text-green-400' : 'text-orange-400'}`} />
              <div>
                <h2 className="font-display text-xl tracking-widest text-gray-100">
                  第 {r.day} 天 · 日终报表
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  {r.allTargetsMet ? (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <Award className="w-3 h-3" /> 全部目标达成！
                    </span>
                  ) : (
                    <span className="text-xs text-orange-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> 部分目标未达标
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-display text-2xl ${r.netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {r.netProfit >= 0 ? '+' : ''}{r.netProfit} ⬡
              </div>
              <div className="text-[10px] text-gray-400">当日净利润</div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            <TargetStatus met={r.rentPaid} label="租金支付" detail={`${r.rent} ⬡${r.rentPaid ? '' : '（未缴）'}`} />
            <TargetStatus
              met={r.cureTargetMet}
              label="治愈数"
              detail={`${r.stats.curedToday}/${r.cureTarget} 例`}
            />
            <TargetStatus
              met={r.cureRateTargetMet}
              label="治愈率"
              detail={`${cureRateStr} / ${targetRateStr}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-700/40 bg-gray-800/30 p-3">
              <h4 className="text-[10px] tracking-widest text-cyan-400 uppercase mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> 收入明细
              </h4>
              <div className="space-y-0.5">
                <ReportRow label="诊疗收入" value={`+${r.stats.income} ⬡`} positive Icon={Coins} iconColor="text-green-400" />
              </div>
            </div>

            <div className="rounded-xl border border-gray-700/40 bg-gray-800/30 p-3">
              <h4 className="text-[10px] tracking-widest text-red-400 uppercase mb-2 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> 支出明细
              </h4>
              <div className="space-y-0.5">
                <ReportRow label={`租金${r.rentPaid ? '' : '（未缴）'}`} value={`-${r.rentPaid ? r.rent : 0} ⬡`} positive={false} Icon={Home} iconColor="text-yellow-400" />
                <ReportRow label="药品/食物" value={`-${r.stats.medicineCostTotal} ⬡`} positive={false} Icon={Pill} iconColor="text-purple-400" />
                <ReportRow label="设备维修" value={`-${r.stats.equipmentRepairedCost} ⬡`} positive={false} Icon={Wrench} iconColor="text-orange-400" />
                <ReportRow label="事故/误诊罚款" value={`-${r.stats.expenses - r.stats.medicineCostTotal - r.stats.equipmentRepairedCost - (r.rentPaid ? r.rent : 0)} ⬡`} positive={false} Icon={AlertTriangle} iconColor="text-red-400" />
                {totalPenalty > 0 && (
                  <ReportRow label="未达标惩罚" value={`-${totalPenalty} ⬡`} positive={false} Icon={XCircle} iconColor="text-red-500" />
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-700/40 bg-gray-800/30 p-3">
            <h4 className="text-[10px] tracking-widest text-purple-400 uppercase mb-2 flex items-center gap-1">
              <Heart className="w-3 h-3" /> 当日统计
            </h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center bg-green-900/20 rounded-lg p-2 border border-green-800/30">
                <div className="font-display text-lg text-green-300">{r.stats.curedToday}</div>
                <div className="text-[10px] text-green-500">治愈</div>
              </div>
              <div className="text-center bg-red-900/20 rounded-lg p-2 border border-red-800/30">
                <div className="font-display text-lg text-red-300">{r.stats.misdiagnosedToday}</div>
                <div className="text-[10px] text-red-500">误诊</div>
              </div>
              <div className="text-center bg-orange-900/20 rounded-lg p-2 border border-orange-800/30">
                <div className="font-display text-lg text-orange-300">{r.stats.accidentsToday}</div>
                <div className="text-[10px] text-orange-500">事故</div>
              </div>
              <div className="text-center bg-cyan-900/20 rounded-lg p-2 border border-cyan-800/30">
                <div className={`font-display text-lg ${r.stats.reputationChange >= 0 ? 'text-cyan-300' : 'text-red-300'}`}>
                  {r.stats.reputationChange >= 0 ? '+' : ''}{r.stats.reputationChange}
                </div>
                <div className="text-[10px] text-cyan-500">声誉变化</div>
              </div>
            </div>
          </div>

          {r.penalties.length > 0 && (
            <div className="rounded-xl border border-red-700/40 bg-red-900/20 p-3">
              <h4 className="text-[10px] tracking-widest text-red-400 uppercase mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> 惩罚记录
              </h4>
              <ul className="space-y-1">
                {r.penalties.map((p, i) => (
                  <li key={i} className="text-xs text-red-300 flex items-start gap-1.5">
                    <span className="text-red-400 mt-0.5">✕</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-gray-700/40 bg-gray-800/30 p-3">
            <h4 className="text-[10px] tracking-widest text-orange-400 uppercase mb-2 flex items-center gap-1">
              <Wrench className="w-3 h-3" /> 设备状态
            </h4>
            <div className="grid grid-cols-3 gap-1.5">
              {r.equipmentStatus.map(e => (
                <div
                  key={e.id}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] ${
                    e.status === 'normal'
                      ? 'bg-green-900/20 border-green-800/40 text-green-300'
                      : 'bg-red-900/20 border-red-800/40 text-red-300 animate-pulse'
                  }`}
                >
                  {e.status === 'normal' ? (
                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                  )}
                  <span className="truncate">{e.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-700/40 bg-gray-800/30 p-3">
            <h4 className="text-[10px] tracking-widest text-gray-400 uppercase mb-2">挑战进度</h4>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(d => {
                const passed = daysPassedList.includes(d)
                const failed = daysFailedList.includes(d)
                const current = d === currentDay
                return (
                  <div
                    key={d}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      passed ? 'bg-green-500' : failed ? 'bg-red-500' : current ? 'bg-cyan-500 animate-pulse' : 'bg-gray-700'
                    }`}
                    title={`Day ${d}: ${passed ? 'PASS' : failed ? 'FAIL' : current ? 'CURRENT' : 'PENDING'}`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between mt-1.5">
              {[1, 2, 3].map(d => (
                <span key={d} className="text-[10px] text-gray-500 text-center flex-1">Day {d}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={proceedNextDayOrEnd}
            className={`w-full py-3 rounded-xl font-display tracking-widest text-sm transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${
              isLastDay
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-500 hover:to-pink-400 shadow-purple-900/30'
                : r.allTargetsMet
                ? 'bg-gradient-to-r from-cyan-600 to-green-500 text-white hover:from-cyan-500 hover:to-green-400 shadow-cyan-900/30'
                : 'bg-gradient-to-r from-orange-600 to-red-500 text-white hover:from-orange-500 hover:to-red-400 shadow-orange-900/30'
            }`}
          >
            {isLastDay ? '查看最终结果' : `进入第 ${currentDay + 1} 天`}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
