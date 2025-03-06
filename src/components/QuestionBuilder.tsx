import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, QuestionType, Choice } from '@/types';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionBuilderProps {
  question: Question;
  onChange: (updatedQuestion: Question) => void;
  onDelete: () => void;
  index: number;
}

const QuestionBuilder = ({ question, onChange, onDelete, index }: QuestionBuilderProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleTypeChange = (type: QuestionType) => {
    const updatedQuestion: Question = { ...question, type };
    
    // Initialize choices array if changing to multiple choice or checkbox
    if ((type === 'multipleChoice' || type === 'checkbox') && !question.choices) {
      updatedQuestion.choices = [
        { id: crypto.randomUUID(), text: 'Option 1' },
        { id: crypto.randomUUID(), text: 'Option 2' }
      ];
    }
    
    // Initialize maxRating if changing to rating
    if (type === 'rating' && !question.maxRating) {
      updatedQuestion.maxRating = 5;
    }
    
    onChange(updatedQuestion);
  };

  const addChoice = () => {
    if (!question.choices) return;
    
    onChange({
      ...question,
      choices: [
        ...question.choices,
        { id: crypto.randomUUID(), text: `Option ${question.choices.length + 1}` }
      ]
    });
  };

  const updateChoice = (id: string, text: string) => {
    if (!question.choices) return;
    
    onChange({
      ...question,
      choices: question.choices.map(choice => 
        choice.id === id ? { ...choice, text } : choice
      )
    });
  };

  const deleteChoice = (id: string) => {
    if (!question.choices) return;
    
    onChange({
      ...question,
      choices: question.choices.filter(choice => choice.id !== id)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="relative mb-6 rounded-lg border border-border bg-card shadow-sm"
    >
      <div className={cn(
        "p-4 grid grid-cols-12 gap-4",
        !isOpen && "border-b border-border"
      )}>
        <div className="col-span-1 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
            {index + 1}
          </div>
        </div>
        
        <div className="col-span-10">
          <input
            type="text"
            value={question.text}
            onChange={(e) => onChange({ ...question, text: e.target.value })}
            className="w-full bg-transparent font-medium text-card-foreground border-none outline-none focus:ring-0 p-0"
            placeholder="Question text"
          />
        </div>
        
        <div className="col-span-1 flex items-center justify-end">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            {isOpen ? (
              <X size={18} />
            ) : (
              <Plus size={18} />
            )}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 pt-0 overflow-hidden"
          >
            <div className="pt-4 border-t border-border space-y-4">
              <div className="flex flex-wrap gap-3">
                {(['text', 'multipleChoice', 'checkbox', 'rating'] as QuestionType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200",
                      question.type === type 
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    {type === 'text' && 'Text'}
                    {type === 'multipleChoice' && 'Multiple Choice'}
                    {type === 'checkbox' && 'Checkboxes'}
                    {type === 'rating' && 'Rating'}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => onChange({ ...question, required: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Required
                </label>
                
                {question.type === 'rating' && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Max rating:</label>
                    <select
                      value={question.maxRating}
                      onChange={(e) => onChange({ ...question, maxRating: parseInt(e.target.value) })}
                      className="bg-transparent border-gray-300 rounded text-sm"
                    >
                      {[3, 5, 7, 10].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              {(question.type === 'multipleChoice' || question.type === 'checkbox') && question.choices && (
                <div className="space-y-2 mt-4">
                  <AnimatePresence>
                    {question.choices.map((choice) => (
                      <motion.div
                        key={choice.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-muted-foreground cursor-move">
                          <GripVertical size={16} />
                        </span>
                        <input
                          type="text"
                          value={choice.text}
                          onChange={(e) => updateChoice(choice.id, e.target.value)}
                          className="flex-1 bg-background border border-input rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-ring"
                        />
                        <button
                          onClick={() => deleteChoice(choice.id)}
                          disabled={question.choices!.length <= 2}
                          className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <button
                    onClick={addChoice}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus size={14} />
                    Add option
                  </button>
                </div>
              )}
              
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onDelete}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete question
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuestionBuilder;
