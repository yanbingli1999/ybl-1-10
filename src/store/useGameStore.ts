import { create } from 'zustand'
import {
  type PetCase,
  type Player,
  type Equipment,
  type GamePhase,
  type DiagnosisResult,
  type ActionType,
  type AccidentType,
  type ShiftPhase,
  type DailyStats,
  type DayEndReport,
  type GameEndSummary,
  type DailyEvent,
  initialEquipment,
  generatePetCase,
  generateInitialCases,
  generateTestCases,
  generateWavePetCase,
  getDisease,
  getMedicine,
  getDayConfig,
  getDiseaseWave,
  getRandomDailyEvent,
  createInitialDailyStats,
  dayConfigs,
} from '@/data/gameData'

interface GameState {
  cases: PetCase[]
  activeCaseId: string | null
  player: Player
  equipment: Equipment[]
  gamePhase: GamePhase
  accidentType: AccidentType | null
  diagnosisResult: DiagnosisResult | null
  actionCooldowns: Record<ActionType, number>
  selectedMedicineId: string | null
  showMedicineSelector: boolean
  pendingAction: 'medicate' | 'inject' | 'feed' | null

  currentDay: number
  shiftPhase: ShiftPhase
  shiftProgress: number
  dailyStats: DailyStats
  currentEvent: DailyEvent | null
  effectiveRent: number
  effectiveCureTarget: number
  dayEndReport: DayEndReport | null
  gameEndSummary: GameEndSummary | null
  daysPassedList: number[]
  daysFailedList: number[]

  selectCase: (id: string) => void
  examine: () => void
  medicate: () => void
  inject: () => void
  feed: () => void
  isolate: () => void
  selectMedicine: (id: string) => void
  cancelMedicineSelect: () => void
  performTreatment: (action: ActionType, medicineId?: string | null) => void
  repairEquipment: (id: string) => void
  dismissResult: () => void
  dismissAccident: () => void
  generateNewCase: () => void
  loadTestCases: () => void
  resetGame: () => void

  startChallenge: () => void
  startDay: (day: number) => void
  confirmDayStart: () => void
  advanceShift: () => void
  triggerEndDay: () => void
  confirmDayEnd: () => void
  proceedNextDayOrEnd: () => void
}

const initialPlayer: Player = {
  coins: 200,
  level: 1,
  exp: 0,
  cured: 0,
  misdiagnosed: 0,
  totalIncome: 0,
  reputation: 50,
}

const expPerLevel = 100
const TOTAL_DAYS = 3
const SHIFT_STEPS = 4

function getCoinsForUrgency(urgency: PetCase['urgency']): number {
  switch (urgency) {
    case 'low': return 30
    case 'medium': return 50
    case 'high': return 80
  }
}

function getPenaltyForAccident(urgency: PetCase['urgency']): number {
  switch (urgency) {
    case 'low': return 20
    case 'medium': return 35
    case 'high': return 60
  }
}

function getActionLabel(action: ActionType): string {
  switch (action) {
    case 'examine': return '检查'
    case 'medicate': return '用药'
    case 'inject': return '打针'
    case 'feed': return '喂食'
    case 'isolate': return '隔离'
  }
}

function getShiftLabel(phase: ShiftPhase): string {
  switch (phase) {
    case 'morning': return '早班'
    case 'afternoon': return '午班'
    case 'evening': return '晚班'
    case 'closed': return '打烊'
  }
}

