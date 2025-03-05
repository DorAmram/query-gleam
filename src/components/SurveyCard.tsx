
import { motion } from 'framer-motion';
import { Survey } from '@/types';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import ShareLinkButton from './ShareLinkButton';
import { Trash2 } from 'lucide-react';
import { useSurveyStore } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface SurveyCardProps {
  survey: Survey;
  className?: string;
  isCompact?: boolean;
  isAdmin?: boolean;
}

const SurveyCard = ({ survey, className, isCompact = false, isAdmin = false }: SurveyCardProps) => {
  const { deleteSurvey } = useSurveyStore();

  // Ensure survey ID is valid and log it for debugging
  if (!survey || !survey.id) {
    console.error('Invalid survey object or missing ID:', survey);
    return null;
  }
  
  console.log('Rendering SurveyCard for survey ID:', survey.id);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
      deleteSurvey(survey.id);
      toast.success('Survey deleted successfully');
    }
  };

  // Construct the survey URL paths
  const surveyPath = `/survey/${survey.id}`;
  const resultsPath = `/results/${survey.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "group relative rounded-xl border bg-card p-6 shadow-sm transition-all duration-200",
        "hover:shadow-md hover:border-primary/20",
        className
      )}
    >
      <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-primary/5 to-primary/10 transition-opacity duration-300" />
      
      <div className="relative space-y-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-xl tracking-tight text-card-foreground">
              {survey.title}
            </h3>
            {isAdmin && (
              <Button
                onClick={handleDelete}
                variant="destructive"
                size="sm"
                className="opacity-60 hover:opacity-100"
                title="Delete Survey"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
          {!isCompact && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {survey.description}
            </p>
          )}
        </div>
        
        {!isCompact && (
          <div className="pt-2 text-xs text-muted-foreground">
            <span>{survey.questions.length} questions</span>
            <span className="mx-2">•</span>
            <span>
              {new Date(survey.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        )}

        <div className="pt-4 flex items-center justify-between gap-2">
          <Link
            to={surveyPath}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Take Survey
          </Link>

          <div className="flex gap-2">
            <ShareLinkButton surveyId={survey.id} />
            
            <Link
              to={resultsPath}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Results
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SurveyCard;
