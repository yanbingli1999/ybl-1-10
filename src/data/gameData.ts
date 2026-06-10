export interface Breed {
  id: string
  name: string
  emoji: string
  color: string
  shape: string
}

export interface Disease {
  id: string
  name: string
  description: string
  correctAction: ActionType
  medicineId: string | null
  accidentType: AccidentType
}

export interface Medicine {
  id: string
  name: string
  effect: string
  color: string
  cost: number
}

export interface Symptom {
  id: string
  name: string
  description: string
  vitals: string
}

export interface Equipment {
  id: string
  name: string
  status: 'normal' | 'damaged' | 'repairing'
  repairCost: number
  requiredAction: ActionType
}

export interface PetCase {
  id: string
  petName: string
  breedId: string
  diseaseId: string
  symptomIds: string[]
  urgency: 'low' | 'medium' | 'high'
  status: 'waiting' | 'diagnosing' | 'treating' | 'cured' | 'accident'
  examined: boolean
}

export interface Player {
  coins: number
  level: number
  exp: number
  cured: number
  misdiagnosed: number
  totalIncome: number
  reputation: number
}

export type ActionType = 'examine' | 'medicate' | 'inject' | 'feed' | 'isolate'
export type AccidentType = 'split' | 'float' | 'bite'
export type GamePhase = 'idle' | 'diagnosing' | 'treating' | 'accident' | 'result' | 'day_start' | 'day_end' | 'game_end'
export type ShiftPhase = 'morning' | 'afternoon' | 'evening' | 'closed'

export interface DiagnosisResult {
  success: boolean
  diseaseName: string
  actionTaken: ActionType
  correctAction: ActionType
  medicineUsed: string | null
  correctMedicine: string | null
  coinsEarned: number
  medicineCost: number
  accidentType: AccidentType | null
  damagedEquipment: string | null
  message: string
  errorType: 'action' | 'medicine' | 'funds' | null
}

export interface DayConfig {
  day: number
  name: string
  rent: number
  cureTarget: number
  cureRateTarget: number
  totalCasesTarget: number
  caseGenerationRate: number
  description: string
  diseaseWaveId: string | null
}

export interface DiseaseWave {
  id: string
  name: string
  description: string
  boostedDiseaseIds: string[]
  urgencyBoost: 'low' | 'medium' | 'high' | null
  caseBonus: number
}

export interface DailyEvent {
  id: string
  title: string
  description: string
  icon: string
  type: 'positive' | 'negative' | 'neutral'
  effect: {
    coins?: number
    reputation?: number
    rentModifier?: number
    cureTargetModifier?: number
    immediateCases?: number
  }
}

export interface DailyStats {
  day: number
  income: number
  expenses: number
  rentPaid: boolean
  curedToday: number
  misdiagnosedToday: number
  accidentsToday: number
  equipmentDamaged: string[]
  equipmentRepairedCost: number
  medicineCostTotal: number
  casesSeen: number
  reputationChange: number
  penaltiesApplied: number[]
}

export interface DayEndReport {
  day: number
  stats: DailyStats
  rent: number
  cureTarget: number
  cureRateTarget: number
  totalCasesTarget: number
  cureRate: number
  rentPaid: boolean
  cureTargetMet: boolean
  cureRateTargetMet: boolean
  allTargetsMet: boolean
  penalties: string[]
  netProfit: number
  equipmentStatus: { id: string; name: string; status: Equipment['status'] }[]
}

export interface GameEndSummary {
  totalCoins: number
  totalCured: number
  totalMisdiagnosed: number
  totalAccidents: number
  finalReputation: number
  daysCompleted: number
  daysPassed: number[]
  daysFailed: number[]
  overallRating: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'
  finalMessage: string
}

export const breeds: Breed[] = [
  { id: 'slime', name: '黏液球', emoji: '🟢', color: '#00ff88', shape: 'blob' },
  { id: 'tentacle', name: '触手怪', emoji: '🟣', color: '#7b61ff', shape: 'tentacles' },
  { id: 'crystal', name: '晶晶体', emoji: '🔷', color: '#00d4ff', shape: 'prism' },
  { id: 'bubble', name: '气泡兽', emoji: '🟠', color: '#ff8855', shape: 'bubbles' },
  { id: 'shadow', name: '影子虫', emoji: '⚫', color: '#888899', shape: 'shadow' },
  { id: 'flame', name: '火焰崽', emoji: '🔴', color: '#ff4422', shape: 'flame' },
]

