import React, { useState, useEffect } from 'react';
import { Upload, FileText, BarChart3, Brain, Target, BookOpen, CheckCircle, AlertTriangle, TrendingUp, User, Settings, LogOut, Bell, Search, Download, Eye } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';

const MainDashboard = () => {
  const [currentView, setCurrentView] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notifications, setNotifications] = useState(3);
  
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
    'Mathematics': { 
      score: 65, 
      trend: 'improving', 
      weakness: 'Quadratic Equations',
      strengths: ['Basic Algebra', 'Geometry'],
      recentActivity: 'Completed 3 assignments',
      nextFocus: 'Polynomial Functions'
    },
    'Physics': { 
      score: 45, 
      trend: 'needs-attention', 
      weakness: 'Newton\'s Laws',
      strengths: ['Kinematics'],
      recentActivity: 'Struggling with mechanics',
      nextFocus: 'Force and Motion'
    },
    'Chemistry': { 
      score: 80, 
      trend: 'excellent', 
      weakness: 'Organic Reactions',
      strengths: ['Periodic Table', 'Chemical Bonding'],
      recentActivity: 'Aced recent test',
      nextFocus: 'Thermodynamics'
    },
    'Biology': { 
      score: 70, 
      trend: 'stable', 
      weakness: 'Photosynthesis',
      strengths: ['Cell Structure', 'DNA'],
      recentActivity: 'Good progress',
      nextFocus: 'Ecology'
    },
    'English': { 
      score: 85, 
      trend: 'excellent', 
      weakness: 'Poetry Analysis',
      strengths: ['Essay Writing', 'Grammar'],
      recentActivity: 'Excellent essays',
      nextFocus: 'Literature Analysis'
    },
    'History': { 
      score: 60, 
      trend: 'improving', 
      weakness: 'World War II',
      strengths: ['Ancient History'],
      recentActivity: 'Making progress',
      nextFocus: 'Cold War Era'
    }
  });

  const [homeworkQueue, setHomeworkQueue] = useState([
    { 
      id: 1, 
      subject: 'Physics', 
      topic: 'Newton\'s Laws', 
      difficulty: 'Medium', 
      questions: 8, 
      estimatedTime: '45 min',
      dueDate: 'Today',
      priority: 'high',
      description: 'Focus on understanding force interactions and applications'
    },
    { 
      id: 2, 
      subject: 'Mathematics', 
      topic: 'Quadratic Equations', 
      difficulty: 'Hard', 
      questions: 6, 
      estimatedTime: '30 min',
      dueDate: 'Tomorrow',
      priority: 'medium',
      description: 'Practice solving complex quadratic problems'
    },
    { 
      id: 3, 
      subject: 'History', 
      topic: 'World War II', 
      difficulty: 'Medium', 
      questions: 5, 
      estimatedTime: '25 min',
      dueDate: 'In 2 days',
      priority: 'low',
      description: 'Analyze key events and their impacts'
    }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { time: '2 hours ago', action: 'Completed Chemistry homework', result: '92% score', type: 'success' },
    { time: '5 hours ago', action: 'AI generated Physics practice set', result: '8 personalized questions', type: 'info' },
    { time: '1 day ago', action: 'Uploaded Math test paper', result: 'Weaknesses identified', type: 'analysis' },
    { time: '2 days ago', action: 'Biology homework completed', result: '78% score', type: 'success' }
  ]);

  const [agentInsights, setAgentInsights] = useState([
    {
      type: 'recommendation',
      title: 'Focus on Physics',
      message: 'Your Physics score has dropped 5 points. I recommend dedicating 30 extra minutes daily.',
      priority: 'high'
    },
    {
      type: 'achievement',
      title: 'Chemistry Mastery!',
      message: 'Excellent progress in Chemistry! You\'ve improved 15 points this month.',
      priority: 'positive'
    },
    {
      type: 'tip',
      title: 'Study Tip',
      message: 'Try the Feynman technique for Physics concepts - explain them in simple terms.',
      priority: 'medium'
    }
  ]);

  // Prepare chart data
  const radarData = Object.entries(subjects).map(([subject, data]) => ({
    subject: subject.length > 8 ? subject.substring(0, 8) + '...' : subject,
    fullSubject: subject,
    score: data.score
  }));

  const progressData = [
    { week: 'W1', Mathematics: 60, Physics: 50, Chemistry: 75, Biology: 65, English: 80, History: 55 },
    { week: 'W2', Mathematics: 62, Physics: 48, Chemistry: 78, Biology: 68, English: 82, History: 58 },
    { week: 'W3', Mathematics: 65, Physics: 45, Chemistry: 80, Biology: 70, English: 85, History: 60 }
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsAnalyzing(true);
      
      setTimeout(() => {
        setIsAnalyzing(false);
        setRecentActivity(prev => [{
          time: 'Just now',
          action: `Analyzed ${file.name}`,
          result: 'New learning patterns identified',
          type: 'analysis'
        }, ...prev]);
        
        setNotifications(prev => prev + 1);
        
        // Simulate updating insights
        setAgentInsights(prev => [{
          type: 'analysis',
          title: 'New Document Analyzed',
          message: `Based on your uploaded ${file.name}, I've identified areas for improvement.`,
          priority: 'medium'
        }, ...prev.slice(0, 2)]);
      }, 3000);
    }
  };

  const startHomework = (homework) => {
    setRecentActivity(prev => [{
      time: 'Just now',
      action: `Started ${homework.subject} homework`,
      result: `Working on ${homework.topic}`,
      type: 'info'
    }, ...prev]);
  };

  const completeHomework = (homework) => {
    const score = Math.floor(Math.random() * 30) + 70;
    
    setHomeworkQueue(prev => prev.filter(hw => hw.id !== homework.id));
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
  };

  const OverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Performance Chart */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Performance Overview</h2>
            <div className="flex space-x-2">
              <button className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">This Month</button>
              <button className="text-sm px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg">All Time</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" className="text-sm" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
              <Radar name="Current Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Progress Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="Mathematics" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Physics" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Chemistry" stackId="1" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
            </AreaChart>
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

  const SubjectsTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(subjects).map(([subject, data]) => (
        <div key={subject} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">{subject}</h3>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              data.trend === 'excellent' ? 'bg-green-100 text-green-800' :
              data.trend === 'improving' ? 'bg-blue-100 text-blue-800' :
              data.trend === 'stable' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {data.trend === 'needs-attention' ? 'Needs Attention' : data.trend}
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Current Score</span>
              <span className="font-semibold">{data.score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  data.score >= 80 ? 'bg-green-500' :
                  data.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${data.score}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-red-600 font-medium">Focus Area: </span>
              <span>{data.weakness}</span>
            </div>
            <div>
              <span className="text-green-600 font-medium">Strengths: </span>
              <span>{data.strengths.join(', ')}</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Next Topic: </span>
              <span>{data.nextFocus}</span>
            </div>
            <div className="pt-2 border-t">
              <span className="text-gray-500">{data.recentActivity}</span>
            </div>
          </div>
          
          <button 
            className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Generate Practice Set
          </button>
        </div>
      ))}
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
              </div>
              
              <p className="text-sm text-gray-700 mb-4">{homework.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>📝 {homework.questions} questions</span>
                  <span>⏱️ {homework.estimatedTime}</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => startHomework(homework)}
                    className="px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
                  >
                    Preview
                  </button>
                  <button 
                    onClick={() => completeHomework(homework)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                  >
                    Start Assignment
                  </button>
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
          <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            isAnalyzing ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}>
            {isAnalyzing ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-blue-600 font-medium">Analyzing your document...</p>
                <p className="text-sm text-gray-600">This may take a few seconds</p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto mb-4" size={40} color="#6B7280" />
                  <p className="text-lg font-medium text-gray-700 mb-2">Drop your file here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX, TXT, images</p>
                </label>
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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
                <h1 className="text-xl font-bold text-gray-900">EduAgent AI</h1>
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
              { id: 'subjects', label: 'Subjects', icon: BookOpen },
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
        {currentView === 'subjects' && <SubjectsTab />}
        {currentView === 'homework' && <HomeworkTab />}
        {currentView === 'upload' && <UploadTab />}
      </div>
    </div>
  );
};

export default MainDashboard;