export interface Flashcard {
    id: string;
    question: string;
    answer: string;
    score: number;
    deckId: string;
    explanation: string;
    questionImage?: string;
    answerImage?: string;
    explanationImage?: string;
    topic: string;
  }
