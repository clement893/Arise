'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  ArrowLeft,
  GripVertical,
  AlertCircle
} from 'lucide-react';
import { Button, Input, Card, LoadingInline } from '@/components/ui';
import { authenticatedFetch } from '@/lib/token-refresh';

interface Question {
  id: number;
  text: string;
  category?: string | null;
  order: number;
  assessmentType: string;
}

const assessmentTypes: Record<string, { name: string; description: string }> = {
  tki: { name: 'TKI Conflict Style', description: 'Thomas-Kilmann Conflict Mode Instrument' },
  wellness: { name: 'Wellness Assessment', description: 'Holistic well-being evaluation' },
  '360-self': { name: '360° Self Assessment', description: 'Multi-rater feedback assessment' },
  mbti: { name: 'MBTI', description: 'Myers-Briggs Type Indicator' },
};

export default function QuestionsManagementPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params?.id as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingCategory, setEditingCategory] = useState('');
  const [editingOrder, setEditingOrder] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const assessmentInfo = assessmentTypes[assessmentId] || { name: assessmentId, description: '' };

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authenticatedFetch(`/api/admin/assessments/${assessmentId}/questions`);
      
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to load questions');
      }
    } catch (err) {
      console.error('Error loading questions:', err);
      setError('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setEditingText(question.text);
    setEditingCategory(question.category || '');
    setEditingOrder(question.order);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
    setEditingCategory('');
    setEditingOrder(0);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingText.trim()) {
      setError('Question text is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const response = await authenticatedFetch(
        `/api/admin/assessments/${assessmentId}/questions/${editingId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            text: editingText.trim(),
            category: editingCategory.trim() || null,
            order: editingOrder,
          }),
        }
      );

      if (response.ok) {
        await loadQuestions();
        handleCancelEdit();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to update question');
      }
    } catch (err) {
      console.error('Error updating question:', err);
      setError('Failed to update question');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const response = await authenticatedFetch(
        `/api/admin/assessments/${assessmentId}/questions/${questionId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        await loadQuestions();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to delete question');
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newQuestionText.trim()) {
      setError('Question text is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const response = await authenticatedFetch(
        `/api/admin/assessments/${assessmentId}/questions`,
        {
          method: 'POST',
          body: JSON.stringify({
            text: newQuestionText.trim(),
            category: newQuestionCategory.trim() || null,
            order: questions.length,
          }),
        }
      );

      if (response.ok) {
        await loadQuestions();
        setNewQuestionText('');
        setNewQuestionCategory('');
        setIsCreating(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to create question');
      }
    } catch (err) {
      console.error('Error creating question:', err);
      setError('Failed to create question');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <LoadingInline message="Loading questions..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/assessments')}
          className="mb-4"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Assessments
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {assessmentInfo.name} - Questions
        </h1>
        <p className="text-gray-600">{assessmentInfo.description}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Create New Question */}
      <Card className="mb-6 p-6">
        {!isCreating ? (
          <Button
            onClick={() => setIsCreating(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Question
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text *
              </label>
              <Input
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Enter question text..."
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category (optional)
                </label>
                <Input
                  value={newQuestionCategory}
                  onChange={(e) => setNewQuestionCategory(e.target.value)}
                  placeholder="e.g., Communication, Wellness..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <Input
                  type="number"
                  value={questions.length}
                  disabled
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={isSaving || !newQuestionText.trim()}
                leftIcon={<Save className="w-4 h-4" />}
              >
                {isSaving ? 'Creating...' : 'Create Question'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewQuestionText('');
                  setNewQuestionCategory('');
                }}
                leftIcon={<X className="w-4 h-4" />}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Questions List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Questions ({questions.length})
        </h2>

        {questions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No questions found. Click "Add New Question" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                {editingId === question.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <Input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category (optional)
                        </label>
                        <Input
                          value={editingCategory}
                          onChange={(e) => setEditingCategory(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Order
                        </label>
                        <Input
                          type="number"
                          value={editingOrder}
                          onChange={(e) => setEditingOrder(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveEdit}
                        disabled={isSaving || !editingText.trim()}
                        leftIcon={<Save className="w-4 h-4" />}
                        size="sm"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        leftIcon={<X className="w-4 h-4" />}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                      <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">
                          #{question.order + 1}
                        </span>
                        {question.category && question.category !== 'tki_pair' && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {question.category}
                          </span>
                        )}
                      </div>
                      {(() => {
                        // Parse TKI questions (stored as JSON)
                        if (assessmentId === 'tki' && question.category === 'tki_pair') {
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
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        onClick={() => handleEdit(question)}
                        leftIcon={<Edit2 className="w-4 h-4" />}
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(question.id)}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
