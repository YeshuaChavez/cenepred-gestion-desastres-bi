export interface ShapItem {
  name: string;
  val: string;
  pct: number;
  color: string;
}

export interface RegionData {
  name: string;
  prob: number;
  tag: string;
  tagColor: string;
  needleDeg: number;
  shap: ShapItem[];
}

export interface MefDepartment {
  depto: string;
  pim: string;
  ejec: string;
  pct: number;
  riesgo: string;
  estado: string;
  alertMsg: string;
}

export interface PliegoEjecutor {
  nombre: string;
  monto: string;
  pct: number;
  color: string;
  isAlert?: boolean;
}

export type ActivePath = 
  | 'home' 
  | 'monitoreo-diario' 
  | 'historico-tendencias' 
  | 'riesgo-predictivo' 
  | 'comparativo-regional' 
  | 'presupuesto-mef';

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}