function computeDayEndReport(
  day: number,
  stats: DailyStats,
  rent: number,
  cureTarget: number,
  cureRateTarget: number,
  totalCasesTarget: number,
  equipmentList: Equipment[]
): DayEndReport {
  const totalSeen = stats.curedToday + stats.misdiagnosedToday
  const cureRate = totalSeen > 0 ? stats.curedToday / totalSeen : 0
  const rentPaid = stats.rentPaid
  const cureTargetMet = stats.curedToday >= cureTarget
  const cureRateTargetMet = cureRate >= cureRateTarget
  const penalties: string[] = []
  const effectiveStats = { ...stats, penaltiesApplied: [...stats.penaltiesApplied] }

  if (!rentPaid) {
    penalties.push(`未支付租金！罚款 ${Math.floor(rent * 0.5)} ⬡，声誉 -15`)
    effectiveStats.penaltiesApplied.push(Math.floor(rent * 0.5))
    effectiveStats.reputationChange -= 15
  }
  if (!cureTargetMet) {
    const shortfall = cureTarget - stats.curedToday
    const penalty = shortfall * 20
    penalties.push(`治愈数未达标（差 ${shortfall} 例），罚款 ${penalty} ⬡`)
    effectiveStats.penaltiesApplied.push(penalty)
  }
  if (!cureRateTargetMet && totalSeen > 0) {
    penalties.push(`治愈率未达标（${Math.floor(cureRate * 100)}% < ${Math.floor(cureRateTarget * 100)}%），声誉 -10`)
    effectiveStats.reputationChange -= 10
  }

  const totalPenaltyCoins = effectiveStats.penaltiesApplied.reduce((a, b) => a + b, 0)
  const netProfit = stats.income - stats.expenses - totalPenaltyCoins
  const allTargetsMet = rentPaid && cureTargetMet && cureRateTargetMet

  return {
    day,
    stats: effectiveStats,
    rent,
    cureTarget,
    cureRateTarget,
    totalCasesTarget,
    cureRate,
    rentPaid,
    cureTargetMet,
    cureRateTargetMet,
    allTargetsMet,
    penalties,
    netProfit,
    equipmentStatus: equipmentList.map(e => ({ id: e.id, name: e.name, status: e.status })),
  }
}

function computeGameEndSummary(
  player: Player,
  daysPassed: number[],
  daysFailed: number[],
  totalAccidents: number
): GameEndSummary {
  const daysCompleted = daysPassed.length
  const rep = player.reputation
  const coins = player.coins
  const cured = player.cured
  const misdiagnosed = player.misdiagnosed
  const accuracy = cured + misdiagnosed > 0 ? cured / (cured + misdiagnosed) : 0

  let rating: GameEndSummary['overallRating'] = 'F'
  let finalMessage = ''

  if (daysCompleted >= 3 && coins >= 500 && rep >= 70 && accuracy >= 0.8) {
    rating = 'S'
    finalMessage = '传奇星际兽医！诊所声望响彻银河！'
  } else if (daysCompleted >= 3 && coins >= 300 && rep >= 50 && accuracy >= 0.65) {
    rating = 'A'
    finalMessage = '优秀！你成功经营了三天，是位称职的星际医生！'
  } else if (daysCompleted >= 2 && coins >= 150 && accuracy >= 0.5) {
    rating = 'B'
    finalMessage = '还不错，虽然有些坎坷，但整体还算顺利。'
  } else if (daysCompleted >= 2) {
    rating = 'C'
    finalMessage = '勉强及格，还需要更多练习和经验。'
  } else if (daysCompleted >= 1) {
    rating = 'D'
    finalMessage = '困难重重，不过至少开业了一天。'
  } else {
    rating = 'F'
    finalMessage = '诊所第一天就倒闭了...下次加油！'
  }

  return {
    totalCoins: coins,
    totalCured: cured,
    totalMisdiagnosed: misdiagnosed,
    totalAccidents,
    finalReputation: rep,
    daysCompleted,
    daysPassed,
    daysFailed,
    overallRating: rating,
    finalMessage,
  }
}

