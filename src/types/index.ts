
export type QuestionType = 'text' | 'multipleChoice' | 'checkbox' | 'rating';

export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  choices?: Choice[];
  maxRating?: number;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: number;
  updatedAt: number;
}

export interface Answer {
  questionId: string;
  value: string | string[] | number;
}

export interface Response {
  id: string;
  surveyId: string;
  answers: Answer[];
  createdAt: number;
}
