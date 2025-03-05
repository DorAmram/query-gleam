
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useSurveyStore } from "@/lib/store";

const NotFound = () => {
  const location = useLocation();
  const { surveys } = useSurveyStore();
  
  // Check if the path matches a survey pattern and report more specific error
  const isSurveyPath = location.pathname.startsWith('/survey/');
  const surveyId = isSurveyPath ? location.pathname.split('/')[2] : null;
  const surveyExists = surveyId ? surveys.some(s => s.id === surveyId) : false;

  useEffect(() => {
    // More detailed logging for debugging
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
      isSurveyPath ? `| Looking for survey ID: ${surveyId} | Survey exists: ${surveyExists}` : ''
    );
    
    if (isSurveyPath) {
      console.log('All available surveys:', JSON.stringify(surveys));
    }
  }, [location.pathname, isSurveyPath, surveyId, surveyExists, surveys]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">The page you're looking for doesn't exist</p>
        
        {isSurveyPath && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {!surveyExists 
                ? "The survey you're trying to access doesn't exist or might have been deleted." 
                : "There was an error accessing this survey."}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Survey ID: {surveyId}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please check that you have the correct link.
            </p>
          </div>
        )}
        
        <Link 
          to="/" 
          className="text-primary hover:text-primary/90 underline"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
