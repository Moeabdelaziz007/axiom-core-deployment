import arcjet, { shield, detectBot, tokenBucket } from '@arcjet/next';

export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ['ip.src'],
  rules: [
    shield({ mode: 'LIVE' }),
    detectBot({
      mode: 'LIVE',
      block: ['AUTOMATED'],
    }),
    tokenBucket({
      mode: 'LIVE',
      refillRate: 500,
      interval: 3600,
      capacity: 500,
    }),
  ],
});
