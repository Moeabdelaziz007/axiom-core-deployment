# Helius Webhook Handler Test Suite

This comprehensive test suite validates the Helius Webhook Handler integration for the Payment Fulfillment System.

## Overview

The test suite covers all aspects of webhook processing including:
- HMAC signature verification
- SOL and SPL token transfer payload parsing
- Idempotency checks for duplicate processing
- Error handling for invalid signatures and malformed payloads
- SSE integration for real-time payment status updates
- Database operations and rate limiting
- Security headers and validation
- End-to-end payment fulfillment flow

## Running the Tests

### Prerequisites

1. Ensure all dependencies are installed:
```bash
npm install
```

2. Set up test environment variables (automatically configured by test setup):
```bash
NODE_ENV=test
HELIUS_WEBHOOK_SECRET=test_webhook_secret_key_for_testing
SOLANA_RPC_URL=https://api.devnet.solana.com
TURSO_DB_URL=file:test_webhook.db
```

### Running the Test Suite

Execute the webhook tests using the npm script:

```bash
npm run test:webhook
```

This will run all tests with the dedicated Jest configuration for webhook testing.

### Running Specific Test Groups

You can run specific test groups by using Jest's test name pattern matching:

```bash
# Run only HMAC signature verification tests
npm run test:webhook -- --testNamePattern="HMAC Signature Verification"

# Run only SOL transfer tests
npm run test:webhook -- --testNamePattern="SOL Transfer Payload Processing"

# Run only SPL token tests
npm run test:webhook -- --testNamePattern="SPL Token Transfer Payload Processing"

# Run only security tests
npm run test:webhook -- --testNamePattern="Security Tests"
```

### Running with Coverage

To generate a coverage report for the webhook tests:

```bash
npm run test:webhook -- --coverage
```

Coverage reports will be generated in the `coverage/webhook/` directory.

## Test Structure

### Test Categories

1. **HMAC Signature Verification**
   - Valid signature verification
   - Invalid signature rejection
   - Wrong secret handling

2. **SOL Transfer Payload Processing**
   - Correct SOL transfer parsing
   - Reference key extraction
   - Database storage verification

3. **SPL Token Transfer Payload Processing**
   - SPL token transfer parsing
   - Token metadata handling
   - Mint information storage

4. **Idempotency Checks**
   - Duplicate transaction prevention
   - Reference key collision handling

5. **Error Handling**
   - Invalid webhook event types
   - Malformed JSON payloads
   - Empty payloads
   - Webhook event logging

6. **SSE Integration**
   - Payment status update triggering
   - SSE failure handling

7. **Rate Limiting**
   - Concurrent request handling
   - Rate limit enforcement

8. **Security Headers and Validation**
   - Content type validation
   - Signature format validation

9. **End-to-End Payment Fulfillment Flow**
   - Complete SOL payment flow
   - Complete SPL token payment flow
   - Payment failure handling

10. **Performance Tests**
    - Concurrent webhook processing
    - Large payload handling

11. **Security Tests**
    - Replay attack prevention
    - Data sanitization

### Sample Test Data

The test suite includes realistic sample webhook payloads:

- **SOL Transfer**: Simulates a 0.001 SOL transfer with reference key
- **SPL Token Transfer**: Simulates a 5 USDC transfer with token metadata
- **Invalid Payloads**: Various malformed payloads for error testing

## Test Utilities

### Global Test Utils

The test setup provides global utilities for creating test data:

```typescript
// Generate a valid HMAC signature
const signature = testUtils.generateTestSignature(payload);

// Create a test SOL webhook
const solWebhook = testUtils.createTestWebhook({
  amount: '2000000',
  description: 'Custom payment ref:custom_ref'
});

// Create a test SPL token webhook
const splWebhook = testUtils.createSPLTestWebhook({
  tokenAmount: '10000000',
  mint: 'custom_token_mint'
});
```

### Custom Jest Matchers

The test suite includes custom matchers for webhook testing:

```typescript
// Test if a string is a valid hex signature
expect(signature).toBeValidSignature();

// Test if an object is a valid webhook payload
expect(webhookData).toBeValidWebhookPayload();
```

## Database Testing

The test suite uses a separate test database (`test_webhook.db`) to avoid interfering with production data. Each test:

1. Cleans up test data before execution
2. Uses transactions for data isolation
3. Verifies database state after operations
4. Cleans up after completion

## Mock Implementation

The tests mock external dependencies:

- **Solana RPC**: Mocked to avoid network calls during testing
- **SSE Broadcasting**: Mocked to test integration without actual connections
- **Next.js APIs**: Mocked Request/Response objects for endpoint testing

## Performance Benchmarks

The test suite includes performance benchmarks:

- **Concurrent Processing**: Tests handling of 10+ simultaneous webhooks
- **Large Payloads**: Tests processing of payloads up to 10KB
- **Response Times**: Ensures processing completes within acceptable time limits

## Security Testing

Security aspects covered:

- **HMAC Verification**: Ensures only authenticated webhooks are processed
- **Replay Protection**: Tests duplicate transaction handling
- **Input Sanitization**: Validates XSS prevention
- **Rate Limiting**: Tests DoS protection mechanisms

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure test database permissions are correct
   - Check if `test_webhook.db` can be created

2. **Module Resolution Errors**
   - Verify TypeScript configuration
   - Check `jest.config.webhook.js` paths

3. **Timeout Errors**
   - Increase test timeout in Jest configuration
   - Check for infinite loops in test code

4. **Mock Failures**
   - Verify mock implementations in `test-setup.webhook.ts`
   - Check for missing mock returns

### Debug Mode

Run tests with additional debugging:

```bash
# Verbose output
npm run test:webhook -- --verbose

# Debug breakpoints
npm run test:webhook -- --runInBand --detectOpenHandles

# Specific test with debugging
npm run test:webhook -- --testNamePattern="specific test" --verbose
```

## Integration with CI/CD

The webhook tests are designed to run in CI/CD environments:

- Uses environment variables for configuration
- Generates coverage reports
- Provides structured test output
- Handles test isolation automatically

## Contributing

When adding new webhook tests:

1. Follow the existing test structure and naming conventions
2. Use the provided test utilities for consistency
3. Include both positive and negative test cases
4. Add appropriate database cleanup
5. Document any new test categories in this README

## Test Coverage Goals

The test suite aims for comprehensive coverage of:
- All webhook processing paths
- Error conditions and edge cases
- Security validation mechanisms
- Database operations
- SSE integration points
- Performance characteristics

Current coverage targets:
- Statement coverage: >95%
- Branch coverage: >90%
- Function coverage: >100%