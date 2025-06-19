## prompt for generating educational flashcards from HTML content
[
  {
    "_id": { "$oid": "1234567890abcdef12345678" },
    "Question": "What is the capital of France?",
    "Answer": "Paris",
    "Score": 0,
    "DeckId": "geography",
    "Explanation": "Paris is the capital city of France.",
    "topic": "Geography"
  },
  {
    "_id": { "$oid": "abcdef1234567890abcdef12" },
    "Question": "What is the chemical symbol for water?",
    "Answer": "H2O",
    "Score": 0,
    "DeckId": "chemistry",
    "Explanation": "Water is composed of two hydrogen atoms and one oxygen atom.",
    "topic": "Chemistry"
  }
]

You are an AI assistant that generates educational flashcards.

Please read the following HTML content from a web page and extract as many question-and-answer pairs as possible. Format each flashcard as a JSON object with the following structure:

{
  "_id": { "$oid": "<24-character unique string>" },
  "Question": "<question text>",
  "Answer": "<concise answer>",
  "Score": 0,
  "DeckId": "<subject name, e.g., 'python'>",
  "Explanation": "<optional explanation or same as answer>",
  "topic": "<topic name>"
}

Return an array of JSON flashcards. Avoid duplicate or irrelevant content.

Here is the webpage content:
<INSERT HTML OR TEXT CONTENT HERE>


page 177
