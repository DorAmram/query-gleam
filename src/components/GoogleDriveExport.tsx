
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useSurveyStore } from '@/lib/store';
import { Survey, Response } from '@/types';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // Replace with your Google API Client ID
const API_KEY = "YOUR_GOOGLE_API_KEY"; // Replace with your Google API Key
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.file";

interface GoogleDriveExportProps {
  surveyId: string;
  className?: string;
}

const GoogleDriveExport = ({ surveyId, className = "" }: GoogleDriveExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { surveys, getResponsesForSurvey } = useSurveyStore();
  const survey = surveys.find(s => s.id === surveyId);
  
  if (!survey) return null;

  const formatResultsToCSV = (survey: Survey, responses: Response[]) => {
    // Headers: Question texts
    const headers = ["Timestamp", ...survey.questions.map(q => q.text)];
    
    // Format each response
    const rows = responses.map(response => {
      const date = new Date(response.createdAt).toLocaleDateString();
      
      // Map answers to their corresponding questions
      const answerValues = survey.questions.map(question => {
        const answer = response.answers.find(a => a.questionId === question.id);
        if (!answer) return "";
        
        // Format based on answer type
        if (Array.isArray(answer.value)) {
          // For checkbox type (multiple values)
          const selectedChoices = question.choices?.filter(c => 
            (answer.value as string[]).includes(c.id)
          ).map(c => c.text);
          return selectedChoices?.join(", ") || "";
        } else if (typeof answer.value === "number") {
          // For rating type
          return answer.value.toString();
        } else {
          // For text or single-choice
          if (question.type === "multipleChoice") {
            const choice = question.choices?.find(c => c.id === answer.value);
            return choice?.text || "";
          }
          return answer.value;
        }
      });
      
      return [date, ...answerValues];
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    return csvContent;
  };

  const exportToGoogleDrive = async () => {
    setIsExporting(true);
    
    try {
      // Load the Google API client library
      if (!window.gapi) {
        toast.error("Google API client library not loaded");
        setIsExporting(false);
        return;
      }
      
      // Initialize the auth client
      await new Promise<void>((resolve) => {
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              apiKey: API_KEY,
              clientId: CLIENT_ID,
              discoveryDocs: DISCOVERY_DOCS,
              scope: SCOPES
            });
            resolve();
          } catch (error) {
            console.error("Error initializing Google API client:", error);
            toast.error("Failed to initialize Google Drive connection");
            setIsExporting(false);
          }
        });
      });
      
      // Sign in if not already
      if (!window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
        await window.gapi.auth2.getAuthInstance().signIn();
      }
      
      // Get survey responses and convert to CSV
      const responses = getResponsesForSurvey(surveyId);
      const csvContent = formatResultsToCSV(survey, responses);
      
      // Create a file in Google Drive
      const fileName = `${survey.title} - Survey Results.csv`;
      const file = new Blob([csvContent], { type: 'text/csv' });
      
      const metadata = {
        name: fileName,
        mimeType: 'text/csv'
      };
      
      // Use the Drive API to create the file
      const accessToken = window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
      
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);
      
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: form
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(`Survey results successfully saved to Google Drive as "${fileName}"`);
      } else {
        console.error("Error uploading to Google Drive:", await response.text());
        toast.error("Failed to upload to Google Drive");
      }
    } catch (error) {
      console.error("Error exporting to Google Drive:", error);
      toast.error("Failed to export to Google Drive");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={exportToGoogleDrive} 
      disabled={isExporting}
      variant="outline"
      className={className}
    >
      <Save className="mr-2 h-4 w-4" />
      {isExporting ? "Exporting..." : "Save to Google Drive"}
    </Button>
  );
};

export default GoogleDriveExport;