export const useGameStore = create<GameState>((set, get) => ({
  cases: generateInitialCases(5),
  activeCaseId: null,
  player: { ...initialPlayer },
  equipment: initialEquipment.map(e => ({ ...e })),
  gamePhase: 'day_start',
  accidentType: null,
  diagnosisResult: null,
  actionCooldowns: {
    examine: 0,
    medicate: 0,
    inject: 0,
    feed: 0,
    isolate: 0,
  },
  selectedMedicineId: null,
  showMedicineSelector: false,
  pendingAction: null,

  currentDay: 1,
  shiftPhase: 'morning',
  shiftProgress: 0,
  dailyStats: createInitialDailyStats(1),
  currentEvent: null,
  effectiveRent: 80,
  effectiveCureTarget: 4,
  dayEndReport: null,
  gameEndSummary: null,
  daysPassedList: [],
  daysFailedList: [],

  selectCase: (id: string) => {
    const state = get()
    if (state.gamePhase === 'accident' || state.gamePhase === 'result') return
    if (state.gamePhase === 'day_start' || state.gamePhase === 'day_end' || state.gamePhase === 'game_end') return
    set({
      activeCaseId: id,
      gamePhase: 'diagnosing',
      showMedicineSelector: false,
      selectedMedicineId: null,
      pendingAction: null,
    })
  },

  examine: () => {
    const state = get()
    const activeCase = state.cases.find(c => c.id === state.activeCaseId)
    if (!activeCase) return

    const scanner = state.equipment.find(e => e.requiredAction === 'examine')
    if (scanner?.status !== 'normal') return
    if (state.actionCooldowns.examine > Date.now()) return

    const updatedCases = state.cases.map(c =>
      c.id === activeCase.id ? { ...c, examined: true } : c
    )

    set({
      cases: updatedCases,
      actionCooldowns: { ...state.actionCooldowns, examine: Date.now() + 3000 },
    })
  },

  medicate: () => {
    set({ showMedicineSelector: true, pendingAction: 'medicate' })
  },

  inject: () => {
    set({ showMedicineSelector: true, pendingAction: 'inject' })
  },

  feed: () => {
    set({ showMedicineSelector: true, pendingAction: 'feed' })
  },

  isolate: () => {
    get().performTreatment('isolate')
  },

  selectMedicine: (id: string) => {
    const state = get()
    const action = state.pendingAction
    if (!action) return

    const medicine = getMedicine(id)
    if (medicine && state.player.coins < medicine.cost) {
      const activeCase = state.cases.find(c => c.id === state.activeCaseId)
      if (!activeCase) return

      const disease = getDisease(activeCase.diseaseId)
      const result: DiagnosisResult = {
        success: false,
        diseaseName: disease?.name || '',
        actionTaken: action,
        correctAction: disease?.correctAction || 'medicate',
        medicineUsed: id,
        correctMedicine: disease?.medicineId || null,
        coinsEarned: 0,
        medicineCost: medicine.cost,
        accidentType: null,
        damagedEquipment: null,
        message: `星币不足！${medicine.name} 需要 ${medicine.cost} ⬡，你只有 ${state.player.coins} ⬡`,
        errorType: 'funds',
      }

      set({
        gamePhase: 'result',
        diagnosisResult: result,
        showMedicineSelector: false,
        selectedMedicineId: null,
        pendingAction: null,
      })
      return
    }

    get().performTreatment(action, id)
  },

  cancelMedicineSelect: () => {
    set({ showMedicineSelector: false, selectedMedicineId: null, pendingAction: null })
  },

  performTreatment: (action: ActionType, medicineId?: string | null) => {
    const state = get()
    const activeCase = state.cases.find(c => c.id === state.activeCaseId)
    if (!activeCase) return

    const disease = getDisease(activeCase.diseaseId)
    if (!disease) return

    const requiredEquip = state.equipment.find(e => e.requiredAction === action)
    if (requiredEquip?.status !== 'normal') return

    const actionCorrect = action === disease.correctAction
    const needsMedicine = disease.medicineId !== null
    const medicine = medicineId ? getMedicine(medicineId) : null
    const medicineCorrect = !needsMedicine || (medicineId !== undefined && medicineId === disease.medicineId)
    const medicineCost = medicine?.cost || 0

    let errorType: 'action' | 'medicine' | null = null
    if (!actionCorrect) errorType = 'action'
    else if (actionCorrect && !medicineCorrect) errorType = 'medicine'

    const isCorrect = actionCorrect && medicineCorrect

    const currentStats = { ...state.dailyStats, casesSeen: state.dailyStats.casesSeen + 1 }

    if (isCorrect) {
      const coinsEarned = getCoinsForUrgency(activeCase.urgency)
      const expGain = activeCase.urgency === 'high' ? 30 : activeCase.urgency === 'medium' ? 20 : 10
      const netCoins = coinsEarned - medicineCost
      const newExp = state.player.exp + expGain
      const levelUp = newExp >= expPerLevel
      const newLevel = levelUp ? state.player.level + 1 : state.player.level
      const newExpAfterLevel = levelUp ? newExp - expPerLevel : newExp

      const updatedCases = state.cases.map(c =>
        c.id === activeCase.id ? { ...c, status: 'cured' as const } : c
      )

      const itemType = action === 'feed' ? '食物' : action === 'inject' ? '注射剂' : '药品'
      let message = `诊断正确！${activeCase.petName} 的「${disease.name}」已治愈！`
      if (medicineCost > 0) {
        message += `（扣除${itemType}费 ${medicineCost} ⬡）`
      }

      const result: DiagnosisResult = {
        success: true,
        diseaseName: disease.name,
        actionTaken: action,
        correctAction: disease.correctAction,
        medicineUsed: medicineId || null,
        correctMedicine: disease.medicineId,
        coinsEarned: netCoins,
        medicineCost,
        accidentType: null,
        damagedEquipment: null,
        message,
        errorType: null,
      }

      const repGain = activeCase.urgency === 'high' ? 3 : activeCase.urgency === 'medium' ? 2 : 1
      currentStats.income += coinsEarned
      currentStats.expenses += medicineCost
      currentStats.curedToday += 1
      currentStats.medicineCostTotal += medicineCost
      currentStats.reputationChange += repGain

      set({
        cases: updatedCases,
        player: {
          ...state.player,
          coins: state.player.coins + netCoins,
          level: newLevel,
          exp: newExpAfterLevel,
          cured: state.player.cured + 1,
          totalIncome: state.player.totalIncome + coinsEarned,
          reputation: Math.min(100, state.player.reputation + repGain),
        },
        dailyStats: currentStats,
        gamePhase: 'result',
        diagnosisResult: result,
        showMedicineSelector: false,
        selectedMedicineId: null,
        pendingAction: null,
      })
    } else {
      const penalty = getPenaltyForAccident(activeCase.urgency)
      const totalDeduction = penalty + medicineCost
      const damagedEquipId = disease.accidentType === 'bite'
        ? requiredEquip?.id || null
        : null

      const updatedCases = state.cases.map(c =>
        c.id === activeCase.id ? { ...c, status: 'accident' as const } : c
      )

      const updatedEquipment = damagedEquipId
        ? state.equipment.map(e =>
            e.id === damagedEquipId ? { ...e, status: 'damaged' as const } : e
          )
        : state.equipment

      let message = ''
      const itemType = action === 'feed' ? '食物' : action === 'inject' ? '注射剂' : '药品'
      if (errorType === 'action') {
        message = `误诊！${activeCase.petName} 患的是「${disease.name}」，应该${getActionLabel(disease.correctAction)}而不是${getActionLabel(action)}！`
        if (medicineCost > 0) {
          message += `（扣除${itemType}费 ${medicineCost} ⬡）`
        }
      } else if (errorType === 'medicine') {
        const correctMed = disease.medicineId ? getMedicine(disease.medicineId) : null
        const usedMed = medicineId ? getMedicine(medicineId) : null
        message = `用错${itemType}了！${activeCase.petName} 患的是「${disease.name}」，应该用「${correctMed?.name || '正确物品'}」而不是「${usedMed?.name || '未知物品'}」！（扣除${itemType}费 ${medicineCost} ⬡）`
      }

      const result: DiagnosisResult = {
        success: false,
        diseaseName: disease.name,
        actionTaken: action,
        correctAction: disease.correctAction,
        medicineUsed: medicineId || null,
        correctMedicine: disease.medicineId,
        coinsEarned: -totalDeduction,
        medicineCost,
        accidentType: disease.accidentType,
        damagedEquipment: damagedEquipId,
        message,
        errorType,
      }

      const repLoss = 5
      currentStats.expenses += (penalty + medicineCost)
      currentStats.misdiagnosedToday += 1
      currentStats.accidentsToday += 1
      currentStats.medicineCostTotal += medicineCost
      currentStats.reputationChange -= repLoss
      if (damagedEquipId && !currentStats.equipmentDamaged.includes(damagedEquipId)) {
        currentStats.equipmentDamaged.push(damagedEquipId)
      }

      set({
        cases: updatedCases,
        equipment: updatedEquipment,
        player: {
          ...state.player,
          coins: Math.max(0, state.player.coins - totalDeduction),
          misdiagnosed: state.player.misdiagnosed + 1,
          reputation: Math.max(0, state.player.reputation - repLoss),
        },
        dailyStats: currentStats,
        gamePhase: 'accident',
        accidentType: disease.accidentType,
        diagnosisResult: result,
        showMedicineSelector: false,
        selectedMedicineId: null,
        pendingAction: null,
      })
    }
  },

  repairEquipment: (id: string) => {
    const state = get()
    const equip = state.equipment.find(e => e.id === id)
    if (!equip || equip.status === 'normal') return
    if (state.player.coins < equip.repairCost) return

    const newStats = {
      ...state.dailyStats,
      equipmentRepairedCost: state.dailyStats.equipmentRepairedCost + equip.repairCost,
      expenses: state.dailyStats.expenses + equip.repairCost,
    }

    set({
      equipment: state.equipment.map(e =>
        e.id === id ? { ...e, status: 'normal' as const } : e
      ),
      player: {
        ...state.player,
        coins: state.player.coins - equip.repairCost,
      },
      dailyStats: newStats,
    })
  },

  dismissResult: () => {
    const state = get()
    const dayConfig = getDayConfig(state.currentDay)
    const remainingCases = state.cases.filter(c => c.status !== 'cured' && c.status !== 'accident')
    const minCases = 4
    const targetCount = Math.ceil(minCases * (dayConfig?.caseGenerationRate || 1))
    while (remainingCases.length < targetCount) {
      remainingCases.push(generateWavePetCase(dayConfig?.diseaseWaveId || null))
    }

    set({
      activeCaseId: null,
      gamePhase: 'idle',
      diagnosisResult: null,
      cases: remainingCases,
    })
  },

  dismissAccident: () => {
    const state = get()
    const dayConfig = getDayConfig(state.currentDay)
    const remainingCases = state.cases.filter(c => c.status !== 'cured' && c.status !== 'accident')
    const minCases = 4
    const targetCount = Math.ceil(minCases * (dayConfig?.caseGenerationRate || 1))
    while (remainingCases.length < targetCount) {
      remainingCases.push(generateWavePetCase(dayConfig?.diseaseWaveId || null))
    }

    set({
      activeCaseId: null,
      gamePhase: 'idle',
      accidentType: null,
      diagnosisResult: null,
      cases: remainingCases,
    })
  },

  generateNewCase: () => {
    const state = get()
    const dayConfig = getDayConfig(state.currentDay)
    const newCase = generateWavePetCase(dayConfig?.diseaseWaveId || null)
    set({ cases: [...state.cases, newCase] })
  },

  loadTestCases: () => {
    set({
      cases: generateTestCases(),
      activeCaseId: null,
      gamePhase: 'idle',
      accidentType: null,
      diagnosisResult: null,
      showMedicineSelector: false,
      selectedMedicineId: null,
      pendingAction: null,
    })
  },

  resetGame: () => {
    set({
      cases: generateInitialCases(5),
      activeCaseId: null,
      player: { ...initialPlayer },
      equipment: initialEquipment.map(e => ({ ...e })),
      gamePhase: 'day_start',
      accidentType: null,
      diagnosisResult: null,
      actionCooldowns: {
        examine: 0,
        medicate: 0,
        inject: 0,
        feed: 0,
        isolate: 0,
      },
      showMedicineSelector: false,
      selectedMedicineId: null,
      pendingAction: null,
      currentDay: 1,
      shiftPhase: 'morning',
      shiftProgress: 0,
      dailyStats: createInitialDailyStats(1),
      currentEvent: null,
      effectiveRent: 80,
      effectiveCureTarget: 4,
      dayEndReport: null,
      gameEndSummary: null,
      daysPassedList: [],
      daysFailedList: [],
    })
  },

  startChallenge: () => {
    get().resetGame()
  },

  startDay: (day: number) => {
    const state = get()
    const dayConfig = getDayConfig(day)
    if (!dayConfig) return
    const event = getRandomDailyEvent()
    let rent = dayConfig.rent
    let cureTarget = dayConfig.cureTarget
    let coins = state.player.coins
    let reputation = state.player.reputation
    const extraCases: PetCase[] = []

    if (event.effect.coins) {
      coins = Math.max(0, coins + event.effect.coins)
    }
    if (event.effect.reputation) {
      reputation = Math.max(0, Math.min(100, reputation + event.effect.reputation))
    }
    if (event.effect.rentModifier) {
      rent = Math.floor(rent * event.effect.rentModifier)
    }
    if (event.effect.cureTargetModifier) {
      cureTarget = cureTarget + event.effect.cureTargetModifier
    }
    if (event.effect.immediateCases) {
      for (let i = 0; i < event.effect.immediateCases; i++) {
        extraCases.push(generateWavePetCase(dayConfig.diseaseWaveId))
      }
    }

    const wave = dayConfig.diseaseWaveId ? getDiseaseWave(dayConfig.diseaseWaveId) : null
    const waveBonusCases: PetCase[] = []
    if (wave) {
      for (let i = 0; i < wave.caseBonus; i++) {
        waveBonusCases.push(generateWavePetCase(dayConfig.diseaseWaveId))
      }
    }

    const initCount = 5
    const initCases: PetCase[] = []
    for (let i = 0; i < initCount; i++) {
      initCases.push(generateWavePetCase(dayConfig.diseaseWaveId))
    }

    set({
      currentDay: day,
      shiftPhase: 'morning',
      shiftProgress: 0,
      dailyStats: createInitialDailyStats(day),
      currentEvent: event,
      effectiveRent: rent,
      effectiveCureTarget: cureTarget,
      dayEndReport: null,
      gamePhase: 'day_start',
      player: {
        ...state.player,
        coins,
        reputation,
      },
      cases: [...initCases, ...extraCases, ...waveBonusCases],
      activeCaseId: null,
      accidentType: null,
      diagnosisResult: null,
      showMedicineSelector: false,
      selectedMedicineId: null,
      pendingAction: null,
    })
  },

  confirmDayStart: () => {
    set({
      gamePhase: 'idle',
      currentEvent: null,
    })
  },

  advanceShift: () => {
    const state = get()
    const nextProgress = state.shiftProgress + 1
    let nextPhase: ShiftPhase = state.shiftPhase

    if (nextProgress < SHIFT_STEPS) {
      nextPhase = 'morning'
    } else if (nextProgress < SHIFT_STEPS * 2) {
      nextPhase = 'afternoon'
    } else if (nextProgress < SHIFT_STEPS * 3) {
      nextPhase = 'evening'
    } else {
      nextPhase = 'closed'
    }

    if (nextPhase === 'closed') {
      get().triggerEndDay()
      return
    }

    const dayConfig = getDayConfig(state.currentDay)
    const casesToAdd = Math.ceil(1 * (dayConfig?.caseGenerationRate || 1))
    const newCases: PetCase[] = []
    for (let i = 0; i < casesToAdd; i++) {
      newCases.push(generateWavePetCase(dayConfig?.diseaseWaveId || null))
    }

    set({
      shiftProgress: nextProgress,
      shiftPhase: nextPhase,
      cases: [...state.cases, ...newCases],
    })
  },

  triggerEndDay: () => {
    const state = get()
    const dayConfig = getDayConfig(state.currentDay)
    if (!dayConfig) return

    let finalStats = { ...state.dailyStats }
    let player = { ...state.player }
    if (player.coins >= state.effectiveRent) {
      player.coins -= state.effectiveRent
      finalStats.rentPaid = true
      finalStats.expenses += state.effectiveRent
    } else {
      finalStats.rentPaid = false
    }

    const report = computeDayEndReport(
      state.currentDay,
      finalStats,
      state.effectiveRent,
      state.effectiveCureTarget,
      dayConfig.cureRateTarget,
      dayConfig.totalCasesTarget,
      state.equipment
    )

    const penaltySum = report.stats.penaltiesApplied.reduce((a, b) => a + b, 0)
    player.coins = Math.max(0, player.coins - penaltySum)

    const originalRepChange = state.dailyStats.reputationChange
    const finalRepChange = report.stats.reputationChange
    const repDelta = finalRepChange - originalRepChange
    if (repDelta !== 0) {
      player.reputation = Math.max(0, Math.min(100, player.reputation + repDelta))
    }

    const newDaysPassed = report.allTargetsMet ? [...state.daysPassedList, state.currentDay] : state.daysPassedList
    const newDaysFailed = !report.allTargetsMet ? [...state.daysFailedList, state.currentDay] : state.daysFailedList

    set({
      gamePhase: 'day_end',
      shiftPhase: 'closed',
      dailyStats: report.stats,
      dayEndReport: report,
      player,
      daysPassedList: newDaysPassed,
      daysFailedList: newDaysFailed,
    })
  },

  confirmDayEnd: () => {
    set({
      dayEndReport: null,
    })
  },

  proceedNextDayOrEnd: () => {
    const state = get()
    const nextDay = state.currentDay + 1
    if (nextDay > TOTAL_DAYS) {
      const totalAccidents = state.player.misdiagnosed
      const summary = computeGameEndSummary(
        state.player,
        state.daysPassedList,
        state.daysFailedList,
        totalAccidents
      )
      set({
        gameEndSummary: summary,
        gamePhase: 'game_end',
      })
    } else {
      get().startDay(nextDay)
    }
  },
}))
