import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Eye, ArrowRight, AlertCircle } from 'lucide-react';

const HomeworkPanel = ({ exercises = [] }) => {
  useEffect(() => {
    // Reset selected exercise when exercises change
    setSelectedExercise(null);
    setShowAnswer(false);
  }, [exercises]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  if (!exercises || exercises.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <BookOpen className="mx-auto mb-4" size={48} color="#6B7280" />
        <h3 className="text-lg font-semibold text-gray-900">No Homework Yet</h3>
        <p className="text-gray-600">Upload a document to get personalized exercises</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Exercise List */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BookOpen className="mr-2" size={20} />
          Practice Exercises
        </h3>
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all cursor-pointer hover:border-blue-500 ${
                selectedExercise === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => {
                setSelectedExercise(index);
                setShowAnswer(false);
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-blue-600">{exercise.type}</span>
                  <h4 className="text-gray-900 mt-1">{exercise.question}</h4>
                </div>
                <ArrowRight 
                  size={20} 
                  className={`transition-transform ${selectedExercise === index ? 'rotate-90' : ''}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Exercise Detail */}
      {selectedExercise !== null && (
        <div className="p-6 bg-gray-50 rounded-b-xl">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              Exercise {selectedExercise + 1}: {exercises[selectedExercise].type}
            </h4>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-900">{exercises[selectedExercise].question}</p>
            </div>

            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Eye size={16} />
                Show Answer
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle size={16} />
                  Answer
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-gray-900">{exercises[selectedExercise].answer}</p>
                </div>
                <div className="mt-2">
                  <h5 className="text-sm font-medium text-gray-900 mb-1">Explanation:</h5>
                  <p className="text-gray-600">{exercises[selectedExercise].explanation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeworkPanel;