export const diseases: Disease[] = [
  { id: 'split_pox', name: '分裂痘', description: '宠物身上出现分裂斑点', correctAction: 'inject', medicineId: 'stabilizer', accidentType: 'split' },
  { id: 'float_fever', name: '飘浮热', description: '宠物不受控制向上飘浮', correctAction: 'medicate', medicineId: 'gravity_pill', accidentType: 'float' },
  { id: 'chomp_bite', name: '噬咬狂', description: '宠物疯狂咬周围一切', correctAction: 'isolate', medicineId: null, accidentType: 'bite' },
  { id: 'hunger_storm', name: '饥饿风暴', description: '宠物极度饥饿产生能量风暴', correctAction: 'feed', medicineId: 'cosmic_kibble', accidentType: 'float' },
  { id: 'crystal_cough', name: '晶体咳', description: '咳出小晶体碎片', correctAction: 'medicate', medicineId: 'soft_syrup', accidentType: 'split' },
  { id: 'shadow_rust', name: '暗影锈', description: '身体逐渐腐蚀生锈', correctAction: 'inject', medicineId: 'shine_serum', accidentType: 'bite' },
]

export const medicines: Medicine[] = [
  { id: 'stabilizer', name: '稳定剂', effect: '阻止分裂', color: '#00ff88', cost: 30 },
  { id: 'gravity_pill', name: '重力丸', effect: '恢复引力', color: '#7b61ff', cost: 25 },
  { id: 'cosmic_kibble', name: '宇宙粮', effect: '满足饥饿', color: '#ff8855', cost: 15 },
  { id: 'soft_syrup', name: '软化糖浆', effect: '溶解晶体', color: '#00d4ff', cost: 35 },
  { id: 'shine_serum', name: '闪光血清', effect: '驱散暗影', color: '#ffdd00', cost: 40 },
]

export const symptoms: Symptom[] = [
  { id: 'spotted_skin', name: '斑点皮肤', description: '皮肤上出现闪烁的分裂斑点', vitals: '细胞分裂速率: 900%' },
  { id: 'rising_body', name: '身体上升', description: '宠物不受控制地向上飘浮', vitals: '重力系数: -2.3' },
  { id: 'gnashing', name: '磨牙撕咬', description: '疯狂咬任何靠近的东西', vitals: '咬合力: 5000N' },
  { id: 'empty_stomach', name: '胃部空虚', description: '能量场剧烈波动', vitals: '饥饿指数: 99.7%' },
  { id: 'crystal_sputum', name: '晶体痰', description: '咳出小型晶体碎片', vitals: '硬度: 莫氏8.5' },
  { id: 'rust_patches', name: '锈斑', description: '身体表面出现腐蚀锈斑', vitals: '腐蚀速率: 3mm/h' },
]

export const initialEquipment: Equipment[] = [
  { id: 'scanner', name: '扫描仪', status: 'normal', repairCost: 50, requiredAction: 'examine' },
  { id: 'injector', name: '注射器', status: 'normal', repairCost: 60, requiredAction: 'inject' },
  { id: 'dispenser', name: '药品发放器', status: 'normal', repairCost: 45, requiredAction: 'medicate' },
  { id: 'feeder', name: '喂食器', status: 'normal', repairCost: 30, requiredAction: 'feed' },
  { id: 'isolation_unit', name: '隔离舱', status: 'normal', repairCost: 80, requiredAction: 'isolate' },
]

const diseaseSymptomMap: Record<string, string[]> = {
  split_pox: ['spotted_skin'],
  float_fever: ['rising_body'],
  chomp_bite: ['gnashing'],
  hunger_storm: ['empty_stomach'],
  crystal_cough: ['crystal_sputum'],
  shadow_rust: ['rust_patches'],
}

const petNames: string[] = [
  '咕噜', '哔哔', '噗噗', '嘶嘶', '嗡嗡', '咔咔',
  '哧哧', '咻咻', '嗒嗒', '嘟嘟', '啵啵', '嗷嗷',
  '呱呱', '喵喵', '汪汪', '吱吱', '嘎嘎', '喵呜',
  '波波', '闪闪', '星星', '球球', '泡泡', '萌萌',
]

export function getSymptomsForDisease(diseaseId: string): string[] {
  return diseaseSymptomMap[diseaseId] || []
}

export function getBreed(id: string): Breed | undefined {
  return breeds.find(b => b.id === id)
}

export function getDisease(id: string): Disease | undefined {
  return diseases.find(d => d.id === id)
}

