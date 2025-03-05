
import { useState, useEffect } from 'react';
import { Question, QuestionType } from '@/types';
import { PlusCircle, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface QuestionBuilderProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

const QuestionBuilder = ({ questions, onChange }: QuestionBuilderProps) => {
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: 'text',
      text: '',
      required: false,
    };
    
    onChange([...questions, newQuestion]);
  };
  
  const handleUpdateQuestion = (index: number, updates: Partial<Question>) => {
    const updatedQuestions = [...questions];
    
    // Update the question with the new values
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      ...updates,
    };
    
    // Handle special logic for different question types
    if (updates.type) {
      // Reset options when changing question type
      if (updates.type === 'radio' || updates.type === 'checkbox') {
        if (!updatedQuestions[index].options || updatedQuestions[index].options?.length === 0) {
          updatedQuestions[index].options = ['Option 1', 'Option 2'];
        }
      } else {
        // Remove options if changing from radio/checkbox to something else
        delete updatedQuestions[index].options;
      }
      
      // Set default maxRating for rating questions
      if (updates.type === 'rating' && !updatedQuestions[index].maxRating) {
        updatedQuestions[index].maxRating = 5;
      } else if (updates.type !== 'rating') {
        // Remove maxRating if not a rating question
        delete updatedQuestions[index].maxRating;
      }
    }
    
    onChange(updatedQuestions);
  };
  
  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    onChange(updatedQuestions);
  };
  
  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    
    if (!question.options) {
      question.options = [];
    }
    
    question.options.push(`Option ${question.options.length + 1}`);
    onChange(updatedQuestions);
  };
  
  const handleUpdateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    
    if (question.options) {
      question.options[optionIndex] = value;
      onChange(updatedQuestions);
    }
  };
  
  const handleDeleteOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    
    if (question.options && question.options.length > 1) {
      question.options.splice(optionIndex, 1);
      onChange(updatedQuestions);
    }
  };
  
  const handleMaxRatingChange = (questionIndex: number, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) return;
    
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].maxRating = Math.min(10, numValue);
    onChange(updatedQuestions);
  };
  
  const moveQuestion = (dragIndex: number, hoverIndex: number) => {
    const updatedQuestions = [...questions];
    const draggedQuestion = updatedQuestions[dragIndex];
    
    // Remove the dragged question
    updatedQuestions.splice(dragIndex, 1);
    // Insert it at the hover position
    updatedQuestions.splice(hoverIndex, 0, draggedQuestion);
    
    onChange(updatedQuestions);
  };

  return (
    <div className="space-y-6 pb-4">
      {questions.length === 0 ? (
        <div className="text-center py-8 bg-muted/40 rounded-lg border border-dashed">
          <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            No questions added yet. Click the button below to add your first question.
          </p>
        </div>
      ) : (
        questions.map((question, index) => (
          <motion.div 
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4 bg-card border rounded-lg shadow-sm relative"
          >
            <div className="flex items-start gap-4">
              <div className="cursor-move touch-none flex items-center">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Input
                    value={question.text}
                    onChange={(e) => handleUpdateQuestion(index, { text: e.target.value })}
                    placeholder="Question text"
                    className="font-medium"
                  />
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="w-40">
                      <Select
                        value={question.type}
                        onValueChange={(value) => handleUpdateQuestion(index, { type: value as QuestionType })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Question Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Short Text</SelectItem>
                          <SelectItem value="textarea">Paragraph</SelectItem>
                          <SelectItem value="radio">Multiple Choice</SelectItem>
                          <SelectItem value="checkbox">Checkboxes</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`required-${question.id}`}
                        checked={question.required}
                        onCheckedChange={(checked) => handleUpdateQuestion(index, { required: checked })}
                      />
                      <Label htmlFor={`required-${question.id}`}>Required</Label>
                    </div>
                  </div>
                </div>
                
                {(question.type === 'radio' || question.type === 'checkbox') && question.options && (
                  <div className="space-y-3 pl-6">
                    <p className="text-sm font-medium text-muted-foreground">Options:</p>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => handleUpdateOption(index, optionIndex, e.target.value)}
                          className="flex-1"
                        />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteOption(index, optionIndex)}
                                disabled={question.options && question.options.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete option</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddOption(index)}
                      className="mt-2"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                )}
                
                {question.type === 'rating' && (
                  <div className="flex items-center gap-4 pl-6">
                    <p className="text-sm font-medium text-muted-foreground">Max Rating:</p>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={question.maxRating || 5}
                      onChange={(e) => handleMaxRatingChange(index, e.target.value)}
                      className="w-20"
                    />
                  </div>
                )}
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleDeleteQuestion(index)}
              >
                <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          </motion.div>
        ))
      )}
      
      <Button onClick={handleAddQuestion} className="w-full" variant="outline">
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Question
      </Button>
    </div>
  );
};

export default QuestionBuilder;
