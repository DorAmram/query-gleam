
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import SurveyCard from '@/components/SurveyCard';
import { useSurveyStore } from '@/lib/store';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const { surveys } = useSurveyStore();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-24 px-6">
        <section className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center py-16 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="inline-block px-3 py-1 mb-6 text-xs font-medium text-primary bg-primary/10 rounded-full"
              >
                Beautiful Surveys Made Simple
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 text-balance"
              >
                Create engaging surveys with a premium experience
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-lg text-muted-foreground mb-8 text-balance"
              >
                Design beautiful surveys that people will want to complete. Get valuable insights with our intuitive survey platform.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link 
                  to="/create" 
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Create a Survey
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
          
          {surveys.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6">Your Surveys</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {surveys.map((survey) => (
                  <SurveyCard key={survey.id} survey={survey} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
