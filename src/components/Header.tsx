
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Header = () => {
  const location = useLocation();
  
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 glassmorphism border-b"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-2xl font-medium tracking-tight text-primary"
          >
            Survey<span className="text-primary font-bold">Craft</span>
          </motion.div>
        </Link>
        
        <nav className="flex items-center space-x-1">
          {[
            { path: '/', label: 'Home' },
            { path: '/create', label: 'Create Survey' },
          ].map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "relative px-4 py-2 rounded-md text-sm font-medium transition-all-200",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              {location.pathname === item.path && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 rounded-md bg-primary/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
