'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Input, Spinner } from '@/components/ui';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Trash2, 
  GripVertical,
  Save,
  X,
  Edit2,
  ChevronUp,
  ChevronDown,
  Check,
  AlertCircle
} from 'lucide-react';

interface Assessment {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  duration: number;
  isActive: boolean;
  icon: string;
}

interface Question {
  id: string;
  text: string;
  category: string;
  order: number;
}

const defaultAssessments: Assessment[] = [
  {
    id: 'tki',
    name: 'TKI Conflict Style',
    description: 'Conflict resolution assessment',
    questionCount: 30,
    duration: 15,
    isActive: true,
    icon: '🎯'
  },
  {
    id: '360',
    name: '360° Feedback',
    description: 'Multi-rater feedback assessment',
    questionCount: 30,
    duration: 15,
    isActive: true,
    icon: '🔄'
  },
  {
    id: 'wellness',
    name: 'Wellness',
    description: 'Holistic well-being evaluation',
    questionCount: 30,
    duration: 15,
    isActive: true,
    icon: '🌿'
  }
];

const categoryOptions = [
  'Communication',
  'Leadership',
  'Team Culture',
  'Change Management',
  'Problem Solving',
  'Stress Management',
  'Work-Life Balance',
  'Physical Health',
  'Mental Health',
  'Social Connections',
  'Personal Growth',
  'Conflict Resolution'
];

