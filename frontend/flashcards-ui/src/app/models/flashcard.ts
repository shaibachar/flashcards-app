export interface Flashcard {
    id: string;
    question: string;
    /**
     * Alternate phrasings for the question. The backend always
     * returns this array (possibly empty) so treat it as required
     * on the frontend as well to simplify template bindings.
     */
    questions: string[];
    answer: string;
    score: number;
    deckId: string;
    explanation: string;
    questionImage?: string;
    answerImage?: string;
    explanationImage?: string;
    topic: string;
  }
