
import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ShareLinkButtonProps {
  surveyId: string;
  className?: string;
  compact?: boolean;
}

const ShareLinkButton = ({ surveyId, className, compact = false }: ShareLinkButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    // Create the survey link with absolute URL to ensure it works in all contexts
    const surveyUrl = `${window.location.origin}/survey/${surveyId}`;
    
    // Use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: 'Take this survey',
        text: 'I\'d like to share this survey with you',
        url: surveyUrl,
      }).catch(() => {
        // Fallback if share is cancelled or fails
        copyToClipboard(surveyUrl);
      });
    } else {
      // Fallback to clipboard
      copyToClipboard(surveyUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        toast.success('Survey link copied to clipboard');
        
        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error('Failed to copy link');
      });
  };

  return (
    <button
      onClick={handleShare}
      className={cn(
        "inline-flex items-center justify-center transition-colors",
        compact 
          ? "text-muted-foreground hover:text-foreground" 
          : "rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className
      )}
      aria-label="Share survey"
    >
      <Share2 size={compact ? 16 : 18} className={compact ? "" : "mr-2"} />
      {!compact && (copied ? "Copied!" : "Share")}
    </button>
  );
};

export default ShareLinkButton;
