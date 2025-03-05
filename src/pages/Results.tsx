import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Survey, Response } from '@/types';
import { useSurveyStore } from '@/lib/store';
import { ArrowLeft, ThumbsUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { surveys, getResponsesForSurvey } = useSurveyStore();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const adminPassword = localStorage.getItem('adminPassword');
    setIsAdmin(adminPassword === 'fogiking');
    
    if (!id) {
      console.error('No survey ID provided');
      navigate('/not-found');
      return;
    }
    
    console.log('Results: Looking for survey with ID:', id);
    const foundSurvey = surveys.find((s) => s.id === id);
    
    if (foundSurvey) {
      console.log('Results: Found survey:', foundSurvey);
      setSurvey(foundSurvey);
      
      const surveyResponses = getResponsesForSurvey(foundSurvey.id);
      console.log(`Results: Found ${surveyResponses.length} responses for survey`);
      setResponses(surveyResponses);
    } else {
      console.error('Results: Survey not found with ID:', id);
      navigate('/not-found');
    }
  }, [id, surveys, navigate, getResponsesForSurvey]);

  if (!survey) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Calculate percentages and counts for each question
  const calculateResults = () => {
    
    const results = survey.questions.map(question => {
      if (question.type === 'text' || question.type === 'textarea') {
        // For text questions, collect all answers and their votes
        const answersWithVotes = responses
          .flatMap(response => {
            const answer = response.answers.find(a => a.questionId === question.id);
            if (!answer) return [];
            
            return [{
              text: answer.value.toString(),
              votes: answer.votes || 0
            }];
          });
          
        return {
          question,
          answersWithVotes,
          totalResponses: answersWithVotes.length
        };
      } else if (question.type === 'radio') {
        
        // For multiple choice, count occurrences of each option
        const counts: Record<string, number> = {};
        const votesByOption: Record<string, number> = {};
        let totalAnswers = 0;
        
        if (question.options) {
          // Initialize counts for all options
          question.options.forEach(option => {
            counts[option] = 0;
            votesByOption[option] = 0;
          });
        }
        
        // Count responses
        responses.forEach(response => {
          const answer = response.answers.find(a => a.questionId === question.id);
          if (answer && answer.value) {
            counts[answer.value.toString()] = (counts[answer.value.toString()] || 0) + 1;
            votesByOption[answer.value.toString()] = (votesByOption[answer.value.toString()] || 0) + (answer.votes || 0);
            totalAnswers++;
          }
        });
        
        // Convert to data for charts
        const data = Object.keys(counts).map(key => ({
          name: key,
          value: counts[key],
          votes: votesByOption[key],
          percentage: totalAnswers > 0 ? Math.round((counts[key] / totalAnswers) * 100) : 0
        }));
        
        return {
          question,
          data,
          totalResponses: totalAnswers
        };
      } else if (question.type === 'checkbox') {
        
        // For checkboxes, count each option selection
        const counts: Record<string, number> = {};
        const votesByOption: Record<string, number> = {};
        
        if (question.options) {
          // Initialize counts for all options
          question.options.forEach(option => {
            counts[option] = 0;
            votesByOption[option] = 0;
          });
        }
        
        // Count responses
        responses.forEach(response => {
          const answer = response.answers.find(a => a.questionId === question.id);
          if (answer && answer.value) {
            const selected = answer.value.toString().split(',');
            selected.forEach(option => {
              if (option) {
                counts[option] = (counts[option] || 0) + 1;
                // Add votes to each selected option
                votesByOption[option] = (votesByOption[option] || 0) + (answer.votes || 0);
              }
            });
          }
        });
        
        // Convert to data for charts
        const data = Object.keys(counts).map(key => ({
          name: key,
          value: counts[key],
          votes: votesByOption[key],
          percentage: responses.length > 0 ? Math.round((counts[key] / responses.length) * 100) : 0
        }));
        
        return {
          question,
          data,
          totalResponses: responses.length
        };
      } else if (question.type === 'rating') {
        
        // For rating questions, count occurrences of each rating
        const counts: Record<string, number> = {};
        const votesByRating: Record<string, number> = {};
        let totalAnswers = 0;
        let sum = 0;
        
        // Initialize counts for all possible ratings (1 to maxRating)
        for (let i = 1; i <= (question.maxRating || 5); i++) {
          counts[i.toString()] = 0;
          votesByRating[i.toString()] = 0;
        }
        
        // Count responses
        responses.forEach(response => {
          const answer = response.answers.find(a => a.questionId === question.id);
          if (answer && answer.value) {
            const rating = parseInt(answer.value.toString(), 10);
            counts[rating.toString()] = (counts[rating.toString()] || 0) + 1;
            votesByRating[rating.toString()] = (votesByRating[rating.toString()] || 0) + (answer.votes || 0);
            sum += rating;
            totalAnswers++;
          }
        });
        
        // Convert to data for charts
        const data = Object.keys(counts).map(key => ({
          name: key,
          value: counts[key],
          votes: votesByRating[key],
          percentage: totalAnswers > 0 ? Math.round((counts[key] / totalAnswers) * 100) : 0
        }));
        
        const averageRating = totalAnswers > 0 ? Math.round((sum / totalAnswers) * 10) / 10 : 0;
        
        return {
          question,
          data,
          totalResponses: totalAnswers,
          averageRating
        };
      }
      
      return {
        question,
        data: [],
        totalResponses: 0
      };
    });
    
    return results;
  };

  const results = calculateResults();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="pt-10 px-6">
        <div className="max-w-5xl mx-auto mb-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Surveys
          </Button>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{survey.title} - Results</h1>
              {survey.description && (
                <p className="text-muted-foreground mt-2">{survey.description}</p>
              )}
              <div className="flex items-center mt-4 text-muted-foreground">
                <span className="font-medium">{responses.length} responses</span>
              </div>
            </div>
            
            {responses.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No responses yet</CardTitle>
                  <CardDescription>
                    Share your survey to collect responses.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <motion.div layout className="space-y-8">
                {results.map((result, index) => (
                  <motion.div
                    key={result.question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle>{result.question.text}</CardTitle>
                        <CardDescription>
                          {result.totalResponses} responses
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {(result.question.type === 'text' || result.question.type === 'textarea') && (
                          <div className="space-y-2">
                            {result.answersWithVotes && result.answersWithVotes.length > 0 ? (
                              result.answersWithVotes.map((answer, i) => (
                                <div key={i} className="p-3 bg-muted rounded-md flex justify-between items-center">
                                  <div>{answer.text}</div>
                                  {answer.votes > 0 && (
                                    <div className="flex items-center text-muted-foreground text-sm">
                                      <ThumbsUp className="h-3 w-3 mr-1" />
                                      {answer.votes}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-muted-foreground">No text responses yet.</p>
                            )}
                          </div>
                        )}
                        
                        {(result.question.type === 'radio' || result.question.type === 'checkbox') && result.data && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex justify-center items-center h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={result.data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                                  >
                                    {result.data.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip formatter={(value) => [`${value} responses`, '']} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            
                            <div className="space-y-2">
                              {result.data.map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div
                                      className="w-3 h-3 rounded-full mr-2"
                                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                    />
                                    <span>{item.name}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="font-medium">
                                      {item.value} ({item.percentage}%)
                                    </div>
                                    {item.votes > 0 && (
                                      <div className="flex items-center text-muted-foreground text-sm bg-muted px-2 py-1 rounded">
                                        <ThumbsUp className="h-3 w-3 mr-1" />
                                        {item.votes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {result.question.type === 'rating' && result.data && (
                          <div className="space-y-4">
                            <div className="text-center text-3xl font-bold">
                              Average Rating: {result.averageRating}
                            </div>
                            
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={result.data}
                                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip formatter={(value) => [`${value} responses`, '']} />
                                  <Bar dataKey="value" fill="#3b82f6" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            
                            <div className="space-y-2 mt-4">
                              {result.data.map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <span>Rating: {item.name}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="font-medium">
                                      {item.value} ({item.percentage}%)
                                    </div>
                                    {item.votes > 0 && (
                                      <div className="flex items-center text-muted-foreground text-sm bg-muted px-2 py-1 rounded">
                                        <ThumbsUp className="h-3 w-3 mr-1" />
                                        {item.votes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;
