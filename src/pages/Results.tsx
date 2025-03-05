
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { useSurveyStore } from '@/lib/store';
import { toast } from 'sonner';

const Results = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { surveys, getResponsesForSurvey } = useSurveyStore();
  
  const [survey, setSurvey] = useState(surveys.find(s => s.id === id));
  const [responses, setResponses] = useState(id ? getResponsesForSurvey(id) : []);

  useEffect(() => {
    if (!survey) {
      navigate('/');
      toast.error('Survey not found');
    }
  }, [survey, navigate]);

  if (!survey) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-24 px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{survey.title}</h1>
              <p className="text-muted-foreground">{survey.description}</p>
            </div>
            
            <div className="bg-card rounded-full px-4 py-2 border shadow-sm">
              <span className="text-lg font-medium">{responses.length}</span>
              <span className="text-muted-foreground ml-1">responses</span>
            </div>
          </div>
          
          {responses.length === 0 ? (
            <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
              <h2 className="text-xl font-medium mb-2">No responses yet</h2>
              <p className="text-muted-foreground mb-6">
                Share your survey with others to start collecting responses.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {survey.questions.map((question) => {
                const questionResponses = responses.map(
                  response => response.answers.find(a => a.questionId === question.id)
                ).filter(Boolean);
                
                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-card rounded-lg border shadow-sm p-6"
                  >
                    <h2 className="text-xl font-medium mb-6">{question.text}</h2>
                    
                    {question.type === 'text' ? (
                      <div className="space-y-4">
                        {questionResponses.map((response, i) => (
                          <div key={i} className="p-4 bg-background rounded-md border">
                            <p className="text-sm">
                              {(response?.value as string) || <em className="text-muted-foreground">No response</em>}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : question.type === 'multipleChoice' || question.type === 'checkbox' ? (
                      <div className="space-y-4">
                        {question.choices?.map(choice => {
                          const count = questionResponses.filter(r => {
                            const value = r?.value;
                            return Array.isArray(value) 
                              ? value.includes(choice.id)
                              : value === choice.id;
                          }).length;
                          
                          const percentage = Math.round((count / responses.length) * 100);
                          
                          return (
                            <div key={choice.id} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span>{choice.text}</span>
                                <span className="text-sm text-muted-foreground">
                                  {count} ({percentage}%)
                                </span>
                              </div>
                              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.8, delay: 0.2 }}
                                  className="h-full bg-primary rounded-full"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : question.type === 'rating' ? (
                      <div className="space-y-6">
                        <div className="flex justify-between items-center">
                          {Array.from({ length: question.maxRating || 5 }).map((_, i) => {
                            const ratingCount = questionResponses.filter(r => r?.value === i + 1).length;
                            const percentage = Math.round((ratingCount / responses.length) * 100);
                            
                            return (
                              <div key={i} className="text-center">
                                <div className="mb-2 text-lg font-medium">{i + 1}</div>
                                <div className="h-24 w-8 bg-secondary rounded-full overflow-hidden flex flex-col-reverse">
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${percentage}%` }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="w-full bg-primary rounded-t-full"
                                  />
                                </div>
                                <div className="mt-2 text-sm text-muted-foreground">{ratingCount}</div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Not satisfied</span>
                          <span>Very satisfied</span>
                        </div>
                        
                        {(() => {
                          const averageRating = questionResponses.reduce(
                            (sum, r) => sum + (r?.value as number || 0), 
                            0
                          ) / responses.length;
                          
                          return (
                            <div className="pt-4 border-t">
                              <div className="text-center">
                                <div className="text-sm text-muted-foreground mb-1">Average Rating</div>
                                <div className="text-2xl font-semibold">{averageRating.toFixed(1)}</div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Results;
