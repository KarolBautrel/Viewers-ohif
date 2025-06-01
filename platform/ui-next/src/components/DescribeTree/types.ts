export interface Suggestion {
    name: string;
    category: 'wnioski' | 'rozpoznanie' | 'objaw';
    weight?: number;
    source?: string;
  }
  
  export interface Wniosek {
    type: 'wnioski';
    name: string;
    english?: string;
    español?: string;
    element_id_property: string | null;
    weight?: number;
    source?: string;
  }
  
  export interface Rozpoznanie {
    type: 'rozpoznanie';
    name: string;
    weight?: number;
    element_id_property?: string;
    source?: string;
  }
  
  export interface Objaw {
    type: 'objaw';
    name: string;
    weight?: number;
  }
  
  export interface DaneZPomiaru {
    type: 'dane_z_pomiaru';
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
    type: string; // "objaw_radiologiczny" | "cecha" etc.
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
  