export function getSymptom(id: string): Symptom | undefined {
  return symptoms.find(s => s.id === id)
}

export function getMedicine(id: string): Medicine | undefined {
  return medicines.find(m => m.id === id)
}

let caseCounter = 0

export function generatePetCase(): PetCase {
  caseCounter++
  const disease = diseases[Math.floor(Math.random() * diseases.length)]
  const breed = breeds[Math.floor(Math.random() * breeds.length)]
  const name = petNames[Math.floor(Math.random() * petNames.length)]
  const urgencyLevels: PetCase['urgency'][] = ['low', 'medium', 'high']
  const urgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)]
  const symptomIds = getSymptomsForDisease(disease.id)
  const extraSymptoms = symptoms
    .filter(s => !symptomIds.includes(s.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2))
    .map(s => s.id)

  return {
    id: `case_${Date.now()}_${caseCounter}`,
    petName: name,
    breedId: breed.id,
    diseaseId: disease.id,
    symptomIds: [...symptomIds, ...extraSymptoms],
    urgency,
    status: 'waiting',
    examined: false,
  }
}

export function generateInitialCases(count: number): PetCase[] {
  return Array.from({ length: count }, () => generatePetCase())
}

export function generateTestCases(): PetCase[] {
  caseCounter += 4
  return [
    {
      id: `test_hunger_${Date.now()}_${caseCounter - 3}`,
      petName: '饿饿',
      breedId: 'slime',
      diseaseId: 'hunger_storm',
      symptomIds: ['empty_stomach'],
      urgency: 'medium',
      status: 'waiting',
      examined: false,
    },
    {
      id: `test_float_${Date.now()}_${caseCounter - 2}`,
      petName: '飘飘',
      breedId: 'flame',
      diseaseId: 'float_fever',
      symptomIds: ['rising_body'],
      urgency: 'medium',
      status: 'waiting',
      examined: false,
    },
    {
      id: `test_shadow_${Date.now()}_${caseCounter - 1}`,
      petName: '锈锈',
      breedId: 'shadow',
      diseaseId: 'shadow_rust',
      symptomIds: ['rust_patches'],
      urgency: 'medium',
      status: 'waiting',
      examined: false,
    },
    {
      id: `test_chomp_${Date.now()}_${caseCounter}`,
      petName: '咬咬',
      breedId: 'tentacle',
      diseaseId: 'chomp_bite',
      symptomIds: ['gnashing'],
      urgency: 'medium',
      status: 'waiting',
      examined: false,
    },
  ]
}

export const dayConfigs: DayConfig[] = [
  {
    day: 1,
    name: '开业日',
    rent: 80,
    cureTarget: 4,
    cureRateTarget: 0.6,
    totalCasesTarget: 7,
    caseGenerationRate: 1,
    description: '诊所第一天开业，任务轻松，熟悉流程为主。',
    diseaseWaveId: null,
  },
  {
    day: 2,
    name: '分裂痘潮',
    rent: 120,
    cureTarget: 6,
    cureRateTarget: 0.65,
    totalCasesTarget: 10,
    caseGenerationRate: 1.3,
    description: '分裂痘在星际社区爆发，紧急病例激增！',
    diseaseWaveId: 'split_wave',
  },
  {
    day: 3,
    name: '混合瘟疫',
    rent: 180,
    cureTarget: 8,
    cureRateTarget: 0.7,
    totalCasesTarget: 13,
    caseGenerationRate: 1.5,
    description: '多种疾病同时爆发，设备压力巨大，终极挑战！',
    diseaseWaveId: 'mixed_wave',
  },
]

export const diseaseWaves: DiseaseWave[] = [
  {
    id: 'split_wave',
    name: '分裂痘大流行',
    description: '黏液球社区爆发分裂痘疫情，病例数翻倍！',
    boostedDiseaseIds: ['split_pox', 'crystal_cough'],
    urgencyBoost: 'high',
    caseBonus: 2,
  },
  {
    id: 'mixed_wave',
    name: '多源混合瘟疫',
    description: '所有疾病同时出现，设备损坏率上升！',
    boostedDiseaseIds: ['split_pox', 'float_fever', 'chomp_bite', 'shadow_rust'],
    urgencyBoost: 'medium',
    caseBonus: 3,
  },
]

