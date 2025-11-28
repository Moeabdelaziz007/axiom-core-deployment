"""
Embedding Utility
Part of QCC Phase 4: Cognitive Core

This module handles the conversion of text narratives into vector embeddings
using the Gemini API (via OpenAI compatibility layer).
"""

import os
import logging
from typing import List, Optional
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
EMBEDDING_MODEL = "text-embedding-004" # Gemini embedding model

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmbeddingGenerator:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or GEMINI_API_KEY
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found. Embeddings will fail.")
            
        # Initialize OpenAI client pointing to Gemini API
        self.client = OpenAI(
            api_key=self.api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate vector embedding for a single text string.
        
        Args:
            text: The narrative text to embed.
            
        Returns:
            List of floats representing the vector.
        """
        try:
            # Clean text
            text = text.replace("\n", " ")
            
            response = self.client.embeddings.create(
                input=text,
                model=EMBEDDING_MODEL
            )
            
            return response.data[0].embedding
            
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            # Return empty list or raise, depending on desired resilience
            # For now, raising to alert caller
            raise e

    def generate_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts."""
        try:
            # Clean texts
            cleaned_texts = [t.replace("\n", " ") for t in texts]
            
            response = self.client.embeddings.create(
                input=cleaned_texts,
                model=EMBEDDING_MODEL
            )
            
            return [item.embedding for item in response.data]
            
        except Exception as e:
            logger.error(f"Failed to generate batch embeddings: {e}")
            raise e

if __name__ == "__main__":
    # Test the embedding generator
    try:
        generator = EmbeddingGenerator()
        test_text = "The quick brown fox jumps over the lazy dog."
        vector = generator.generate_embedding(test_text)
        print(f"✅ Generated embedding vector of length: {len(vector)}")
        print(f"Sample (first 5 dims): {vector[:5]}")
    except Exception as e:
        print(f"❌ Test failed: {e}")
