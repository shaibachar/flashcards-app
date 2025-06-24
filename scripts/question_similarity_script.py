#!/usr/bin/env python3
"""
Question Similarity Search using Embeddings

This script loads a JSON file containing questions and answers, creates vector embeddings
for each question, and provides functionality to find similar questions based on 
semantic similarity using cosine similarity.

Requirements:
pip install sentence-transformers numpy scikit-learn

Author: Assistant
Date: 2024
"""

import json
import numpy as np
from typing import List, Dict, Tuple, Optional
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import logging

# Configure logging for debugging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class QuestionSimilaritySearch:
    """
    A class to handle question similarity search using sentence embeddings.
    
    This class uses a pre-trained sentence transformer model to convert questions
    into high-dimensional vectors (embeddings) and then uses cosine similarity
    to find semantically similar questions.
    """
    
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        Initialize the similarity search with a sentence transformer model.
        
        Args:
            model_name (str): Name of the sentence transformer model to use.
                             'all-MiniLM-L6-v2' is a good balance of speed and quality.
                             Other options: 'all-mpnet-base-v2' (better quality, slower)
                                          'all-distilroberta-v1' (good for longer texts)
        """
        logger.info(f"Loading sentence transformer model: {model_name}")
        
        # Load the pre-trained sentence transformer model
        # This model converts text into 384-dimensional vectors
        self.model = SentenceTransformer(model_name)
        
        # Storage for our data
        self.questions_data: List[Dict] = []
        self.embeddings: Optional[np.ndarray] = None
        
        logger.info(f"Model loaded successfully. Embedding dimension: {self.model.get_sentence_embedding_dimension()}")
    
    def load_questions_from_json(self, json_file_path: str) -> None:
        """
        Load questions from a JSON file and store them.
        
        Args:
            json_file_path (str): Path to the JSON file containing questions
            
        The JSON file should contain a list of dictionaries with at least a 'question' field.
        Example format:
        [
            {
                "question": "What is Python?",
                "answer": "A programming language",
                "explanation": "...",
                "deckId": "python"
            }
        ]
        """
        try:
            with open(json_file_path, 'r', encoding='utf-8') as file:
                self.questions_data = json.load(file)
            
            logger.info(f"Loaded {len(self.questions_data)} questions from {json_file_path}")
            
            # Validate that all items have a 'question' field
            invalid_items = [i for i, item in enumerate(self.questions_data) if 'question' not in item]
            if invalid_items:
                logger.warning(f"Items without 'question' field at indices: {invalid_items}")
                
        except FileNotFoundError:
            logger.error(f"File not found: {json_file_path}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON format: {e}")
            raise
        except Exception as e:
            logger.error(f"Error loading file: {e}")
            raise
    
    def create_embeddings(self) -> None:
        """
        Create embeddings for all loaded questions.
        
        This method converts each question text into a high-dimensional vector
        using the sentence transformer model. These vectors capture the semantic
        meaning of the questions, allowing us to find similar questions even if
        they use different words.
        
        The embeddings are stored as a numpy array where each row represents
        the embedding for one question.
        """
        if not self.questions_data:
            raise ValueError("No questions loaded. Call load_questions_from_json() first.")
        
        logger.info("Creating embeddings for all questions...")
        
        # Extract just the question text from each item
        questions_text = [item['question'] for item in self.questions_data]
        
        # Create embeddings for all questions at once (batch processing is more efficient)
        # The model converts each question into a 384-dimensional vector
        self.embeddings = self.model.encode(
            questions_text,
            batch_size=32,  # Process 32 questions at a time for efficiency
            show_progress_bar=True,  # Show progress during encoding
            convert_to_numpy=True  # Return numpy array instead of tensor
        )
        
        logger.info(f"Created embeddings with shape: {self.embeddings.shape}")
        logger.info("Embeddings created successfully!")
    
    def find_similar_questions(self, query_question: str, top_k: int = 5, 
                             similarity_threshold: float = 0.0) -> List[Dict]:
        """
        Find questions similar to the given query question.
        
        Args:
            query_question (str): The question to find similar questions for
            top_k (int): Number of similar questions to return (default: 5)
            similarity_threshold (float): Minimum similarity score (0-1) to include
                                        0 = no threshold, 1 = identical match
        
        Returns:
            List[Dict]: List of dictionaries containing similar questions and their similarity scores
        
        The similarity is calculated using cosine similarity, which measures the
        angle between two vectors. A score of 1 means identical, 0 means no similarity,
        and -1 means opposite (though this rarely happens with sentence embeddings).
        """
        if self.embeddings is None:
            raise ValueError("Embeddings not created. Call create_embeddings() first.")
        
        logger.info(f"Searching for questions similar to: '{query_question[:50]}...'")
        
        # Convert the query question to an embedding
        query_embedding = self.model.encode([query_question], convert_to_numpy=True)
        
        # Calculate cosine similarity between query and all stored questions
        # Cosine similarity measures the cosine of the angle between two vectors
        # Values range from -1 to 1, where 1 is most similar
        similarities = cosine_similarity(query_embedding, self.embeddings)[0]
        
        # Get indices of questions sorted by similarity (highest first)
        sorted_indices = np.argsort(similarities)[::-1]
        
        # Prepare results
        results = []
        for idx in sorted_indices[:top_k]:
            similarity_score = similarities[idx]
            
            # Only include results above the similarity threshold
            if similarity_score >= similarity_threshold:
                result = {
                    'question': self.questions_data[idx]['question'],
                    'answer': self.questions_data[idx].get('answer', ''),
                    'explanation': self.questions_data[idx].get('explanation', ''),
                    'deckId': self.questions_data[idx].get('deckId', ''),
                    'topic': self.questions_data[idx].get('topic', ''),
                    'similarity_score': float(similarity_score),  # Convert numpy float to Python float
                    'index': idx
                }
                results.append(result)
        
        logger.info(f"Found {len(results)} similar questions above threshold {similarity_threshold}")
        return results
    
    def save_embeddings(self, embeddings_file_path: str) -> None:
        """
        Save the computed embeddings to a file for later use.
        
        Args:
            embeddings_file_path (str): Path where to save the embeddings
            
        This allows you to avoid recomputing embeddings every time you run the script.
        """
        if self.embeddings is None:
            raise ValueError("No embeddings to save. Call create_embeddings() first.")
        
        np.save(embeddings_file_path, self.embeddings)
        logger.info(f"Embeddings saved to {embeddings_file_path}")
    
    def load_embeddings(self, embeddings_file_path: str) -> None:
        """
        Load previously computed embeddings from a file.
        
        Args:
            embeddings_file_path (str): Path to the saved embeddings file
        """
        try:
            self.embeddings = np.load(embeddings_file_path)
            logger.info(f"Embeddings loaded from {embeddings_file_path}")
            logger.info(f"Loaded embeddings shape: {self.embeddings.shape}")
        except FileNotFoundError:
            logger.error(f"Embeddings file not found: {embeddings_file_path}")
            raise
    
    def get_statistics(self) -> Dict:
        """
        Get basic statistics about the loaded data.
        
        Returns:
            Dict: Dictionary containing statistics about the dataset
        """
        if not self.questions_data:
            return {"error": "No data loaded"}
        
        # Count questions by deck ID
        deck_counts = {}
        for item in self.questions_data:
            deck_id = item.get('deckId', 'unknown')
            deck_counts[deck_id] = deck_counts.get(deck_id, 0) + 1
        
        # Calculate average question length
        question_lengths = [len(item['question']) for item in self.questions_data]
        avg_length = sum(question_lengths) / len(question_lengths)
        
        return {
            "total_questions": len(self.questions_data),
            "questions_by_deck": deck_counts,
            "average_question_length": round(avg_length, 2),
            "shortest_question": min(question_lengths),
            "longest_question": max(question_lengths),
            "embedding_dimension": self.model.get_sentence_embedding_dimension() if hasattr(self, 'model') else None
        }


def main():
    """
    Main function demonstrating how to use the QuestionSimilaritySearch class.
    
    This function shows a complete workflow:
    1. Initialize the similarity search
    2. Load questions from JSON
    3. Create embeddings
    4. Search for similar questions
    5. Display results
    """
    
    # Initialize the similarity search system
    # You can experiment with different models:
    # - 'all-MiniLM-L6-v2': Fast and good quality (default)
    # - 'all-mpnet-base-v2': Better quality but slower
    # - 'all-distilroberta-v1': Good for longer texts
    similarity_search = QuestionSimilaritySearch(model_name='all-MiniLM-L6-v2')
    
    # Path to your JSON file
    json_file_path = "questions.json"  # Change this to your file path
    
    try:
        # Step 1: Load questions from JSON file
        similarity_search.load_questions_from_json(json_file_path)
        
        # Step 2: Display basic statistics about the loaded data
        stats = similarity_search.get_statistics()
        print("=== Dataset Statistics ===")
        print(f"Total questions: {stats['total_questions']}")
        print(f"Average question length: {stats['average_question_length']} characters")
        print(f"Questions by deck: {stats['questions_by_deck']}")
        print()
        
        # Step 3: Create embeddings for all questions
        # This is the computationally expensive step
        similarity_search.create_embeddings()
        
        # Optional: Save embeddings for future use
        # similarity_search.save_embeddings("question_embeddings.npy")
        
        # Step 4: Interactive search loop
        print("=== Question Similarity Search ===")
        print("Enter a question to find similar ones, or 'quit' to exit.")
        print("Examples:")
        print("- 'What is Python used for?'")
        print("- 'How do I prepare for an interview?'")
        print("- 'What are the benefits of using context managers?'")
        print()
        
        while True:
            # Get user input
            query = input("Enter your question: ").strip()
            
            if query.lower() in ['quit', 'exit', 'q']:
                print("Goodbye!")
                break
            
            if not query:
                print("Please enter a valid question.")
                continue
            
            # Find similar questions
            similar_questions = similarity_search.find_similar_questions(
                query_question=query,
                top_k=5,  # Return top 5 similar questions
                similarity_threshold=0.1  # Only show questions with similarity > 0.1
            )
            
            # Display results
            print(f"\n=== Similar Questions for: '{query}' ===")
            
            if not similar_questions:
                print("No similar questions found above the threshold.")
            else:
                for i, result in enumerate(similar_questions, 1):
                    print(f"\n{i}. Similarity: {result['similarity_score']:.3f}")
                    print(f"   Question: {result['question']}")
                    print(f"   Deck: {result['deckId']}")
                    if result['answer']:
                        print(f"   Answer: {result['answer'][:100]}...")  # Show first 100 chars
                    if result['explanation']:
                        print(f"   Explanation: {result['explanation'][:100]}...")
            
            print("\n" + "="*50 + "\n")
    
    except FileNotFoundError:
        print(f"Error: Could not find the file '{json_file_path}'")
        print("Please make sure the file exists and the path is correct.")
    except Exception as e:
        print(f"An error occurred: {e}")
        logger.error(f"Error in main: {e}", exc_info=True)


if __name__ == "__main__":
    """
    Entry point of the script.
    
    This runs the main function when the script is executed directly.
    """
    main()


# ================================
# USAGE EXAMPLES AND EXPLANATIONS
# ================================

"""
DETAILED EXPLANATION OF HOW THIS WORKS:

