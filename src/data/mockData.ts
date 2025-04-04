
import { Dashboard, QuizQuestion, QuizResponse, Role, Session, Student } from "../types";

export const mockActiveQuestion: QuizQuestion = {
  id: "q1",
  question: "Which of the following best describes the principle of 'encapsulation' in object-oriented programming?",
  options: [
    "Hiding the implementation details of a class and exposing only necessary interfaces",
    "Creating multiple instances of a class with different properties",
    "Inheriting properties and methods from parent classes",
    "Converting one data type to another data type"
  ],
  correctOptionIndex: 0,
  timestamp: new Date().toISOString(),
  topicTag: "Object-Oriented Programming",
  transcriptSegment: "Today we're discussing key principles of object-oriented programming. Encapsulation is one of the fundamental concepts where we hide the internal state and implementation details of an object and only expose what's necessary through well-defined interfaces."
};

export const mockResponses: QuizResponse[] = [
  {
    id: "r1",
    questionId: "q1",
    studentId: "s1",
    selectedOptionIndex: 0,
    isCorrect: true,
    responseTime: 8.2,
    timestamp: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: "r2",
    questionId: "q1",
    studentId: "s2",
    selectedOptionIndex: 2,
    isCorrect: false,
    responseTime: 12.5,
    timestamp: new Date(Date.now() - 100000).toISOString()
  },
  {
    id: "r3",
    questionId: "q1",
    studentId: "s3",
    selectedOptionIndex: 0,
    isCorrect: true,
    responseTime: 6.7,
    timestamp: new Date(Date.now() - 90000).toISOString()
  },
  {
    id: "r4",
    questionId: "q1",
    studentId: "s4",
    selectedOptionIndex: 3,
    isCorrect: false,
    responseTime: 15.1,
    timestamp: new Date(Date.now() - 60000).toISOString()
  },
  {
    id: "r5",
    questionId: "q1",
    studentId: "s5",
    selectedOptionIndex: 0,
    isCorrect: true,
    responseTime: 9.8,
    timestamp: new Date(Date.now() - 30000).toISOString()
  }
];

export const mockStudents: Student[] = [
  { id: "s1", name: "Alex Johnson", responses: [mockResponses[0]], attentionScore: 92 },
  { id: "s2", name: "Sam Taylor", responses: [mockResponses[1]], attentionScore: 78 },
  { id: "s3", name: "Jordan Lee", responses: [mockResponses[2]], attentionScore: 95 },
  { id: "s4", name: "Casey Williams", responses: [mockResponses[3]], attentionScore: 65 },
  { id: "s5", name: "Riley Brown", responses: [mockResponses[4]], attentionScore: 88 },
  { id: "s6", name: "Quinn Davis", responses: [], attentionScore: 50 },
  { id: "s7", name: "Morgan Wilson", responses: [], attentionScore: 72 }
];

export const mockSession: Session = {
  id: "session1",
  title: "Advanced Programming Concepts",
  professorId: "p1",
  startTime: new Date(Date.now() - 3600000).toISOString(), // Started 1 hour ago
  quizFrequencyMinutes: 20,
  topicTags: ["Object-Oriented Programming", "Data Structures", "Algorithms", "Software Engineering"],
  questions: [mockActiveQuestion],
  activeStudents: 7
};

export const mockDashboard: Dashboard = {
  session: mockSession,
  activeQuestion: mockActiveQuestion,
  studentResponses: mockResponses,
  students: mockStudents,
  participationRate: 71, // 5/7 students participated
  correctAnswerRate: 60, // 3/5 answers correct
  attentionOverTime: [
    { time: "14:00", score: 95 },
    { time: "14:05", score: 92 },
    { time: "14:10", score: 88 },
    { time: "14:15", score: 85 },
    { time: "14:20", score: 90 },
    { time: "14:25", score: 87 },
    { time: "14:30", score: 83 },
    { time: "14:35", score: 80 },
    { time: "14:40", score: 85 },
    { time: "14:45", score: 88 },
    { time: "14:50", score: 85 },
    { time: "14:55", score: 82 },
    { time: "15:00", score: 78 }
  ]
};

export const mockUpcomingQuestions: QuizQuestion[] = [
  {
    id: "q2",
    question: "What is the time complexity of a binary search algorithm?",
    options: [
      "O(1)",
      "O(log n)",
      "O(n)",
      "O(n²)"
    ],
    correctOptionIndex: 1,
    timestamp: new Date(Date.now() + 600000).toISOString(), // 10 minutes in the future
    topicTag: "Algorithms"
  },
  {
    id: "q3",
    question: "Which data structure uses LIFO (Last In, First Out) principle?",
    options: [
      "Queue",
      "Stack",
      "Linked List",
      "Tree"
    ],
    correctOptionIndex: 1,
    timestamp: new Date(Date.now() + 1800000).toISOString(), // 30 minutes in the future
    topicTag: "Data Structures"
  }
];