export const dailyEvents: DailyEvent[] = [
  {
    id: 'grant',
    title: '星际医疗补助',
    description: '星际卫生组织授予你创业补助金！',
    icon: '💰',
    type: 'positive',
    effect: { coins: 50 },
  },
  {
    id: 'review',
    title: '正面评价',
    description: '一位治愈的宠物主人在星际点评上留下五星好评！',
    icon: '⭐',
    type: 'positive',
    effect: { reputation: 10 },
  },
  {
    id: 'donation',
    title: '匿名捐赠',
    description: '一位好心人偷偷留下一笔星币捐款！',
    icon: '🎁',
    type: 'positive',
    effect: { coins: 30 },
  },
  {
    id: 'inspection',
    title: '卫生检查',
    description: '星际卫生部上门检查，额外收取审查费用...',
    icon: '📋',
    type: 'negative',
    effect: { coins: -40 },
  },
  {
    id: 'complaint',
    title: '投诉风波',
    description: '有人投诉等待时间过长，声誉受损！',
    icon: '📢',
    type: 'negative',
    effect: { reputation: -8 },
  },
  {
    id: 'power_surge',
    title: '电力波动',
    description: '空间站电力波动，设备受损风险上升。',
    icon: '⚡',
    type: 'neutral',
    effect: {},
  },
  {
    id: 'rush_hour',
    title: '高峰时段',
    description: '突然涌入一大批急诊病例！',
    icon: '🚑',
    type: 'neutral',
    effect: { immediateCases: 3 },
  },
  {
    id: 'rent_discount',
    title: '房东优惠',
    description: '房东今日心情好，租金打八折！',
    icon: '🏠',
    type: 'positive',
    effect: { rentModifier: 0.8 },
  },
  {
    id: 'target_change',
    title: '医疗官视察',
    description: '星际医疗官今日视察，治愈目标提高！',
    icon: '🎯',
    type: 'negative',
    effect: { cureTargetModifier: 2 },
  },
  {
    id: 'vip',
    title: 'VIP客户',
    description: '一位VIP客户光顾，声誉与星币双丰收！',
    icon: '👑',
    type: 'positive',
    effect: { coins: 60, reputation: 5 },
  },
]

export function getDayConfig(day: number): DayConfig | undefined {
  return dayConfigs.find(d => d.day === day)
}

export function getDiseaseWave(id: string): DiseaseWave | undefined {
  return diseaseWaves.find(w => w.id === id)
}

export function getRandomDailyEvent(): DailyEvent {
  return dailyEvents[Math.floor(Math.random() * dailyEvents.length)]
}

export function generateWavePetCase(waveId: string | null): PetCase {
  if (!waveId) return generatePetCase()
  const wave = getDiseaseWave(waveId)
  if (!wave) return generatePetCase()
  caseCounter++
  const diseasePool = diseases.filter(d => wave.boostedDiseaseIds.includes(d.id))
  const disease = diseasePool.length > 0 && Math.random() < 0.7
    ? diseasePool[Math.floor(Math.random() * diseasePool.length)]
    : diseases[Math.floor(Math.random() * diseases.length)]
  const breed = breeds[Math.floor(Math.random() * breeds.length)]
  const name = petNames[Math.floor(Math.random() * petNames.length)]
  let urgency: PetCase['urgency']
  if (wave.urgencyBoost === 'high') {
    urgency = Math.random() < 0.6 ? 'high' : Math.random() < 0.5 ? 'medium' : 'low'
  } else if (wave.urgencyBoost === 'medium') {
    urgency = Math.random() < 0.4 ? 'medium' : Math.random() < 0.5 ? 'high' : 'low'
  } else {
    const urgencyLevels: PetCase['urgency'][] = ['low', 'medium', 'high']
    urgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)]
  }
  const symptomIds = getSymptomsForDisease(disease.id)
  const extraSymptoms = symptoms
    .filter(s => !symptomIds.includes(s.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 2))
    .map(s => s.id)
  return {
    id: `case_${Date.now()}_${caseCounter}`,
    petName: name,
    breedId: breed.id,
    diseaseId: disease.id,
    symptomIds: [...symptomIds, ...extraSymptoms],
    urgency,
    status: 'waiting',
    examined: false,
  }
}

export function createInitialDailyStats(day: number): DailyStats {
  return {
    day,
    income: 0,
    expenses: 0,
    rentPaid: false,
    curedToday: 0,
    misdiagnosedToday: 0,
    accidentsToday: 0,
    equipmentDamaged: [],
    equipmentRepairedCost: 0,
    medicineCostTotal: 0,
    casesSeen: 0,
    reputationChange: 0,
    penaltiesApplied: [],
  }
}
