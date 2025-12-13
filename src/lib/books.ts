/**
 * Recommended books data
 * Shared across the development page and books page
 */

export interface Book {
  id: number;
  title: string;
  author: string;
  image: string;
  category: string;
  description: string;
  rating: number;
}

export const recommendedBooks: Book[] = [
  {
    id: 1,
    title: 'Dare to Lead',
    author: 'Brené Brown',
    image: '/book-placeholder.svg',
    category: 'Leadership',
    description: 'A powerful guide to courageous leadership and building brave cultures. Learn how to step up, be brave, and have difficult conversations.',
    rating: 4.8,
  },
  {
    id: 2,
    title: 'Crucial Conversations',
    author: 'Patterson, Grenny, et al.',
    image: '/book-placeholder.svg',
    category: 'Communication',
    description: 'Tools for talking when stakes are high, opinions vary, and emotions run strong. Master the art of dialogue.',
    rating: 4.7,
  },
  {
    id: 3,
    title: 'The 7 Habits of Highly Effective People',
    author: 'Stephen Covey',
    image: '/book-placeholder.svg',
    category: 'Personal Growth',
    description: 'A powerful lesson in personal change and effectiveness. Transform your life with these timeless principles.',
    rating: 4.6,
  },
  {
    id: 4,
    title: 'Emotional Intelligence',
    author: 'Daniel Goleman',
    image: '/book-placeholder.svg',
    category: 'Self-Awareness',
    description: 'Why it can matter more than IQ for success in life and work. Develop your emotional intelligence skills.',
    rating: 4.5,
  },
  {
    id: 5,
    title: 'Leaders Eat Last',
    author: 'Simon Sinek',
    image: '/book-placeholder.svg',
    category: 'Leadership',
    description: 'Why some teams pull together and others don\'t. Discover the secrets of great leadership.',
    rating: 4.7,
  },
  {
    id: 6,
    title: 'The Five Dysfunctions of a Team',
    author: 'Patrick Lencioni',
    image: '/book-placeholder.svg',
    category: 'Team Building',
    description: 'A leadership fable about overcoming the five dysfunctions that stand in the way of team success.',
    rating: 4.6,
  },
  {
    id: 7,
    title: 'Mindset: The New Psychology of Success',
    author: 'Carol S. Dweck',
    image: '/book-placeholder.svg',
    category: 'Personal Growth',
    description: 'How we can learn to fulfill our potential. Understand the power of growth mindset.',
    rating: 4.5,
  },
  {
    id: 8,
    title: 'Good to Great',
    author: 'Jim Collins',
    image: '/book-placeholder.svg',
    category: 'Leadership',
    description: 'Why some companies make the leap and others don\'t. Learn the principles of exceptional performance.',
    rating: 4.6,
  },
  {
    id: 9,
    title: 'Atomic Habits',
    author: 'James Clear',
    image: '/book-placeholder.svg',
    category: 'Personal Growth',
    description: 'An easy and proven way to build good habits and break bad ones. Small changes that make a big difference.',
    rating: 4.8,
  },
  {
    id: 10,
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    image: '/book-placeholder.svg',
    category: 'Self-Awareness',
    description: 'A guide to spiritual enlightenment. Learn to live in the present moment.',
    rating: 4.4,
  },
  {
    id: 11,
    title: 'Drive: The Surprising Truth About What Motivates Us',
    author: 'Daniel H. Pink',
    image: '/book-placeholder.svg',
    category: 'Leadership',
    description: 'The secret to high performance and satisfaction. Understand what truly motivates people.',
    rating: 4.5,
  },
  {
    id: 12,
    title: 'Radical Candor',
    author: 'Kim Scott',
    image: '/book-placeholder.svg',
    category: 'Communication',
    description: 'How to be a kick-ass boss without losing your humanity. Master the art of feedback.',
    rating: 4.6,
  },
];

export const bookCategories = ['All', 'Leadership', 'Communication', 'Personal Growth', 'Self-Awareness', 'Team Building'];
