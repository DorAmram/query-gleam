
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
  votes?: number; // Track votes for this answer
}

export interface Response {
  id: string;
  surveyId: string;
  answers: Answer[];
  createdAt: number;
}

// Google API type declarations
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: {
          apiKey: string;
          clientId: string;
          discoveryDocs: string[];
          scope: string;
        }) => Promise<void>;
      };
      auth2: {
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean;
          };
          signIn: () => Promise<void>;
          currentUser: {
            get: () => {
              getAuthResponse: () => {
                access_token: string;
              };
            };
          };
        };
      };
    };
  }
}
