export type Topic = {
  id: string;
  title: string;
};

export type Question = {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

export type Quiz = {
  id: string;
  topics: Topic[];
  questions: Question[];
};

export type QuestionAttempt = {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
};

// Database Types
export interface DbQuiz {
  id: string;
  user_id: string;
  title: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  difficulty: string;
  created_at: string;
  updated_at: string;
}

export interface DbQuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  percentage: number;
  answers: {
    questionIndex: number;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
  time_taken_seconds?: number;
  completed_at: string;
  // Joined data
  quiz?: DbQuiz;
}

export interface DbFavoriteQuiz {
  id: string;
  user_id: string;
  quiz_id: string;
  created_at: string;
  // Joined data
  quiz?: DbQuiz;
}

// Analytics Types
export interface QuizAnalytics {
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  averageScore: number;
  bestScore: number;
  recentAttempts: DbQuizAttempt[];
  scoreDistribution: { range: string; count: number }[];
  performanceOverTime: { date: string; avgScore: number; count: number }[];
}

// Analytics API Response Type
export interface AnalyticsData {
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
  topicBreakdown: {
    topic: string;
    attempts: number;
    avgScore: number;
  }[];
  recentAttempts: {
    id: string;
    quizTitle: string;
    score: number;
    timeTaken: number;
    completedAt: string;
  }[];
}
