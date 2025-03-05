
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">The page you're looking for doesn't exist</p>
        <p className="text-sm text-muted-foreground mb-6">
          If you were trying to access a survey, it might have been deleted or the link might be incorrect.
        </p>
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
