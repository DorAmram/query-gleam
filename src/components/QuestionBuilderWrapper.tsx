
import React from 'react';
import QuestionBuilder from './QuestionBuilder';
import { Question } from '@/types';

interface QuestionBuilderWrapperProps {
  questions: Question[];
  onChange: (updatedQuestion: Question[]) => void;
  onDelete: () => void;
  index: number;
}

const QuestionBuilderWrapper = ({
  questions,
  onChange,
  onDelete,
  index,
}: QuestionBuilderWrapperProps) => {
  return (
    <div className="relative">
      <QuestionBuilder
        questions={questions}
        onChange={onChange}
        onDelete={onDelete}
        index={index}
      />
      <button
        onClick={onDelete}
        className="absolute top-4 right-4 text-destructive hover:text-destructive/80"
        aria-label="Delete question"
      >
        ×
      </button>
    </div>
  );
};

export default QuestionBuilderWrapper;
