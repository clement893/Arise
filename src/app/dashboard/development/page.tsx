'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { ArrowLeft, CheckCircle, Circle, BookOpen, Target, TrendingUp, Calendar, ChevronRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
}

// Development objectives
const developmentObjectives = [
  {
    id: 1,
    title: 'Improve active listening skills',
    description: 'Practice reflective listening in meetings and one-on-ones. Summarize what others say before responding to ensure understanding.',
    status: 'in_progress',
    dueDate: '2024-03-15',
    category: 'Communication',
  },
  {
    id: 2,
    title: 'Develop conflict resolution approach',
    description: 'Apply TKI insights to adapt conflict style based on situation. Practice collaborative problem-solving techniques.',
    status: 'not_started',
    dueDate: '2024-04-01',
    category: 'Leadership',
  },
  {
    id: 3,
    title: 'Build team psychological safety',
    description: 'Create an environment where team members feel safe to take risks and voice concerns without fear of negative consequences.',
    status: 'completed',
    dueDate: '2024-02-28',
    category: 'Team Culture',
  },
];

// Recommended books
const recommendedBooks = [
  {
    id: 1,
    title: 'Dare to Lead',
    author: 'Brené Brown',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=300&fit=crop',
    category: 'Leadership',
  },
  {
    id: 2,
    title: 'Crucial Conversations',
    author: 'Patterson, Grenny, et al.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=300&fit=crop',
    category: 'Communication',
  },
  {
    id: 3,
    title: 'The 7 Habits',
    author: 'Stephen Covey',
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&h=300&fit=crop',
    category: 'Personal Growth',
  },
  {
    id: 4,
    title: 'Emotional Intelligence',
    author: 'Daniel Goleman',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&h=300&fit=crop',
    category: 'Self-Awareness',
  },
];

// Growth activities
const growthActivities = [
  { id: 1, text: 'Set up weekly one-on-one meetings with direct reports', completed: true },
  { id: 2, text: 'Practice active listening in next 3 meetings', completed: true },
  { id: 3, text: 'Complete online course on conflict resolution', completed: false },
  { id: 4, text: 'Schedule feedback session with manager', completed: false },
  { id: 5, text: 'Join leadership peer coaching group', completed: false },
];

// Key updates / milestones
const keyUpdates = [
  {
    id: 1,
    date: '2024-01-15',
    title: 'Completed MBTI Assessment',
    description: 'Identified as ENFJ - The Protagonist',
    type: 'achievement',
  },
  {
    id: 2,
    date: '2024-01-20',
    title: 'TKI Results Available',
    description: 'Dominant style: Collaborating (8/12)',
    type: 'result',
  },
  {
    id: 3,
    date: '2024-02-01',
    title: 'Started Development Plan',
    description: '3 objectives defined with coach',
    type: 'milestone',
  },
  {
    id: 4,
    date: '2024-02-15',
    title: 'First Objective Completed',
    description: 'Team psychological safety improved',
    type: 'achievement',
  },
];

// Profile scores
const profileScores = [
  { label: 'MBTI', value: 'ENFJ', color: '#0D5C5C' },
  { label: 'TKI Dominant', value: 'Collaborating', color: '#27ae60' },
  { label: '360° Score', value: '4.2/5', color: '#9b59b6' },
  { label: 'Light score', value: '78%', color: '#D4A84B' },
];

