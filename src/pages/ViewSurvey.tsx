import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import SurveyCompletionMessage from '@/components/SurveyCompletionMessage';
import { useSurveyStore } from '@/lib/store';
import { Answer, Question, Response } from '@/types';
import { toast } from 'sonner';
import { ArrowRight, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ViewSurvey = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { surveys, addResponse, getResponsesForSurvey, voteForAnswer } = useSurveyStore();
  
  const [survey, setSurvey] = useState(surveys.find(s => s.id === id));
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [previousResponses, setPreviousResponses] = useState<Response[]>([]);
  const [votedAnswers, setVotedAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    console.log("ViewSurvey component mounted with ID:", id);
    if (!survey) {
      console.log("Survey not found in store, redirecting to home");
      navigate('/');
      toast.error('Survey not found');
    } else {
      console.log("Survey found:", survey.title);
      // Initialize answers array
      const initialAnswers: Answer[] = survey.questions.map(q => ({
        questionId: q.id,
        value: q.type === 'checkbox' ? [] : q.type === 'rating' ? 0 : '',
        votes: 0
      }));
      
      setAnswers(initialAnswers);
      
      // Get previous responses for this survey
      if (id) {
        const responses = getResponsesForSurvey(id);
        console.log(`Found ${responses.length} previous responses for survey ${id}`);
        setPreviousResponses(responses);
      }

      // Load voted answers from localStorage
      const storedVotes = localStorage.getItem(`votedAnswers-${survey.id}`);
      if (storedVotes) {
        try {
          setVotedAnswers(JSON.parse(storedVotes));
          console.log("Loaded previously voted answers:", storedVotes);
        } catch (e) {
          console.error("Error parsing stored votes:", e);
        }
      }
    }
  }, [survey, navigate, id, getResponsesForSurvey]);

  if (!survey) return null;

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 px-6 pb-20">
          <SurveyCompletionMessage surveyId={survey.id} surveyTitle={survey.title} />
        </main>
      </div>
    );
  }

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
    console.log("Response submitted:", response);
    
    // Show success and redirect
    setTimeout(() => {
      setIsSubmitting(false);
      setIsCompleted(true);
    }, 1000);
  };

  const handleVote = (responseId: string, questionId: string) => {
    const voteKey = `${responseId}:${questionId}`;
    if (!votedAnswers[voteKey]) {
      // Call store function to vote
      voteForAnswer(responseId, questionId);
      
      // Update local state to track voted answers
      const updatedVotes = { ...votedAnswers, [voteKey]: true };
      setVotedAnswers(updatedVotes);
      
      // Save to localStorage to persist across visits
      localStorage.setItem(`votedAnswers-${survey.id}`, JSON.stringify(updatedVotes));
      
      // Update previousResponses to reflect the vote change
      setPreviousResponses(getResponsesForSurvey(id || ''));
      
      toast.success('Your vote has been recorded!');
    } else {
      toast.info('You have already voted for this answer');
    }
  };

  const getResponsesForQuestion = (questionId: string) => {
    return previousResponses
      .map(response => ({
        responseId: response.id,
        answer: response.answers.find(a => a.questionId === questionId)
      }))
      .filter(item => item.answer !== undefined);
  };

  const renderPreviousAnswers = () => {
    const responses = getResponsesForQuestion(currentQuestion.id);
    
    if (responses.length === 0) return null;
    
    return (
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-medium">Previous answers</h3>
        <div className="space-y-3">
          {responses.map(({ responseId, answer }) => {
            if (!answer) return null;
            
            let content;
            let selectedChoice;
            let selectedChoices;
            
            switch (currentQuestion.type) {
              case 'text':
                content = <p className="mb-2">{answer.value as string}</p>;
                break;
              case 'multipleChoice':
                selectedChoice = currentQuestion.choices?.find(c => c.id === answer.value);
                content = <p className="mb-2">{selectedChoice?.text}</p>;
                break;
              case 'checkbox':
                selectedChoices = currentQuestion.choices?.filter(c => 
                  (answer.value as string[]).includes(c.id)
                );
                content = (
                  <div className="mb-2">
                    {selectedChoices?.map(choice => (
                      <div key={choice.id} className="text-sm">{choice.text}</div>
                    ))}
                  </div>
                );
                break;
              case 'rating':
                content = (
                  <div className="flex items-center mb-2">
                    {Array.from({ length: currentQuestion.maxRating || 5 }).map((_, i) => (
                      <span 
                        key={i}
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs mr-1 ${
                          (answer.value as number) >= i + 1
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary'
                        }`}
                      >
                        {i + 1}
                      </span>
                    ))}
                  </div>
                );
                break;
            }
            
            const voteKey = `${responseId}:${answer.questionId}`;
            const hasVoted = votedAnswers[voteKey];
            const voteCount = answer.votes || 0;
            
            return (
              <div 
                key={responseId} 
                className="p-4 border rounded-md bg-card flex justify-between items-start gap-4"
              >
                <div className="flex-1">
                  {content}
                  <div className="text-xs text-muted-foreground">
                    {voteCount > 0 
                      ? `${voteCount} ${voteCount === 1 ? 'vote' : 'votes'}`
                      : 'No votes yet'}
                  </div>
                </div>
                
                <Button
                  onClick={() => handleVote(responseId, answer.questionId)}
                  variant={hasVoted ? "secondary" : "outline"}
                  size="sm"
                  className="flex-shrink-0"
                  disabled={hasVoted}
                >
                  <ThumbsUp size={16} className={hasVoted ? "text-primary" : ""} />
                  <span className="ml-1">
                    {hasVoted ? 'Voted' : 'Vote'}
                  </span>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
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
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-muted-foreground whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: survey.description.replace(/\n/g, '<br>') }}
            />
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
          
          {renderPreviousAnswers()}
          
          <div className="flex justify-between mt-6">
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
