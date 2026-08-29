export interface PlanningSummary {
  forecastHorizonMonths: number;
  forecastDemand: number;
  recommendedProduction: number;
  potentialShortage: number;
  capacityConstrainedMonths: number;
  currentInventory: number;
  safetyStock: number;
  monthlyCapacity: number;
  planFeasible: boolean;
  demandCovered: boolean;
  inventoryProtected: boolean;
  capacitySufficient: boolean;
  primaryRecommendation: string;
  supportingExplanation: string;
  lastUpdated: string;
}

export interface MonthlyPlanItem {
  month: string;
  monthIndex: number;
  demand: number;
  openingInventory: number;
  requiredProduction: number;
  recommendedProduction: number;
  endingInventory: number;
  safetyStock: number;
  shortage: number;
  capacity: number;
  capacityUtilization: number;
  status: 'safe' | 'constrained' | 'shortage';
}

export interface HistoricalDemandPoint {
  period: string;
  month: string;
  demand: number;
  isForecast: boolean;
  upperBound?: number;
  lowerBound?: number;
  movingAverage?: number;
}

export interface ModelEvaluation {
  id: string;
  name: string;
  category: 'statistical' | 'machine_learning' | 'quantum';
  algorithmType: string;
  mae: number;
  rmse: number;
  mape?: number;
  isSelected: boolean;
  rationale: string;
  trainingObservations: number;
  testingObservations: number;
  characteristics: string;
  mathFormula?: string;
  hyperparameters?: Record<string, string | number>;
  quantumMetrics?: {
    qubits: number;
    circuitDepth: number;
    hamiltonianType: string;
    energyGroundState: number;
    convergenceIterations: number;
    speedupFactor: string;
  };
  forecastData?: number[];
}

export interface ScenarioParams {
  demandChangePct: number; // e.g. -20 to +30
  capacityChangePct: number; // e.g. -30 to +30
  currentInventory: number; // in units
  safetyStockTarget: number;
}

export interface ScenarioResult {
  params: ScenarioParams;
  totalDemand: number;
  recommendedProduction: number;
  totalCapacity: number;
  minEndingInventory: number;
  shortageUnits: number;
  isFeasible: boolean;
  capacityConstrained: boolean;
  inventoryRisk: boolean;
  constrainedMonths: string[];
  shortageMonths: string[];
  statusLabel: 'Feasible' | 'Capacity Constrained' | 'Inventory Risk' | 'Critical Shortage';
  businessSummary: string;
  monthlyPlan: MonthlyPlanItem[];
}

export interface AgentCannedQuestion {
  id: string;
  question: string;
  category: 'rationale' | 'scenario' | 'risk' | 'model' | 'inventory';
  shortPrompt: string;
  response: string;
  takeaway: string;
  keyStats?: { label: string; value: string; status?: 'normal' | 'positive' | 'warning' }[];
}

export interface AgentChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  category?: string;
  keyStats?: { label: string; value: string; status?: 'normal' | 'positive' | 'warning' }[];
  takeaway?: string;
  reasoningSteps?: string[];
  isThinking?: boolean;
}

export type ActiveTab = 'overview' | 'forecast' | 'inventory' | 'production' | 'scenarios' | 'agent';
