
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { useSurveyStore } from '@/lib/store';
import { Answer, Question, Response } from '@/types';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';

const ViewSurvey = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { surveys, addResponse } = useSurveyStore();
  
  const [survey, setSurvey] = useState(surveys.find(s => s.id === id));
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!survey) {
      navigate('/');
      toast.error('Survey not found');
    } else {
      // Initialize answers array
      const initialAnswers: Answer[] = survey.questions.map(q => ({
        questionId: q.id,
        value: q.type === 'checkbox' ? [] : q.type === 'rating' ? 0 : '',
      }));
      
      setAnswers(initialAnswers);
    }
  }, [survey, navigate]);

  if (!survey) return null;

  const currentQuestion = survey.questions[currentStep];

  const updateAnswer = (value: string | string[] | number) => {
    setAnswers(
      answers.map(a => 
        a.questionId === currentQuestion.id 
          ? { ...a, value } 
          : a
      )
    );
  };

  const handleNext = () => {
    // Validate current answer if required
    const currentAnswer = answers.find(a => a.questionId === currentQuestion.id);
    
    if (currentQuestion.required) {
      if (
        currentAnswer?.value === '' || 
        (Array.isArray(currentAnswer?.value) && currentAnswer.value.length === 0) ||
        (currentQuestion.type === 'rating' && currentAnswer?.value === 0)
      ) {
        toast.error('This question requires an answer');
        return;
      }
    }
    
    if (currentStep < survey.questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Create response object
    const response: Response = {
      id: crypto.randomUUID(),
      surveyId: survey.id,
      answers,
      createdAt: Date.now(),
    };
    
    // Add to store
    addResponse(response);
    
    // Show success and redirect
    setTimeout(() => {
      toast.success('Response submitted successfully');
      navigate('/');
      setIsSubmitting(false);
    }, 1000);
  };

  const renderQuestionInput = () => {
    const answer = answers.find(a => a.questionId === currentQuestion.id);
    if (!answer) return null;
    
    switch (currentQuestion.type) {
      case 'text':
        return (
          <textarea
            value={answer.value as string}
            onChange={e => updateAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring bg-background"
          />
        );
        
      case 'multipleChoice':
        return (
          <div className="space-y-3">
            {currentQuestion.choices?.map(choice => (
              <label 
                key={choice.id} 
                className="flex items-start space-x-3 p-3 border border-input rounded-md cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  checked={(answer.value as string) === choice.id}
                  onChange={() => updateAnswer(choice.id)}
                  className="mt-0.5"
                />
                <span>{choice.text}</span>
              </label>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="space-y-3">
            {currentQuestion.choices?.map(choice => (
              <label 
                key={choice.id} 
                className="flex items-start space-x-3 p-3 border border-input rounded-md cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={(answer.value as string[]).includes(choice.id)}
                  onChange={(e) => {
                    const currentValues = answer.value as string[];
                    if (e.target.checked) {
                      updateAnswer([...currentValues, choice.id]);
                    } else {
                      updateAnswer(currentValues.filter(v => v !== choice.id));
                    }
                  }}
                  className="mt-0.5"
                />
                <span>{choice.text}</span>
              </label>
            ))}
          </div>
        );
        
      case 'rating':
        return (
          <div className="py-6">
            <div className="flex justify-between items-center">
              {Array.from({ length: currentQuestion.maxRating || 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateAnswer(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                    (answer.value as number) >= i + 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-primary/20'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Not satisfied</span>
              <span>Very satisfied</span>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-1 text-sm text-muted-foreground"
            >
              Question {currentStep + 1} of {survey.questions.length}
            </motion.div>
            
            <motion.div
              key={`progress-${currentStep}`}
              initial={{ width: `${(currentStep / survey.questions.length) * 100}%` }}
              animate={{ width: `${((currentStep + 1) / survey.questions.length) * 100}%` }}
              className="h-1 bg-primary rounded-full mb-8"
              transition={{ duration: 0.3 }}
            />
            
            <motion.h1
              key={`title-${currentStep}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-semibold tracking-tight mb-2"
            >
              {survey.title}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground"
            >
              {survey.description}
            </motion.p>
          </div>
          
          <motion.div
            key={`question-${currentStep}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="bg-card rounded-lg border shadow-sm p-6 mb-6"
          >
            <div className="mb-6">
              <h2 className="text-xl font-medium mb-4">
                {currentQuestion.text}
                {currentQuestion.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </h2>
              
              {renderQuestionInput()}
            </div>
          </motion.div>
          
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            >
              {currentStep < survey.questions.length - 1 ? (
                <>Next<ArrowRight size={16} className="ml-2" /></>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewSurvey;
