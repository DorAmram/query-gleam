
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { useSurveyStore } from '@/lib/store';
import { Survey, Question } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import QuestionBuilderWrapper from '@/components/QuestionBuilderWrapper';

const CreateSurvey = () => {
  const navigate = useNavigate();
  const { addSurvey } = useSurveyStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: crypto.randomUUID(),
      type: 'text',
      text: '',
      required: false,
    },
  ]);
  
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),
        type: 'text',
        text: '',
        required: false,
      },
    ]);
  };
  
  const updateQuestion = (id: string, updatedQuestion: Question) => {
    setQuestions(
      questions.map((q) => (q.id === id ? updatedQuestion : q))
    );
  };
  
  const deleteQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    } else {
      toast.error('A survey must have at least one question');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      toast.error('Please enter a survey title');
      return;
    }
    
    if (!questions.length) {
      toast.error('Please add at least one question');
      return;
    }
    
    // Check if any questions are empty
    const hasEmptyQuestions = questions.some((q) => !q.text.trim());
    if (hasEmptyQuestions) {
      toast.error('Please fill in all question texts');
      return;
    }
    
    // Create the survey
    const survey: Survey = {
      id: crypto.randomUUID(),
      title,
      description,
      questions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Add to store
    addSurvey(survey);
    
    // Show success message
    toast.success('Survey created successfully');
    
    // Navigate to survey page
    navigate(`/survey/${survey.id}`);
  };
  
  // Check if there are any multiple choice or checkbox questions with less than 2 options
  const validateOptions = () => {
    for (const question of questions) {
      if (
        (question.type === 'radio' || question.type === 'checkbox') &&
        (!question.options || question.options.length < 2)
      ) {
        return false;
      }
    }
    return true;
  };
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="pt-10 px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create a New Survey</h1>
            <p className="text-muted-foreground mt-2">
              Design your survey with various question types
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Survey Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter survey title"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter survey description"
                  className="w-full"
                  rows={3}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium">Questions</h2>
              </div>
              
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <QuestionBuilderWrapper
                    key={question.id}
                    questions={[question]} 
                    onChange={(updatedQuestion) => updateQuestion(question.id, updatedQuestion[0])}
                    onDelete={() => deleteQuestion(question.id)}
                    index={index}
                  />
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuestion}
                  className="w-full"
                >
                  Add Question
                </Button>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={!validateOptions()}
              >
                Create Survey
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateSurvey;