export default function DevelopmentPlanPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState(growthActivities);

  useEffect(() => {
    const userData = localStorage.getItem('arise_user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('arise_user');
    localStorage.removeItem('arise_signup_data');
    router.push('/');
  };

  const toggleActivity = (id: number) => {
    setActivities(activities.map(a => 
      a.id === id ? { ...a, completed: !a.completed } : a
    ));
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0D5C5C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4A84B]"></div>
      </div>
    );
  }

  const completedObjectives = developmentObjectives.filter(o => o.status === 'completed').length;
  const completedActivities = activities.filter(a => a.completed).length;

  return (
    <div className="min-h-screen bg-[#f0f5f5] flex">
      <Sidebar user={user} activePage="development" onLogout={handleLogout} />
      
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Development plan & Resources</h1>
                <p className="text-gray-600">Track your growth journey and access learning materials</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#0D5C5C] text-white rounded-lg hover:bg-[#0a4a4a] transition-colors text-sm font-medium">
              + Add objective
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Objectives & Activities */}
            <div className="lg:col-span-2 space-y-6">
              {/* Development Objectives */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#0D5C5C]" />
                    Development Objectives
                  </h2>
                  <span className="text-sm text-gray-500">{completedObjectives}/{developmentObjectives.length} completed</span>
                </div>

                <div className="space-y-4">
                  {developmentObjectives.map((objective) => (
                    <div 
                      key={objective.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        objective.status === 'completed' 
                          ? 'border-green-200 bg-green-50' 
                          : objective.status === 'in_progress'
                          ? 'border-[#D4A84B]/30 bg-[#D4A84B]/5'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {objective.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-medium ${objective.status === 'completed' ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                              {objective.title}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              objective.status === 'completed' 
                                ? 'bg-green-100 text-green-700'
                                : objective.status === 'in_progress'
                                ? 'bg-[#D4A84B]/20 text-[#D4A84B]'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {objective.status === 'completed' ? 'Completed' : objective.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{objective.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {new Date(objective.dueDate).toLocaleDateString()}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded">{objective.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Books */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#0D5C5C]" />
                    Recommended Books
                  </h2>
                  <button className="text-sm text-[#0D5C5C] hover:underline flex items-center gap-1">
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {recommendedBooks.map((book) => (
                    <div key={book.id} className="group cursor-pointer">
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                        <Image
                          src={book.image}
                          alt={book.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <ExternalLink className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 truncate">{book.title}</h3>
                      <p className="text-xs text-gray-500 truncate">{book.author}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth Activities */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#0D5C5C]" />
                    Growth Activities
                  </h2>
                  <span className="text-sm text-gray-500">{completedActivities}/{activities.length} completed</span>
                </div>

                <div className="space-y-3">
                  {activities.map((activity) => (
                    <label 
                      key={activity.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={activity.completed}
                        onChange={() => toggleActivity(activity.id)}
                        className="w-5 h-5 rounded border-gray-300 text-[#0D5C5C] focus:ring-[#0D5C5C]"
                      />
                      <span className={`text-sm ${activity.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                        {activity.text}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-[#0D5C5C]">{Math.round((completedActivities / activities.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#0D5C5C] rounded-full transition-all duration-300"
                      style={{ width: `${(completedActivities / activities.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Updates & Profile */}
            <div className="space-y-6">
              {/* Your Global Profile */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your global profile</h2>
                <div className="grid grid-cols-2 gap-3">
                  {profileScores.map((score, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg text-center"
                      style={{ backgroundColor: `${score.color}10` }}
                    >
                      <p className="text-xs text-gray-600 mb-1">{score.label}</p>
                      <p className="font-bold" style={{ color: score.color }}>{score.value}</p>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => router.push('/dashboard/results')}
                  className="w-full mt-4 py-2 text-sm text-[#0D5C5C] border border-[#0D5C5C] rounded-lg hover:bg-[#0D5C5C]/5 transition-colors"
                >
                  View full results
                </button>
              </div>

              {/* Key Updates */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Key updates</h2>
                <div className="space-y-4">
                  {keyUpdates.map((update, index) => (
                    <div key={update.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          update.type === 'achievement' ? 'bg-green-500' :
                          update.type === 'result' ? 'bg-[#D4A84B]' : 'bg-[#0D5C5C]'
                        }`} />
                        {index < keyUpdates.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-xs text-gray-500 mb-1">
                          {new Date(update.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <h3 className="text-sm font-medium text-gray-900">{update.title}</h3>
                        <p className="text-xs text-gray-600">{update.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Card */}
              <div className="bg-[#2D2D2D] rounded-xl p-6 text-center">
                <h3 className="text-lg font-bold text-white mb-2">Ready to accelerate your growth?</h3>
                <p className="text-gray-400 text-sm mb-4">Get personalized coaching to reach your leadership potential</p>
                <button className="w-full py-3 bg-[#D4A84B] text-[#2D2D2D] font-semibold rounded-lg hover:bg-[#c49a42] transition-colors">
                  Book a coaching session
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
