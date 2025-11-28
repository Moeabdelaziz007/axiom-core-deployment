"""
Vector Database Utility (Pinecone)
Part of QCC Phase 4: Cognitive Core

This module handles interactions with the Pinecone Vector Database for
storing and retrieving semantic embeddings of agent narratives.
"""

import os
import logging
from typing import List, Dict, Any, Optional
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
PINECONE_ENV = os.environ.get("PINECONE_ENV", "us-east-1") # Example default
INDEX_NAME = "axiom-agent-memory"
DIMENSION = 768 # Dimension for text-embedding-004 (Gemini)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VectorDB:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or PINECONE_API_KEY
        if not self.api_key:
            logger.warning("PINECONE_API_KEY not found. Vector DB operations will fail.")
            return

        self.pc = Pinecone(api_key=self.api_key)
        self.index = None
        
        # Initialize index connection
        self._connect_index()

    def _connect_index(self):
        """Connect to the Pinecone index, creating it if necessary."""
        try:
            existing_indexes = [i.name for i in self.pc.list_indexes()]
            
            if INDEX_NAME not in existing_indexes:
                logger.info(f"Creating new Pinecone index: {INDEX_NAME}")
                self.pc.create_index(
                    name=INDEX_NAME,
                    dimension=DIMENSION,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region="us-east-1"
                    )
                )
            
            self.index = self.pc.Index(INDEX_NAME)
            logger.info(f"Connected to Pinecone index: {INDEX_NAME}")
            
        except Exception as e:
            logger.error(f"Failed to connect to Pinecone: {e}")

    def upsert_memory(self, memory_id: str, vector: List[float], metadata: Dict[str, Any]):
        """
        Store a memory vector with metadata.
        
        Args:
            memory_id: Unique ID for the memory (e.g., UUID).
            vector: The embedding vector.
            metadata: Dictionary containing narrative text, agent name, timestamp, etc.
        """
        if not self.index:
            logger.error("No index connection. Cannot upsert.")
            return

        try:
            self.index.upsert(vectors=[(memory_id, vector, metadata)])
            logger.info(f"Upserted memory: {memory_id}")
        except Exception as e:
            logger.error(f"Failed to upsert memory: {e}")

    def search_memory(self, query_vector: List[float], top_k: int = 5, filter_dict: Optional[Dict] = None) -> List[Dict]:
        """
        Search for semantically similar memories.
        
        Args:
            query_vector: The embedding vector of the query.
            top_k: Number of results to return.
            filter_dict: Optional metadata filter (e.g., {'agent': 'OAA'}).
            
        Returns:
            List of matches with metadata and scores.
        """
        if not self.index:
            logger.error("No index connection. Cannot search.")
            return []

        try:
            results = self.index.query(
                vector=query_vector,
                top_k=top_k,
                include_metadata=True,
                filter=filter_dict
            )
            
            matches = []
            for match in results['matches']:
                matches.append({
                    "id": match['id'],
                    "score": match['score'],
                    "metadata": match['metadata']
                })
            
            return matches
            
        except Exception as e:
            logger.error(f"Failed to search memory: {e}")
            return []

if __name__ == "__main__":
    # Test stub (requires valid API key to run)
    print("VectorDB module loaded. Configure PINECONE_API_KEY to test.")
