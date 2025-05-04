export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
}

export interface Subsection {
  id: string;
  title: string;
  items: ChecklistItem[];
  photos: PhotoItem[];
  subsections?: Subsection[];
}

export interface Section {
  id: string;
  title: string;
  items: ChecklistItem[];
  subsections: Subsection[];
  photos: PhotoItem[];
}

export interface Inspection {
  id: string;
  title: string;
  date: string;
  property: string;
  sections: Section[];
  completed: boolean;
  lastUpdate?: number; // Timestamp para forzar actualizaciones
}