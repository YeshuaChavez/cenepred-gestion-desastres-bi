// Inferencia del modelo XGBoost REAL en el navegador. Evalúa el ensamble de árboles exportado
// desde el modelo entrenado (data/ml/models -> public/model/xgb_model.json). Reproduce
// exactamente la salida de xgboost (binary:logistic): prob = sigmoid(base_margin + Σ hojas).

interface TreeNode {
  leaf?: number;
  split?: string;
  split_condition?: number;
  yes?: number;
  no?: number;
  missing?: number;
  nodeid?: number;
  children?: TreeNode[];
}

export interface XgbModel {
  objective: string;
  base_margin: number;
  features: string[];
  metrics: { f1: number; precision: number; recall: number; auc_roc: number };
  trees: TreeNode[];
}

export type FeatureVector = Record<string, number | null>;

let cached: XgbModel | null = null;
let loading: Promise<XgbModel> | null = null;

export async function loadModel(): Promise<XgbModel> {
  if (cached) return cached;
  if (!loading) {
    loading = fetch('/model/xgb_model.json')
      .then((r) => {
        if (!r.ok) throw new Error('No se pudo cargar el modelo');
        return r.json();
      })
      .then((m: XgbModel) => { cached = m; return m; });
  }
  return loading;
}

function evalTree(root: TreeNode, fv: FeatureVector): number {
  let node = root;
  while (node.leaf === undefined) {
    const v = node.split !== undefined ? fv[node.split] : undefined;
    const go = v === null || v === undefined
      ? node.missing
      : (v < (node.split_condition as number) ? node.yes : node.no);
    node = (node.children as TreeNode[]).find((c) => c.nodeid === go) as TreeNode;
  }
  return node.leaf as number;
}

export function predictProba(model: XgbModel, fv: FeatureVector): number {
  let margin = model.base_margin;
  for (const t of model.trees) margin += evalTree(t, fv);
  return 1 / (1 + Math.exp(-margin));
}