1. SENTENCE TRANSFORMERS:
   - We use the 'sentence-transformers' library which provides pre-trained models
   - These models convert text into high-dimensional vectors (embeddings)
   - Similar texts will have similar embeddings in the vector space

2. EMBEDDINGS:
   - Each question is converted to a 384-dimensional vector
   - These vectors capture semantic meaning, not just keywords
   - Questions like "What is Python?" and "Can you explain Python?" will have similar embeddings

3. COSINE SIMILARITY:
   - We measure similarity using cosine similarity
   - This measures the angle between two vectors
   - Values range from -1 to 1, where 1 is most similar

4. WORKFLOW:
   a) Load questions from JSON file
   b) Create embeddings for all questions (one-time computation)
   c) For a new query, create its embedding
   d) Calculate similarity with all stored embeddings
   e) Return the most similar questions

5. PERFORMANCE CONSIDERATIONS:
   - Creating embeddings is slow (done once)
   - Similarity search is fast (vector operations)
   - You can save/load embeddings to avoid recomputation

6. CUSTOMIZATION OPTIONS:
   - Different sentence transformer models for different needs
   - Adjustable similarity thresholds
   - Configurable number of results

ALTERNATIVE APPROACHES:

1. Using OpenAI Embeddings:
   ```python
   import openai
   
   def get_openai_embedding(text):
       response = openai.Embedding.create(
           input=text,
           model="text-embedding-ada-002"
       )
       return response['data'][0]['embedding']
   ```

2. Using TF-IDF (simpler but less semantic):
   ```python
   from sklearn.feature_extraction.text import TfidfVectorizer
   
   vectorizer = TfidfVectorizer()
   tfidf_matrix = vectorizer.fit_transform(questions)
   ```

3. Using BERT embeddings directly:
   ```python
   from transformers import BertTokenizer, BertModel
   
   tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
   model = BertModel.from_pretrained('bert-base-uncased')
   ```

EXTENDING THE SCRIPT:

1. Add fuzzy matching for typos
2. Include answer text in similarity calculation
3. Add category-based filtering
4. Implement question clustering
5. Add web interface using Flask/FastAPI
6. Store embeddings in a vector database (Pinecone, Weaviate, etc.)
"""