import { NodeType } from './enums';

export interface Suggestion {
  name: string;
  type: NodeType.SUMMARIES | NodeType.RECOGNITIONS | NodeType.SYMPTOM;
  weight?: number;
  source?: string;
  uuid?: string;
}

export interface Wniosek {
  type: NodeType.SUMMARIES;
  name: string;
  english?: string;
  español?: string;
  element_id_property: string | null;
  weight?: number;
  source?: string;
}

export interface Rozpoznanie {
  type: NodeType.RECOGNITIONS;
  name: string;
  weight?: number;
  element_id_property?: string;
  source?: string;
}

export interface Objaw {
  type: NodeType.SYMPTOM;
  name: string;
  weight?: number;
}

export interface DaneZPomiaru {
  type: NodeType.MEASUREMENTS_DATA;
  name: string;
  element_id_property: string;
  debug?: string;
  sugeruje_wnioski?: Wniosek[];
  sugeruje_rozpoznanie?: Rozpoznanie[];
  sugeruje_objaw?: Objaw[];
  children_cecha?: CechaNode[];
}

export interface Skierowanie {
  sugeruje_wnioski?: (Wniosek & { source?: string })[];
  sugeruje_rozpoznanie?: (Rozpoznanie & { source?: string })[];
}

export interface CechaNode {
  type: NodeType.CHARACTERISTIC;
  name: string;
  element_id_property?: string;
  children_cecha?: CechaNode[];
  children_dane_z_pomiaru?: DaneZPomiaru[];
  children_sugeruje_cecha?: CechaNode[];
  suggested_rozpoznanie?: Rozpoznanie[];
  sugeruje_wnioski?: Wniosek[];
  sugeruje_rozpoznanie?: Rozpoznanie[];
  sugeruje_objaw?: Objaw[];
  skierowanie?: Skierowanie;
}
