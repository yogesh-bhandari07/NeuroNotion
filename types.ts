export interface MindMapNodeRaw {
  id: string;
  type: 'input' | 'default' | 'output';
  label: string;
}

export interface MindMapEdgeRaw {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

export interface CaseStudy {
  title: string;
  executive_summary: string;
  problem_statement: string;
  methodology_solution: string;
  key_findings: string[];
  conclusion: string;
}

export interface StudyMaterial {
  video_overview: string;
  summary_markdown: string;
  mind_map: {
    nodes: MindMapNodeRaw[];
    edges: MindMapEdgeRaw[];
  };
  quiz: QuizQuestion[];
  case_study: CaseStudy;
  infographic_description: string;
  infographic_image_url?: string;
  generated_video_url?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type TabView = 'overview' | 'summary' | 'mindmap' | 'quiz' | 'infographic' | 'casestudy';

// Extend AIStudio interface which is used by the existing window.aistudio declaration
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}