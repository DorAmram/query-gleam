
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import ShareLinkButton from './ShareLinkButton';

interface SurveyCompletionMessageProps {
  surveyId: string;
  surveyTitle: string;
}

const SurveyCompletionMessage = ({ surveyId, surveyTitle }: SurveyCompletionMessageProps) => {
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
        
        <div className="flex flex-col sm:flex-row w-full gap-4 pt-6">
          <ShareLinkButton 
            surveyId={surveyId} 
            className="w-full sm:w-auto flex-1 justify-center"
          />
          
          <Link
            to="/"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default SurveyCompletionMessage;
