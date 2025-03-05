
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Survey, Response, Answer } from '@/types';

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
  voteForAnswer: (responseId: string, answerId: string) => void;
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
        surveys: state.surveys.filter((survey) => survey.id !== id),
        responses: state.responses.filter((response) => response.surveyId !== id),
        currentSurvey: state.currentSurvey?.id === id ? null : state.currentSurvey
      })),
      setSurvey: (survey) => set(() => ({ currentSurvey: survey })),
      addResponse: (response) => set((state) => ({
        responses: [...state.responses, response]
      })),
      getResponsesForSurvey: (surveyId) => {
        return get().responses.filter((response) => response.surveyId === surveyId);
      },
      voteForAnswer: (responseId, questionId) => set((state) => {
        return {
          responses: state.responses.map(response => {
            if (response.id === responseId) {
              return {
                ...response,
                answers: response.answers.map(answer => {
                  if (answer.questionId === questionId) {
                    return {
                      ...answer,
                      votes: (answer.votes || 0) + 1
                    };
                  }
                  return answer;
                })
              };
            }
            return response;
          })
        };
      })
    }),
    {
      name: 'survey-storage',
    }
  )
);
