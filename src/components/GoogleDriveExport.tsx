
import { useState } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useSurveyStore } from '@/lib/store';
import { toast } from 'sonner';

interface GoogleDriveExportProps {
  surveyId: string;
  className?: string;
}

const GoogleDriveExport = ({ surveyId, className }: GoogleDriveExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { surveys, getResponsesForSurvey } = useSurveyStore();
  
  const survey = surveys.find(s => s.id === surveyId);
  const responses = getResponsesForSurvey(surveyId);
  
  const handleExport = async () => {
    if (!survey) {
      toast.error('Survey not found');
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Prepare survey data for export
      const exportData = {
        surveyTitle: survey.title,
        surveyDescription: survey.description,
        questions: survey.questions.map(q => ({
          id: q.id,
          text: q.text,
          type: q.type,
          required: q.required,
          options: q.options || []
        })),
        responses: responses.map(r => ({
          id: r.id,
          answers: r.answers.map(a => {
            const question = survey.questions.find(q => q.id === a.questionId);
            return {
              question: question?.text || 'Unknown question',
              value: a.value
            };
          }),
          createdAt: new Date(r.createdAt).toLocaleString()
        }))
      };
      
      // Convert data to CSV
      const csv = convertToCSV(exportData);
      
      // Export to file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${survey.title.replace(/\s+/g, '_')}_responses.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Survey responses exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export survey responses');
    } finally {
      setIsExporting(false);
    }
  };
  
  const convertToCSV = (data: any) => {
    // Prepare headers
    const headers = ['Respondent ID', 'Timestamp'];
    data.questions.forEach((q: any) => {
      headers.push(q.text);
    });
    
    // Prepare rows
    const rows = data.responses.map((response: any) => {
      const row: any = {
        'Respondent ID': response.id.substring(0, 8),
        'Timestamp': response.createdAt
      };
      
      // Add answers to corresponding questions
      response.answers.forEach((answer: any) => {
        row[answer.question] = answer.value;
      });
      
      return row;
    });
    
    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => {
        return headers.map(header => {
          const value = row[header] || '';
          // Escape quotes and wrap in quotes if contains comma
          const escaped = value.toString().replace(/"/g, '""');
          return value.toString().includes(',') ? `"${escaped}"` : escaped;
        }).join(',');
      })
    ].join('\n');
    
    return csvContent;
  };
  
  return (
    <Button 
      variant="outline" 
      onClick={handleExport}
      disabled={isExporting || !survey || responses.length === 0}
      className={cn(className)}
    >
      {isExporting ? 'Exporting...' : 'Export to CSV'}
    </Button>
  );
};

export default GoogleDriveExport;
