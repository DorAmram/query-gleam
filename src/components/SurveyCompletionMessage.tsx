
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import ShareLinkButton from './ShareLinkButton';
import GoogleDriveExport from './GoogleDriveExport';

interface SurveyCompletionMessageProps {
  surveyId: string;
  surveyTitle: string;
}

const SurveyCompletionMessage = ({ surveyId, surveyTitle }: SurveyCompletionMessageProps) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const adminPassword = localStorage.getItem('adminPassword');
    setIsAdmin(adminPassword === 'fogiking');
    
    // Log the survey ID for debugging
    console.log("SurveyCompletionMessage displaying for survey ID:", surveyId);
  }, [surveyId]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto rounded-lg bg-card border p-8 shadow-md"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        
        <h2 className="text-2xl font-semibold">Thank you!</h2>
        
        <p className="text-muted-foreground">
          Your response to "{surveyTitle}" has been successfully submitted. 
        </p>
        
        <div className="flex flex-col w-full gap-4 pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <ShareLinkButton 
              surveyId={surveyId} 
              className="w-full sm:w-auto flex-1 justify-center"
            />
            
            {isAdmin && (
              <Link
                to="/"
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Home
              </Link>
            )}
          </div>
          
          {isAdmin && <GoogleDriveExport surveyId={surveyId} className="w-full" />}
        </div>
      </div>
    </motion.div>
  );
};

export default SurveyCompletionMessage;
