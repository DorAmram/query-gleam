
import { motion } from 'framer-motion';
import { Survey } from '@/types';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SurveyCardProps {
  survey: Survey;
  className?: string;
  isCompact?: boolean;
}

const SurveyCard = ({ survey, className, isCompact = false }: SurveyCardProps) => {
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
          <h3 className="font-medium text-xl tracking-tight text-card-foreground">
            {survey.title}
          </h3>
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
            to={`/survey/${survey.id}`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Take Survey
          </Link>

          <Link
            to={`/results/${survey.id}`}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            View Results
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default SurveyCard;