export default function AdminAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>(defaultAssessments);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(defaultAssessments[2]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    duration: 15,
    questionCount: 0,
    isActive: true
  });
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ text: '', category: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionData, setEditingQuestionData] = useState({ text: '', category: '' });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedAssessment) {
      loadQuestions(selectedAssessment.id);
      setEditForm({
        name: selectedAssessment.name,
        description: selectedAssessment.description,
        duration: selectedAssessment.duration,
        questionCount: selectedAssessment.questionCount,
        isActive: selectedAssessment.isActive
      });
    }
  }, [selectedAssessment]);

  const loadQuestions = async (assessmentId: string) => {
    setIsLoading(true);
    try {
      const { authenticatedFetch } = await import('@/lib/token-refresh');
      const response = await authenticatedFetch(`/api/admin/assessments/${assessmentId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setQuestions([]);
    }
    setIsLoading(false);
  };

  const handleSaveSettings = async () => {
    if (!selectedAssessment) return;
    
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const { authenticatedFetch } = await import('@/lib/token-refresh');
      const response = await authenticatedFetch(`/api/admin/assessments/${selectedAssessment.id}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      
      if (response.ok) {
        setAssessments(prev => prev.map(a => 
          a.id === selectedAssessment.id 
            ? { ...a, ...editForm }
            : a
        ));
        setSelectedAssessment(prev => prev ? { ...prev, ...editForm } : null);
        setIsEditing(false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    }
    setIsSaving(false);
  };

  const handleAddQuestion = async () => {
    if (!selectedAssessment || !newQuestion.text) return;
    
    setSaveStatus('saving');
    try {
      const { authenticatedFetch } = await import('@/lib/token-refresh');
      const response = await authenticatedFetch(`/api/admin/assessments/${selectedAssessment.id}/questions`, {
        method: 'POST',
        body: JSON.stringify({
          text: newQuestion.text,
          category: newQuestion.category,
          order: questions.length
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuestions(prev => [...prev, data.question]);
        setNewQuestion({ text: '', category: '' });
        setShowAddQuestion(false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      setSaveStatus('error');
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditingQuestionData({ text: question.text, category: question.category });
  };

  const handleSaveQuestion = async () => {
    if (!selectedAssessment || !editingQuestionId) return;
    
    setSaveStatus('saving');
    try {
      const { authenticatedFetch } = await import('@/lib/token-refresh');
      const response = await authenticatedFetch(`/api/admin/assessments/${selectedAssessment.id}/questions/${editingQuestionId}`, {
        method: 'PUT',
        body: JSON.stringify(editingQuestionData),
      });
      
      if (response.ok) {
        setQuestions(prev => prev.map(q => 
          q.id === editingQuestionId 
            ? { ...q, ...editingQuestionData }
            : q
        ));
        setEditingQuestionId(null);
        setEditingQuestionData({ text: '', category: '' });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      setSaveStatus('error');
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditingQuestionData({ text: '', category: '' });
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!selectedAssessment) return;
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    setSaveStatus('saving');
    try {
      const { authenticatedFetch } = await import('@/lib/token-refresh');
      const response = await authenticatedFetch(`/api/admin/assessments/${selectedAssessment.id}/questions/${questionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      setSaveStatus('error');
    }
  };

  const handleMoveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    
    // Swap questions locally
    const newQuestions = [...questions];
    [newQuestions[currentIndex], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[currentIndex]];
    
    // Update order values
    newQuestions.forEach((q, idx) => {
      q.order = idx + 1;
    });
    
    setQuestions(newQuestions);
    
      // Save new order to backend
      setSaveStatus('saving');
      try {
        const { authenticatedFetch } = await import('@/lib/token-refresh');
        // Update both questions' order
        await Promise.all([
          authenticatedFetch(`/api/admin/assessments/${selectedAssessment?.id}/questions/${newQuestions[currentIndex].id}`, {
            method: 'PUT',
            body: JSON.stringify({ text: newQuestions[currentIndex].text, category: newQuestions[currentIndex].category, order: newQuestions[currentIndex].order }),
          }),
          authenticatedFetch(`/api/admin/assessments/${selectedAssessment?.id}/questions/${newQuestions[newIndex].id}`, {
            method: 'PUT',
            body: JSON.stringify({ text: newQuestions[newIndex].text, category: newQuestions[newIndex].category, order: newQuestions[newIndex].order }),
          })
        ]);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error reordering questions:', error);
      setSaveStatus('error');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Configuration</h1>
          <p className="text-gray-500">Configure questions for all assessments</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Migrate Questions Button */}
          <button
            onClick={async () => {
              if (!confirm('This will replace all existing questions with the default questions. Continue?')) return;
              setSaveStatus('saving');
              try {
                const { authenticatedFetch } = await import('@/lib/token-refresh');
                const response = await authenticatedFetch('/api/admin/migrate-questions', {
                  method: 'POST',
                });
                if (response.ok) {
                  const data = await response.json();
                  alert(`Migration successful!\nTKI: ${data.counts.tki} questions\nWellness: ${data.counts.wellness} questions\n360° Self: ${data.counts['360-self']} questions`);
                  if (selectedAssessment) {
                    loadQuestions(selectedAssessment.id);
                  }
                  setSaveStatus('saved');
                  setTimeout(() => setSaveStatus('idle'), 2000);
                } else {
                  setSaveStatus('error');
                }
              } catch (error) {
                console.error('Migration error:', error);
                setSaveStatus('error');
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Migrate Default Questions
          </button>
          
          {/* Save Status Indicator */}
          {saveStatus !== 'idle' && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              saveStatus === 'saving' ? 'bg-blue-100 text-blue-700' :
              saveStatus === 'saved' ? 'bg-green-100 text-green-700' :
              'bg-red-100 text-red-700'
            }`}>
              {saveStatus === 'saving' && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
              {saveStatus === 'saved' && <Check className="w-4 h-4" />}
              {saveStatus === 'error' && <AlertCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {saveStatus === 'saving' ? 'Saving...' :
                 saveStatus === 'saved' ? 'Saved!' :
                 'Error saving'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left Panel - Assessment List */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {assessments.map((assessment) => (
              <button
                key={assessment.id}
                onClick={() => setSelectedAssessment(assessment)}
                className={`w-full p-4 flex items-center gap-4 border-b border-gray-100 last:border-b-0 transition-colors ${
                  selectedAssessment?.id === assessment.id
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                  selectedAssessment?.id === assessment.id
                    ? 'bg-white/20'
                    : 'bg-gray-100'
                }`}>
                  {assessment.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${
                    selectedAssessment?.id === assessment.id ? 'text-white' : 'text-gray-900'
                  }`}>
                    {assessment.name}
                  </p>
                  <p className={`text-sm ${
                    selectedAssessment?.id === assessment.id ? 'text-white' : 'text-gray-500'
                  }`}>
                    {questions.length > 0 && selectedAssessment?.id === assessment.id 
                      ? `${questions.length} questions` 
                      : `${assessment.questionCount} questions`}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  assessment.isActive
                    ? selectedAssessment?.id === assessment.id
                      ? 'bg-green-400/30 text-green-100'
                      : 'bg-green-100 text-green-700'
                    : selectedAssessment?.id === assessment.id
                      ? 'bg-gray-400/30 text-gray-200'
                      : 'bg-gray-100 text-gray-500'
                }`}>
                  {assessment.isActive ? 'Active' : 'Inactive'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Assessment Details */}
        <div className="flex-1">
          {selectedAssessment ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              {/* Assessment Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedAssessment.name}</h2>
                    <p className="text-gray-500">{selectedAssessment.description}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Settings
                  </button>
                </div>

                {/* Settings Form */}
                {isEditing && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={editForm.duration}
                          onChange={(e) => setEditForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Questions
                        </label>
                        <input
                          type="number"
                          value={editForm.questionCount}
                          onChange={(e) => setEditForm(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editForm.isActive}
                          onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                          className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Active</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveSettings}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Questions Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
                    <p className="text-sm text-gray-500">
                      {questions.length} questions configured • Click to edit, drag to reorder
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddQuestion(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600"
                  >
                    <Plus className="w-4 h-4" />
                    Add question
                  </button>
                </div>

                {/* Add Question Form */}
                {showAddQuestion && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">New Question</h4>
                      <button onClick={() => setShowAddQuestion(false)}>
                        <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                        <textarea
                          placeholder="Enter the question text..."
                          value={newQuestion.text}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={newQuestion.category}
                          onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Select a category...</option>
                          {categoryOptions.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAddQuestion(false)}
                          className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddQuestion}
                          disabled={!newQuestion.text}
                          className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Question
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Questions List */}
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading questions...</p>
                  </div>
                ) : questions.length > 0 ? (
                  <div className="space-y-2">
                    {questions.sort((a, b) => a.order - b.order).map((question, index) => (
                      <div
                        key={question.id}
                        className={`flex items-start gap-3 p-4 rounded-lg group transition-colors ${
                          editingQuestionId === question.id 
                            ? 'bg-blue-50 border-2 border-blue-200' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        {/* Reorder Controls */}
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleMoveQuestion(question.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <button
                            onClick={() => handleMoveQuestion(question.id, 'down')}
                            disabled={index === questions.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Question Number */}
                        <span className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </span>
                        
                        {/* Question Content */}
                        <div className="flex-1 min-w-0">
                          {editingQuestionId === question.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={editingQuestionData.text}
                                onChange={(e) => setEditingQuestionData(prev => ({ ...prev, text: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                              />
                              <select
                                value={editingQuestionData.category}
                                onChange={(e) => setEditingQuestionData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              >
                                <option value="">Select a category...</option>
                                {categoryOptions.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleSaveQuestion}
                                  className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {(() => {
                                // Parse TKI questions (stored as JSON)
                                if (selectedAssessment?.id === 'tki' && question.category === 'tki_pair') {
                                  try {
                                    const parsed = JSON.parse(question.text);
                                    return (
                                      <div className="space-y-2">
                                        <p className="text-gray-900 font-medium">Pair {parsed.pair}</p>
                                        <div className="space-y-1 text-sm">
                                          <p className="text-gray-700"><span className="font-medium">A:</span> {parsed.statement_a}</p>
                                          <p className="text-gray-700"><span className="font-medium">B:</span> {parsed.statement_b}</p>
                                          <div className="flex gap-2 mt-2">
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">{parsed.mode_a}</span>
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">{parsed.mode_b}</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  } catch {
                                    return <p className="text-gray-900">{question.text}</p>;
                                  }
                                }
                                return <p className="text-gray-900">{question.text}</p>;
                              })()}
                              {question.category && question.category !== 'tki_pair' && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                                  {question.category}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        {editingQuestionId !== question.id && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditQuestion(question)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit question"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No questions configured</p>
                    <p className="text-sm text-gray-400 mb-4">Click &apos;Add Question&apos; to get started</p>
                    <button
                      onClick={() => setShowAddQuestion(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                    >
                      <Plus className="w-4 h-4" />
                      Add your first question
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-gray-500">Select an assessment to configure</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
