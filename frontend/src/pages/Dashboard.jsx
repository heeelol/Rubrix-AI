import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, FileText, BarChart3, Brain, Target, BookOpen, CheckCircle, AlertTriangle, TrendingUp, User, Settings, Search, Bell, Download, Eye } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import HomeworkPanel from '../components/HomeworkPanel';
import { toast } from 'react-hot-toast';

const MainDashboard = () => {
  const [currentView, setCurrentView] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [generatedExercises, setGeneratedExercises] = useState(null);
  const answerTextareaRef = React.useRef(null);
  
  const [radarData, setRadarData] = useState([
    { subject: 'Grammar', score: 0, previousScore: 0, improvement: 0 },
    { subject: 'Vocabulary', score: 0, previousScore: 0, improvement: 0 },
    { subject: 'Writing', score: 0, previousScore: 0, improvement: 0 },
    { subject: 'Spelling', score: 0, previousScore: 0, improvement: 0 },
    { subject: 'Punctuation', score: 0, previousScore: 0, improvement: 0 }
  ]);

  // Fetch user scores when component mounts
  useEffect(() => {
    const fetchUserScores = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/user/scores');

        if (response.ok) {
          const scores = await response.json();
          // Map the scores to include required properties if they don't exist
          const formattedScores = scores.map(score => ({
            subject: score.subject,
            score: score.score || 0,
            previousScore: score.previousScore || 0,
            improvement: score.improvement || 0
          }));
          console.log('Formatted scores:', formattedScores);
          setRadarData(formattedScores);
        } else {
          const error = await response.json();
          console.error('Failed to fetch scores:', error);
        }
      } catch (error) {
        console.error('Error fetching user scores:', error);
      }
    };

    fetchUserScores();
  }, []);
  
  const [studentProfile, setStudentProfile] = useState({
    name: 'Alex Johnson',
    grade: '10th Grade',
    school: 'Lincoln High School',
    avatar: '👨‍🎓',
    totalHomework: 24,
    completedHomework: 18,
    avgScore: 73.5
  });

  const [subjects, setSubjects] = useState({
    'English': { 
      score: 85, 
      trend: 'excellent', 
      weakness: 'Poetry Analysis',
      strengths: ['Essay Writing', 'Grammar', 'Vocabulary'],
      recentActivity: 'Excellent essays',
      nextFocus: 'Literature Analysis',
      topics: [
        'Poetry Analysis',
        'Literature Comprehension',
        'Essay Writing',
        'Grammar and Vocabulary',
        'Creative Writing'
      ],
      resources: [
        'Literature Textbook',
        'Grammar Handbook',
        'Writing Style Guide'
      ]
    }
  });

  const [homeworkQueue, setHomeworkQueue] = useState([]);

  const [recentActivity, setRecentActivity] = useState([
    { time: '2 hours ago', action: 'Completed Literature Analysis', result: '92% score', type: 'success' },
    { time: '5 hours ago', action: 'Generated Poetry Practice Set', result: '5 poem analyses', type: 'info' },
    { time: '1 day ago', action: 'Uploaded Essay Draft', result: 'Writing style analyzed', type: 'analysis' },
    { time: '2 days ago', action: 'Grammar Quiz completed', result: '85% score', type: 'success' }
  ]);

  const [agentInsights, setAgentInsights] = useState([
    {
      type: 'recommendation',
      title: 'Grammar Focus Needed',
      message: 'Your subject-verb agreement in complex sentences needs attention. I\'ve generated targeted exercises to help.',
      priority: 'high'
    },
    {
      type: 'progress',
      title: 'Spelling Improvement',
      message: 'Your spelling accuracy has improved by 8% this week. Keep up the consistent practice!',
      priority: 'positive'
    },
    {
      type: 'tip',
      title: 'Quick Practice Tip',
      message: 'Try these 5-minute comma exercises between other activities to maintain momentum.',
      priority: 'medium'
    },
    {
      type: 'adaptive',
      title: 'Personalized Plan',
      message: 'Based on your progress, I\'ve adjusted the exercise difficulty for better learning pace.',
      priority: 'info'
    }
  ]);

  // No longer needed - removed initialization useEffect as we fetch real data

  const progressData = [
    { week: 'W1', Grammar: 75, Writing: 70, Reading: 80, Speaking: 78, Literature: 72 },
    { week: 'W2', Grammar: 78, Writing: 75, Reading: 82, Speaking: 80, Literature: 76 },
    { week: 'W3', Grammar: 82, Writing: 80, Reading: 85, Speaking: 83, Literature: 80 }
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('Received data:', data);
      setAnalysisResult(data);
      
      // Update radar chart data with the scores
      if (data.analysis && data.analysis.scores) {
        console.log('Processing scores:', data.analysis.scores);
        const scores = [
          { subject: 'Grammar', score: Math.round((parseFloat(data.analysis.scores.Grammar) || 0) * 20) },
          { subject: 'Vocabulary', score: Math.round((parseFloat(data.analysis.scores.Vocabulary) || 0) * 20) },
          { subject: 'Writing', score: Math.round((parseFloat(data.analysis.scores.Writing) || 0) * 20) },
          { subject: 'Spelling', score: Math.round((parseFloat(data.analysis.scores.Spelling) || 0) * 20) },
          { subject: 'Punctuation', score: Math.round((parseFloat(data.analysis.scores.Punctuation) || 0) * 20) }
        ];
        console.log('Normalized scores for radar chart:', scores);
        setRadarData(scores);
      }

      // Add new homework exercises to the queue
      if (data.homework) {
        console.log('Processing homework:', data.homework);
        let exercises = [];
        try {
          // Try parsing if it's a string
          const homeworkData = typeof data.homework === 'string' ? JSON.parse(data.homework) : data.homework;
          exercises = homeworkData.exercises || [];
        } catch (e) {
          console.error('Error parsing homework data:', e);
          exercises = Array.isArray(data.homework) ? data.homework : [];
        }

        console.log('Processed exercises:', exercises);

        // Process feedback to determine priority areas
        const feedbackPriorities = data.analysis.feedback.reduce((acc, feedback) => {
          if (feedback.startsWith('<grammar>')) acc.grammar = 'high';
          else if (feedback.startsWith('<vocabulary>')) acc.vocabulary = 'high';
          else if (feedback.startsWith('<writing>')) acc.writing = 'high';
          else if (feedback.startsWith('<spelling>')) acc.spelling = 'high';
          else if (feedback.startsWith('<punctuation>')) acc.punctuation = 'high';
          return acc;
        }, {});

        const newHomeworkItems = exercises.map((exercise, index) => {
          // Determine priority based on feedback
          const exerciseType = exercise.type?.toLowerCase() || '';
          const isPriorityArea = Object.entries(feedbackPriorities).some(([area, priority]) => 
            exerciseType.includes(area) && priority === 'high'
          );

          // Calculate difficulty based on scores
          let difficulty = 'Medium';
          if (data.analysis.scores) {
            const relevantScore = data.analysis.scores[exercise.type] || 0;
            if (relevantScore < 1.5) difficulty = 'Hard';
            else if (relevantScore > 3.5) difficulty = 'Easy';
          }

          return {
            id: Date.now() + index,
            subject: 'English',
            topic: exercise.type || 'Practice Exercise',
            difficulty: exercise.difficulty || difficulty,
            questions: 1,
            estimatedTime: '5-10 min',
            dueDate: 'Today',
            priority: isPriorityArea ? 'high' : 'medium',
            description: exercise.question || exercise.content || exercise.description || 'Practice this exercise',
            explanation: exercise.explanation || 'Complete the exercise to improve your skills',
            answer: exercise.answer || '',
            // Add context from the feedback
            context: data.analysis.feedback
              .filter(f => !f.startsWith('<') && f !== '')
              .find(f => f.toLowerCase().includes(exercise.type?.toLowerCase() || '')) || ''
          };
        });

        setHomeworkQueue(prevQueue => [...newHomeworkItems, ...prevQueue]);
        
        // Update student profile
        setStudentProfile(prev => ({
          ...prev,
          totalHomework: prev.totalHomework + newHomeworkItems.length
        }));

        // Add new insights based on analysis
        if (data.analysis.feedback) {
          const newInsights = data.analysis.feedback.map(feedback => ({
            type: 'analysis',
            title: 'Analysis Insight',
            message: feedback,
            priority: 'high'
          }));
          setAgentInsights(prev => [...newInsights, ...prev]);
        }

        // Notify user
        toast.success(`${newHomeworkItems.length} new exercises added to your homework queue!`);
      }

      // Add to recent activity
      setRecentActivity(prev => [{
        time: 'Just now',
        action: `Analyzed ${file.name}`,
        result: 'Generated homework',
        type: 'analysis'
      }, ...prev]);

      setNotifications(prev => prev + 1);

    } catch (error) {
      console.error('Upload error:', error);
      setAnalysisResult({ error: error.message });
      setAgentInsights(prev => [{
        type: 'error',
        title: 'Upload Failed',
        message: 'There was an error analyzing your document. Please try again.',
        priority: 'high'
      }, ...prev]);
      toast.error('Failed to analyze document');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [activeHomework, setActiveHomework] = useState(null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const cursorPositionRef = useRef(0);

  const handleAnswerChange = useCallback((e) => {
    cursorPositionRef.current = e.target.selectionStart;
    setStudentAnswer(e.target.value);
  }, []);

  useEffect(() => {
    if (answerTextareaRef.current) {
      answerTextareaRef.current.selectionStart = cursorPositionRef.current;
      answerTextareaRef.current.selectionEnd = cursorPositionRef.current;
    }
  }, [studentAnswer]);

  const startHomework = (homework) => {
    setActiveHomework(homework);
    setStudentAnswer('');
    // Focus the textarea after state updates
    setTimeout(() => {
      if (answerTextareaRef.current) {
        answerTextareaRef.current.focus();
      }
    }, 0);

    setRecentActivity(prev => [{
      time: 'Just now',
      action: `Started ${homework.subject} homework`,
      result: `Working on ${homework.topic}`,
      type: 'info'
    }, ...prev]);
  };

  const submitHomework = (homework) => {
    // Calculate score based on answer similarity (simplified for example)
    const expectedAnswer = homework.answer.toLowerCase();
    const givenAnswer = studentAnswer.toLowerCase();
    const score = expectedAnswer === givenAnswer ? 100 : 
                 givenAnswer.includes(expectedAnswer) || expectedAnswer.includes(givenAnswer) ? 80 : 
                 70;
    
    setHomeworkQueue(prev => prev.filter(hw => hw.id !== homework.id));
    setActiveHomework(null);
    setStudentAnswer('');
    setRecentActivity(prev => [{
      time: 'Just now',
      action: `Completed ${homework.subject} homework`,
      result: `${score}% score`,
      type: 'success'
    }, ...prev]);
    
    // Update subject scores
    setSubjects(prev => ({
      ...prev,
      [homework.subject]: {
        ...prev[homework.subject],
        score: Math.min(100, prev[homework.subject].score + (score > 80 ? 3 : score > 70 ? 1 : 0))
      }
    }));

    // Update radar chart data
    setRadarData(prev => prev.map(item => {
      // Determine which skill to improve based on homework topic
      const isRelevantSkill = homework.topic.toLowerCase().includes(item.subject.toLowerCase());
      if (isRelevantSkill) {
        const improvement = score >= 80 ? 5 : 2; // More points for better performance
        return {
          ...item,
          previousScore: item.score,
          score: Math.min(100, item.score + improvement),
          improvement: improvement
        };
      }
      return item;
    }));
  };

  const OverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Performance Chart */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Performance Overview</h2>
      
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid gridType="circle" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#4B5563', fontSize: 14 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 shadow-lg rounded-lg border">
                      <p className="font-medium">{data.subject}</p>
                      <p className="text-sm text-gray-600">Current: {data.score}%</p>
                      {data.previousScore > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          Previous: {data.previousScore}%
                          {data.improvement > 0 && ` (+${data.improvement})`}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }} />

              <Radar 
                name="Previous Score" 
                dataKey="previousScore" 
                stroke="#94A3B8" 
                fill="#94A3B8" 
                fillOpacity={0.2} 
                strokeWidth={1} 
                strokeDasharray="4 4"
              />
              <Radar 
                name="Current Score" 
                dataKey="score" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.4} 
                strokeWidth={2}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
     
      </div>
      
      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center mb-4">
            <Target className="mr-2" size={24} />
            <h3 className="text-lg font-semibold">This Week</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Homework Done</span>
              <span className="font-bold">{studentProfile.completedHomework}/{studentProfile.totalHomework}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Score</span>
              <span className="font-bold">{studentProfile.avgScore}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div className="bg-white h-2 rounded-full" style={{width: `${(studentProfile.completedHomework/studentProfile.totalHomework)*100}%`}}></div>
            </div>
          </div>
        </div>
        
        {/* AI Insights */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Brain className="mr-2 text-purple-500" size={20} />
            AI Insights
          </h3>
          <div className="space-y-4">
            {agentInsights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                insight.priority === 'high' ? 'border-red-400 bg-red-50' :
                insight.priority === 'positive' ? 'border-green-400 bg-green-50' :
                'border-blue-400 bg-blue-50'
              }`}>
                <h4 className="font-medium text-sm">{insight.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setCurrentView('homework')}
              className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="font-medium text-blue-800">View Homework</div>
              <div className="text-sm text-blue-600">{homeworkQueue.length} pending assignments</div>
            </button>
            <button 
              onClick={() => setCurrentView('upload')}
              className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="font-medium text-green-800">Upload Document</div>
              <div className="text-sm text-green-600">Get instant analysis</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const HomeworkTab = () => (
    <div className="space-y-6">
      {/* Pending Homework */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Target className="mr-2" size={24} />
            Pending Assignments ({homeworkQueue.length})
          </h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {homeworkQueue.map(homework => (
              <div key={homework.id} className={`border rounded-xl p-5 transition-all hover:shadow-md ${
              homework.priority === 'high' ? 'border-red-200 bg-red-50' :
              homework.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
              'border-gray-200'
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{homework.subject}</h3>
                  <p className="text-gray-600">{homework.topic}</p>
                  {homework.priority === 'high' && (
                    <span className="inline-flex items-center mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Priority Focus Area
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    homework.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    homework.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {homework.difficulty}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">Due: {homework.dueDate}</p>
                </div>
              </div>              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{homework.description}</p>
                </div>
                {homework.explanation && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-blue-800 mb-1">Hints</p>
                    <p className="text-sm text-gray-700">{homework.explanation}</p>
                  </div>
                )}
                {homework.context && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-purple-800 mb-1">Why This Exercise?</p>
                    <p className="text-sm text-gray-700">{homework.context}</p>
                  </div>
                )}
                
                {activeHomework?.id === homework.id && (
                  <div className="mt-4 bg-white rounded-lg border-2 border-blue-200 p-4">
                    <p className="text-sm font-medium text-blue-800 mb-2">Your Answer:</p>
                    <textarea
                      key={`answer-${homework.id}`}
                      ref={answerTextareaRef}
                      value={studentAnswer}
                      onChange={handleAnswerChange}
                      autoFocus
                      className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Type your answer here..."
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>📝 {homework.questions} questions</span>
                  <span>⏱️ {homework.estimatedTime}</span>
                </div>
                <div className="flex space-x-2">
                  {activeHomework?.id === homework.id ? (
                    <>
                      <button 
                        onClick={() => {
                          setActiveHomework(null);
                          setStudentAnswer('');
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => submitHomework(homework)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                        disabled={!studentAnswer.trim()}
                      >
                        Submit Answer
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => startHomework(homework)}
                        className="px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
                      >
                        Preview
                      </button>
                      <button 
                        onClick={() => startHomework(homework)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                      >
                        Start Assignment
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CheckCircle className="mr-2" size={20} />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'info' ? 'bg-blue-500' :
                  activity.type === 'analysis' ? 'bg-purple-500' :
                  'bg-gray-400'
                }`}></div>
                <div>
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
              <span className="text-sm text-gray-600">{activity.result}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const UploadTab = () => (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center">
          <Brain className="mx-auto mb-4" size={48} color="#3B82F6" />
          <h2 className="text-2xl font-bold mb-2">AI-Powered Document Analysis</h2>
          <p className="text-gray-600 mb-8">Upload your tests, assignments, or study materials for instant personalized insights</p>
        </div>
        
        <div className="max-w-md mx-auto">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isAnalyzing ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
            }`}
          >
            {isAnalyzing ? (
              <div className="space-y-4">
                <div className="relative w-12 h-12 mx-auto">
                  <div className="absolute inset-0 border-t-2 border-blue-500 rounded-full animate-[spin_0.6s_linear_infinite]"></div>
                  <div className="absolute inset-2 flex items-center justify-center">
                    <Brain size={20} color="#3B82F6" />
                  </div>
                </div>
                <p className="text-blue-600 font-medium">Analyzing your document...</p>
                <p className="text-sm text-gray-500">This may take a few moments</p>
              </div>
            ) : analysisResult?.error ? (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 mx-auto flex items-center justify-center bg-red-100 rounded-full">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <div>
                  <p className="text-red-600 font-medium">Analysis Failed</p>
                  <p className="text-sm text-gray-600 mt-1">{analysisResult.error}</p>
                  <button
                    onClick={() => setAnalysisResult(null)}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="mb-4" size={32} color="#6B7280" />
                  <span className="text-gray-900 font-medium">Drop your file here, or click to upload</span>
                  <p className="text-sm text-gray-500 mt-2">Supports PDF, images, and Word documents</p>
                </label>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && !isAnalyzing && (
        <div className="space-y-6">
          {/* Performance Radar */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
            <div className="space-y-6">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid gridType="circle" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#4B5563', fontSize: 14 }}
                  />
                  <Tooltip />
                  <Radar 
                    name="Score" 
                    dataKey="score" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.4} 
                  />
                </RadarChart>
              </ResponsiveContainer>

              {/* Feedback Section */}
              {analysisResult.analysis?.feedback && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-lg font-semibold">Detailed Feedback</h4>
                  <div className="grid gap-4">
                    {analysisResult.analysis.feedback.map((feedback, index) => {
                      // Skip empty strings and XML-like tags
                      if (!feedback || feedback.startsWith('<') || feedback === '') return null;
                      
                      return (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700">{feedback}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Original Text */}
              {analysisResult.analysis?.text && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-3">Analyzed Text</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">{analysisResult.analysis.text}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Homework Panel */}
          <HomeworkPanel exercises={analysisResult.homework.exercises} />
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4">
          <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <Eye size={24} color="#3B82F6" />
          </div>
          <h3 className="font-semibold mb-2">Instant Analysis</h3>
          <p className="text-sm text-gray-600">AI identifies strengths and weaknesses immediately</p>
        </div>
        <div className="text-center p-4">
          <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <Target size={24} color="#10B981" />
          </div>
          <h3 className="font-semibold mb-2">Custom Homework</h3>
          <p className="text-sm text-gray-600">Generate personalized practice based on your needs</p>
        </div>
        <div className="text-center p-4">
          <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <TrendingUp size={24} color="#8B5CF6" />
          </div>
          <h3 className="font-semibold mb-2">Track Progress</h3>
          <p className="text-sm text-gray-600">Monitor improvement over time with detailed analytics</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Brain className="mr-3" size={32} color="#3B82F6" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Rubrix AI</h1>
                <p className="text-sm text-gray-600">Personalized Learning Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell size={20} color="#6B7280" className="cursor-pointer hover:text-blue-600" />
                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="font-medium text-gray-900">{studentProfile.name}</p>
                  <p className="text-sm text-gray-600">{studentProfile.grade}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {studentProfile.avatar}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'homework', label: 'Homework', icon: Target },
              { id: 'upload', label: 'Upload & Analyze', icon: Upload }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    currentView === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'overview' && <OverviewTab />}
        {currentView === 'homework' && <HomeworkTab />}
        {currentView === 'upload' && <UploadTab />}
      </div>
    </div>
  );
};

export default MainDashboard;