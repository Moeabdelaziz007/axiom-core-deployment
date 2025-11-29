import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn('GROQ_API_KEY is not defined in environment variables.');
}

export const groq = new Groq({
  apiKey: apiKey || 'dummy_key',
});

export const GROQ_MODELS = {
  FAST: 'llama3-8b-8192',
  SMART: 'llama3-70b-8192',
  MIXTRAL: 'mixtral-8x7b-32768',
};
