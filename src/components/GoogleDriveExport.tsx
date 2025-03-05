
import { useState } from 'react';
import { Button } from './ui/button';
import { useSurveyStore } from '@/lib/store';
import { Survey, Response } from '@/types';
import { FileJson, Upload } from 'lucide-react';
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

  if (!survey) return null;

  const handleExport = async () => {
    if (!window.gapi) {
      toast.error("Google API not loaded. Please try again later.");
      return;
    }

    setIsExporting(true);
    
    try {
      // Generate CSV content
      const csvContent = generateCSV(survey, responses);
      
      // Initialize Google API
      await new Promise((resolve) => {
        window.gapi.load('client:auth2', resolve);
      });
      
      await window.gapi.client.init({
        apiKey: 'YOUR_API_KEY', // Replace with your actual API key
        clientId: 'YOUR_CLIENT_ID', // Replace with your actual client ID
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope: 'https://www.googleapis.com/auth/drive.file',
      });
      
      // Check if user is signed in
      const isSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get();
      if (!isSignedIn) {
        await window.gapi.auth2.getAuthInstance().signIn();
      }
      
      // Prepare file metadata and content
      const filename = `${survey.title.replace(/\s+/g, '_')}_responses.csv`;
      const file = new Blob([csvContent], { type: 'text/csv' });
      
      // Create multipart request for file upload
      const metadata = {
        name: filename,
        mimeType: 'text/csv',
      };
      
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);
      
      // Get access token
      const accessToken = window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
      
      // Upload file to Google Drive
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: form,
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Survey exported to Google Drive successfully!');
        console.log('File uploaded, ID:', data.id);
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error exporting to Google Drive:', error);
      toast.error('Failed to export survey. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Generate CSV content from survey and responses
  const generateCSV = (survey: Survey, responses: Response[]): string => {
    // Headers
    let csv = 'Respondent ID,Submission Date';
    
    survey.questions.forEach(question => {
      csv += `,${question.text.replace(/,/g, ' ')}`;
    });
    
    csv += '\n';
    
    // Rows (responses)
    responses.forEach(response => {
      const date = new Date(response.createdAt).toLocaleDateString();
      
      // Start with ID and date
      csv += `${response.id},${date}`;
      
      // Add each answer
      survey.questions.forEach(question => {
        const answer = response.answers.find(a => a.questionId === question.id);
        
        if (!answer) {
          csv += ',Not answered';
        } else if (question.type === 'radio' || question.type === 'text' || question.type === 'textarea') {
          // Text and multiple choice questions
          csv += `,${answer.value.toString().replace(/,/g, ' ')}`;
        } else if (question.type === 'checkbox') {
          // Checkbox questions (multiple answers)
          if (Array.isArray(answer.value)) {
            csv += `,${answer.value.join('; ').replace(/,/g, ' ')}`;
          } else {
            csv += `,${answer.value.toString().replace(/,/g, ' ')}`;
          }
        } else if (question.type === 'rating') {
          // Rating questions
          csv += `,${answer.value}`;
        } else {
          csv += ',';
        }
      });
      
      csv += '\n';
    });
    
    return csv;
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting || responses.length === 0}
      className={className}
      variant="outline"
    >
      {isExporting ? (
        <>
          <Upload className="animate-pulse" />
          Exporting...
        </>
      ) : (
        <>
          <FileJson />
          Export to Google Drive
        </>
      )}
    </Button>
  );
};

export default GoogleDriveExport;
