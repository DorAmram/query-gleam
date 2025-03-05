
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import QuestionBuilder from '@/components/QuestionBuilder';
import { useSurveyStore } from '@/lib/store';
import { Question } from '@/types';
import { Plus, Save } from 'lucide-react';
import { toast } from 'sonner';

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
    if (questions.length <= 1) return;
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSubmit = () => {
    // Validate form
    if (!title.trim()) {
      toast.error('Please add a title for your survey');
      return;
    }

    if (questions.some(q => !q.text.trim())) {
      toast.error('All questions must have text');
      return;
    }

    // Create new survey
    const newSurvey = {
      id: crypto.randomUUID(),
      title,
      description,
      questions,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Add to store
    addSurvey(newSurvey);
    
    // Show success and redirect
    toast.success('Survey created successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-24 px-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Create Survey</h1>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <Save size={16} className="mr-2" />
              Save Survey
            </button>
          </div>
          
          <div className="space-y-8">
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Survey Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter survey title"
                    className="w-full bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description (supports formatting and line breaks)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter survey description"
                    rows={5}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Questions</h2>
              
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <QuestionBuilder
                    key={question.id}
                    questions={[question]} 
                    onChange={(updatedQuestion) => updateQuestion(question.id, updatedQuestion[0])}
                    onDelete={() => deleteQuestion(question.id)}
                    index={index}
                  />
                ))}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addQuestion}
                  className="w-full py-3 border border-dashed border-border rounded-lg flex items-center justify-center text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  Add Question
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateSurvey;
