import { Pinecone } from '@pinecone-database/pinecone';

if (!process.env.PINECONE_API_KEY) {
  console.warn('⚠️ PINECONE_API_KEY is missing. Vector memory will not work.');
}

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || 'dummy-key',
});

export const INDEX_NAME = 'axiom-memory';
