
import { Question } from '@/types';
import QuestionBuilder from './QuestionBuilder';
import { Trash } from 'lucide-react';
import { Button } from './ui/button';

interface QuestionBuilderWrapperProps {
  questions: Question[];
  onChange: (updatedQuestion: Question[]) => void;
  onDelete?: () => void;
  index?: number; // Make index optional to avoid build errors
}

const QuestionBuilderWrapper = ({ 
  questions, 
  onChange, 
  onDelete,
  index 
}: QuestionBuilderWrapperProps) => {
  return (
    <div className="mb-4 pt-4 border-t relative group">
      {index !== undefined && (
        <div className="absolute -top-3 left-0 bg-background px-1 text-xs text-muted-foreground">
          Question {index + 1}
        </div>
      )}
      
      <QuestionBuilder
        questions={questions}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={onDelete}
        className="absolute -top-3 right-0 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {onDelete && <Trash size={14} />}
      </button>
    </div>
  );
};

export default QuestionBuilderWrapper;
