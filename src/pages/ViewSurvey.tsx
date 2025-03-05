
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { useSurveyStore } from '@/lib/store';
import { Survey, Question, Response } from '@/types';
import { Button } from '@/components/ui/button';
import SurveyCompletionMessage from '@/components/SurveyCompletionMessage';
import { toast } from 'sonner';

const ViewSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { surveys, addResponse } = useSurveyStore();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [submitted, setSubmitted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    const adminPassword = localStorage.getItem('adminPassword');
    setIsAdmin(adminPassword === 'fogiking');
    
    if (!id) {
      console.error('No survey ID provided in URL');
      setError('No survey ID provided');
      setLoading(false);
      return;
    }
    
    console.log('Looking for survey with ID:', id);
    
    const foundSurvey = surveys.find((s) => s.id === id);
    if (foundSurvey) {
      console.log('Found survey:', foundSurvey);
      setSurvey(foundSurvey);
      setLoading(false);
    } else {
      console.error('Survey not found with ID:', id);
      setError('Survey not found');
      setLoading(false);
    }
  }, [id, surveys]);

  // If survey not found, show error
  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <main className="pt-10 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Survey Not Found</h1>
            <p className="mb-6">The survey you're looking for doesn't exist or might have been deleted.</p>
            <Link to="/" className="text-primary hover:text-primary/90 underline">
              Return to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!survey) return;
    
    // Validate required fields
    const missingRequired = survey.questions
      .filter((q) => q.required)
      .some((q) => !answers[q.id] || answers[q.id].trim() === '');
    
    if (missingRequired) {
      toast.error('Please answer all required questions');
      return;
    }
    
    // Create response object
    const response: Response = {
      id: crypto.randomUUID(),
      surveyId: survey.id,
      answers: Object.keys(answers).map((questionId) => ({
        questionId,
        value: answers[questionId],
      })),
      createdAt: Date.now(),
    };
    
    // Add response to store
    addResponse(response);
    setSubmitted(true);
    
    toast.success('Survey submitted successfully!');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!survey) {
    return <div className="flex justify-center items-center min-h-screen">Survey not found</div>;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {isAdmin && <Header />}
        <main className="pt-10 px-6">
          <div className="max-w-3xl mx-auto">
            <SurveyCompletionMessage surveyId={survey.id} surveyTitle={survey.title} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {isAdmin && <Header />}
      <main className="pt-10 px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold">{survey.title}</h1>
              {survey.description && (
                <div 
                  className="mt-2 text-muted-foreground whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: survey.description.replace(/\n/g, '<br/>') }}
                />
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {survey.questions.map((question: Question, index: number) => (
                <div key={question.id} className="space-y-2">
                  <label className="block font-medium">
                    {index + 1}. {question.text}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {question.type === 'text' && (
                    <input
                      type="text"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="w-full bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="Your answer"
                    />
                  )}
                  
                  {question.type === 'textarea' && (
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="w-full bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                      placeholder="Your answer"
                      rows={4}
                    />
                  )}
                  
                  {question.type === 'radio' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label key={option} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={() => handleInputChange(question.id, option)}
                            className="rounded-full"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {question.type === 'checkbox' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option) => {
                        const currentAnswers = answers[question.id] ? answers[question.id].split(',') : [];
                        const isChecked = currentAnswers.includes(option);
                        
                        return (
                          <label key={option} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              value={option}
                              checked={isChecked}
                              onChange={() => {
                                let newAnswers;
                                if (isChecked) {
                                  newAnswers = currentAnswers.filter((a) => a !== option);
                                } else {
                                  newAnswers = [...currentAnswers, option];
                                }
                                handleInputChange(question.id, newAnswers.join(','));
                              }}
                              className="rounded"
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              
              <Button type="submit" className="w-full sm:w-auto">
                Submit Survey
              </Button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ViewSurvey;
