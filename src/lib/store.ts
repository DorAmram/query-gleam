
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Survey, Response } from '@/types';

interface SurveyState {
  surveys: Survey[];
  responses: Response[];
  currentSurvey: Survey | null;
  addSurvey: (survey: Survey) => void;
  updateSurvey: (id: string, survey: Partial<Survey>) => void;
  deleteSurvey: (id: string) => void;
  setSurvey: (survey: Survey | null) => void;
  addResponse: (response: Response) => void;
  getResponsesForSurvey: (surveyId: string) => Response[];
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set, get) => ({
      surveys: [],
      responses: [],
      currentSurvey: null,
      addSurvey: (survey) => set((state) => ({ 
        surveys: [...state.surveys, survey] 
      })),
      updateSurvey: (id, updatedSurvey) => set((state) => ({
        surveys: state.surveys.map((survey) => 
          survey.id === id 
            ? { ...survey, ...updatedSurvey, updatedAt: Date.now() } 
            : survey
        )
      })),
      deleteSurvey: (id) => set((state) => ({
        surveys: state.surveys.filter((survey) => survey.id !== id)
      })),
      setSurvey: (survey) => set(() => ({ currentSurvey: survey })),
      addResponse: (response) => set((state) => ({
        responses: [...state.responses, response]
      })),
      getResponsesForSurvey: (surveyId) => {
        return get().responses.filter((response) => response.surveyId === surveyId);
      }
    }),
    {
      name: 'survey-storage',
    }
  )
);
