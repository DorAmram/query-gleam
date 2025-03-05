
import { useState } from 'react';
import { Question } from '@/types';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface QuestionBuilderProps {
  questions: Question[];
  onChange: (updatedQuestion: Question[]) => void;
}

const QuestionBuilder = ({ questions, onChange }: QuestionBuilderProps) => {
  const [question, setQuestion] = useState<Question>(questions[0]);

  const updateQuestion = (updatedFields: Partial<Question>) => {
    const updatedQuestion = {
      ...question,
      ...updatedFields,
    };
    setQuestion(updatedQuestion);
    onChange([updatedQuestion]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...(question.options || [])];
    updatedOptions[index] = value;
    updateQuestion({ options: updatedOptions });
  };

  const addOption = () => {
    const updatedOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
    updateQuestion({ options: updatedOptions });
  };

  const removeOption = (index: number) => {
    const updatedOptions = [...(question.options || [])];
    updatedOptions.splice(index, 1);
    updateQuestion({ options: updatedOptions });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question-text">Question Text</Label>
        <Input
          id="question-text"
          value={question.text}
          onChange={(e) => updateQuestion({ text: e.target.value })}
          placeholder="Enter your question"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => updateQuestion({ required: e.target.checked })}
            className="rounded border-gray-300"
          />
          Required
        </label>
      </div>

      <Tabs defaultValue={question.type} onValueChange={(value) => updateQuestion({ type: value as Question['type'] })}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="textarea">Paragraph</TabsTrigger>
          <TabsTrigger value="radio">Multiple Choice</TabsTrigger>
          <TabsTrigger value="checkbox">Checkboxes</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Short answer text question.
          </p>
        </TabsContent>

        <TabsContent value="textarea" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Long answer paragraph question.
          </p>
        </TabsContent>

        <TabsContent value="radio" className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Multiple choice with single selection.
            </p>

            <div className="space-y-2">
              {(question.options || []).map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(index)}>
                    <X size={16} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-2"
              >
                Add Option
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="checkbox" className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Multiple choice with multiple selections.
            </p>

            <div className="space-y-2">
              {(question.options || []).map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(index)}>
                    <X size={16} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-2"
              >
                Add Option
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestionBuilder;
