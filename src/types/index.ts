
export type Role = "student" | "professor";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  topicTag?: string;
  timestamp: string;
  transcriptSegment?: string;
}

export interface QuizResponse {
  id: string;
  questionId: string;
  studentId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  responseTime: number;
  timestamp: string;
}

export interface Student {
  id: string;
  name: string;
  responses: QuizResponse[];
  attentionScore: number;
}

export interface Session {
  id: string;
  title: string;
  professorId: string;
  startTime: string;
  endTime?: string;
  quizFrequencyMinutes: number;
  topicTags: string[];
  questions: QuizQuestion[];
  activeStudents: number;
}

export interface AttentionPoint {
  time: string;
  score: number;
}

export interface Dashboard {
  session: Session;
  activeQuestion?: QuizQuestion;
  studentResponses: QuizResponse[];
  students: Student[];
  participationRate: number;
  correctAnswerRate: number;
  attentionOverTime: AttentionPoint[];
}
