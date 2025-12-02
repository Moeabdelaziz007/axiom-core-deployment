import arcjet, { detectBot, tokenBucket } from '@arcjet/next';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ['ip.src'],
  rules: [
    // Bot protection
    detectBot({
      mode: 'LIVE',
      allow: ['CURL'], // Allow curl for testing
    }),
    // Rate limiting
    tokenBucket({
      mode: 'LIVE',
      refillRate: 10,
      interval: 60,
      capacity: 100,
    }),
  ],
});

export default aj;
