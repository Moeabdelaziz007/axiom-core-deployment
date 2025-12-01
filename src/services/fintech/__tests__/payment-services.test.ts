import { FawrySigner } from '../fawry-signer';
import { PayTabsIntegration } from '../paytabs-integration';
import { fintechClient } from '../../../lib/fintech-client';
import {
  PaymentProvider,
  PaymentStatus,
  PaymentMethod,
  Currency,
  FawryWebhookPayload,
  PayTabsWebhookPayload
} from '../payment-interfaces';

// Mock configuration for testing
const fawryConfig = {
  merchantCode: 'test_merchant',
  secureKey: 'test_secure_key_123456789',
  baseUrl: 'https://atfawry.fawrystaging.com',
  isProduction: false
};

const paytabsConfig = {
  profileId: 'test_profile_id',
  serverKey: 'test_server_key_123456789',
  baseUrl: 'https://secure.paytabs.com',
  siteUrl: 'https://example.com',
  isProduction: false
};

describe('Fawry Signer Tests', () => {
  let fawrySigner: FawrySigner;

  beforeEach(() => {
    fawrySigner = new FawrySigner(fawryConfig);
  });

  test('should format amount correctly', () => {
    expect(fawrySigner.formatAmount(100)).toBe('100.00');
    expect(fawrySigner.formatAmount(100.5)).toBe('100.50');
    expect(fawrySigner.formatAmount(100.567)).toBe('100.57');
  });

  test('should parse amount string correctly', () => {
    expect(fawrySigner.parseAmount('100.00')).toBe(100.00);
    expect(fawrySigner.parseAmount('100.5')).toBe(100.50);
    expect(fawrySigner.parseAmount('100.567')).toBe(100.57);
  });

  test('should throw error for invalid amount', () => {
    expect(() => fawrySigner.parseAmount('invalid')).toThrow('Invalid amount: invalid');
    expect(() => fawrySigner.parseAmount('-100')).toThrow('Invalid amount: -100');
  });

  test('should create payment request with signature', () => {
    const request = {
      merchantCode: fawryConfig.merchantCode,
      merchantRefNum: 'test_ref_123',
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerMobile: '0500000000',
      amount: 100.50,
      currency: Currency.EGP,
      description: 'Test payment',
      paymentMethod: PaymentMethod.CREDIT_CARD,
      fawrySecureKey: fawryConfig.secureKey,
      chargeItems: [{
        itemId: 'item1',
        description: 'Test Item',
        price: 100.50,
        quantity: 1
      }]
    };

    const signedRequest = fawrySigner.createPaymentRequest(request);
    
    expect(signedRequest.signature).toBeDefined();
    expect(signedRequest.signature.length).toBe(64); // SHA256 hex length
    expect(signedRequest.amount).toBe(100.50);
  });

  test('should validate webhook payload structure', () => {
    const validPayload: FawryWebhookPayload = {
      type: 'PAYMENT_STATUS',
      merchantCode: fawryConfig.merchantCode,
      merchantRefNumber: 'test_ref_123',
      fawryRefNumber: 'FRN123456',
      paymentAmount: 100.50,
      paymentStatus: PaymentStatus.SUCCESS,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      signature: 'test_signature',
      orderStatus: 'PAID',
      orderCreationDate: '2023-01-01T00:00:00Z'
    };

    const validated = fawrySigner.validateWebhookPayload(validPayload);
    expect(validated.merchantRefNumber).toBe('test_ref_123');
  });

  test('should reject invalid webhook payload', () => {
    const invalidPayload = {
      // Missing required fields
      type: 'PAYMENT_STATUS'
    };

    expect(() => fawrySigner.validateWebhookPayload(invalidPayload))
      .toThrow('Missing required field in webhook payload: merchantCode');
  });
});

describe('PayTabs Integration Tests', () => {
  let payTabsIntegration: PayTabsIntegration;

  beforeEach(() => {
    payTabsIntegration = new PayTabsIntegration(paytabsConfig);
  });

  test('should format amount correctly', () => {
    expect(payTabsIntegration.formatAmount(100)).toBe('100.00');
    expect(payTabsIntegration.formatAmount(100.5)).toBe('100.50');
    expect(payTabsIntegration.formatAmount(100.567)).toBe('100.57');
  });

  test('should parse amount string correctly', () => {
    expect(payTabsIntegration.parseAmount('100.00')).toBe(100.00);
    expect(payTabsIntegration.parseAmount('100.5')).toBe(100.50);
    expect(payTabsIntegration.parseAmount('100.567')).toBe(100.57);
  });

  test('should return supported currencies', () => {
    const currencies = payTabsIntegration.getSupportedCurrencies();
    expect(currencies).toContain(Currency.SAR);
    expect(currencies).toContain(Currency.AED);
    expect(currencies).toContain(Currency.EGP);
    expect(currencies.length).toBeGreaterThan(5);
  });

  test('should create payment request', () => {
    const request = {
      profileId: paytabsConfig.profileId,
      serverKey: paytabsConfig.serverKey,
      siteUrl: paytabsConfig.siteUrl,
      merchantRefNum: 'test_ref_123',
      customerName: 'Test User',
      customerEmail: 'test@example.com',
      customerMobile: '0500000000',
      amount: 100.50,
      currency: Currency.SAR,
      description: 'Test payment',
      paymentMethod: PaymentMethod.CREDIT_CARD,
      returnUrl: 'https://example.com/success'
    };

    const paymentRequest = payTabsIntegration.createPaymentRequest(request);
    
    expect(paymentRequest.profileId).toBe(paytabsConfig.profileId);
    expect(paymentRequest.amount).toBe(100.50);
    expect(paymentRequest.currency).toBe(Currency.SAR);
  });

  test('should validate webhook payload structure', () => {
    const validPayload: PayTabsWebhookPayload = {
      tran_ref: 'T123456',
      tran_type: 'sale',
      cart_id: 'test_ref_123',
      cart_description: 'Test payment',
      cart_currency: 'SAR',
      cart_amount: 100.50,
      status: 'A',
      payment_result: {
        response_status: 'A',
        response_code: '100',
        response_message: 'Successful',
        transaction_time: '2023-01-01T00:00:00Z',
        payment_method: 'creditcard',
        card_scheme: 'visa',
        payment_description: 'Successful payment'
      },
      customer_details: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '0500000000',
        street1: 'Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'SA',
        postalCode: '12345',
        ip: '127.0.0.1'
      },
      payment_info: {
        paymentMethod: 'creditcard',
        cardScheme: 'visa',
        paymentDescription: 'Successful payment'
      },
      ipn_trace: 'trace123',
      signature: 'test_signature'
    };

    const validated = payTabsIntegration.validateWebhookPayload(validPayload);
    expect(validated.tran_ref).toBe('T123456');
    expect(validated.cart_id).toBe('test_ref_123');
  });
});

describe('Enhanced Fintech Client Tests', () => {
  beforeEach(async () => {
    await fintechClient.initialize({
      provider: PaymentProvider.PAYTABS,
      isProduction: false,
      defaultCurrency: Currency.SAR,
      supportedCurrencies: [Currency.SAR, Currency.AED, Currency.EGP],
      credentials: {
        fawry: fawryConfig,
        paytabs: paytabsConfig
      }
    });
  });

  test('should initialize successfully', () => {
    expect(fintechClient.isProviderConfigured(PaymentProvider.FAWRY)).toBe(true);
    expect(fintechClient.isProviderConfigured(PaymentProvider.PAYTABS)).toBe(true);
  });

  test('should maintain backward compatibility with legacy methods', async () => {
    const balance = await fintechClient.getBalance('user123');
    expect(balance).toBe(100.00);

    const bonus = await fintechClient.claimBonus('user123');
    expect(bonus.success).toBe(true);
  });

  test('should charge user with PayTabs', async () => {
    const response = await fintechClient.chargeUser(
      'user123',
      100.50,
      'TestAgent',
      PaymentProvider.PAYTABS
    );

    expect(response.success).toBe(true);
    expect(response.amount).toBe(100.50);
    expect(response.currency).toBe(Currency.SAR);
  });

  test('should charge user with Fawry', async () => {
    const response = await fintechClient.chargeUser(
      'user123',
      100.50,
      'TestAgent',
      PaymentProvider.FAWRY
    );

    expect(response.success).toBe(true);
    expect(response.amount).toBe(100.50);
    expect(response.currency).toBe(Currency.EGP);
  });

  test('should get supported currencies for providers', () => {
    const fawryCurrencies = fintechClient.getSupportedCurrencies(PaymentProvider.FAWRY);
    const paytabsCurrencies = fintechClient.getSupportedCurrencies(PaymentProvider.PAYTABS);

    expect(fawryCurrencies).toContain(Currency.EGP);
    expect(paytabsCurrencies.length).toBeGreaterThan(fawryCurrencies.length);
  });

  test('should process webhooks', async () => {
    const fawryWebhook = {
      type: 'PAYMENT_STATUS',
      merchantCode: fawryConfig.merchantCode,
      merchantRefNumber: 'test_ref_123',
      fawryRefNumber: 'FRN123456',
      paymentAmount: 100.50,
      paymentStatus: PaymentStatus.SUCCESS,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      signature: 'test_signature',
      orderStatus: 'PAID',
      orderCreationDate: '2023-01-01T00:00:00Z'
    };

    const fawryResult = await fintechClient.processWebhook(fawryWebhook, PaymentProvider.FAWRY);
    expect(fawryResult.isValid).toBe(false); // Signature will fail with test data

    const paytabsWebhook = {
      tran_ref: 'T123456',
      tran_type: 'sale',
      cart_id: 'test_ref_123',
      cart_description: 'Test payment',
      cart_currency: 'SAR',
      cart_amount: 100.50,
      status: 'A',
      payment_result: {
        response_status: 'A',
        response_code: '100',
        response_message: 'Successful',
        transaction_time: '2023-01-01T00:00:00Z',
        payment_method: 'creditcard',
        card_scheme: 'visa',
        payment_description: 'Successful payment'
      },
      customer_details: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '0500000000',
        street1: 'Test Street',
        city: 'Test City',
        state: 'Test State',
        country: 'SA',
        postalCode: '12345',
        ip: '127.0.0.1'
      },
      payment_info: {
        paymentMethod: 'creditcard',
        cardScheme: 'visa',
        paymentDescription: 'Successful payment'
      },
      ipn_trace: 'trace123',
      signature: 'test_signature'
    };

    const paytabsResult = await fintechClient.processWebhook(paytabsWebhook, PaymentProvider.PAYTABS);
    expect(paytabsResult.isValid).toBe(false); // Signature will fail with test data
  });
});

// Integration test example
describe('Integration Tests', () => {
  test('should demonstrate complete payment flow', async () => {
    // Initialize client
    await fintechClient.initialize({
      provider: PaymentProvider.PAYTABS,
      isProduction: false,
      defaultCurrency: Currency.SAR,
      supportedCurrencies: [Currency.SAR, Currency.AED, Currency.EGP],
      credentials: {
        paytabs: paytabsConfig
      }
    });

    // Create payment
    const paymentResponse = await fintechClient.chargeUser(
      'user123',
      299.99,
      'PremiumAgent',
      PaymentProvider.PAYTABS,
      {
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: Currency.SAR,
        returnUrl: 'https://example.com/payment/success'
      }
    );

    expect(paymentResponse.success).toBe(true);
    expect(paymentResponse.amount).toBe(299.99);

    // Check status (mock implementation)
    const statusResponse = await fintechClient.checkPaymentStatus(
      paymentResponse.transactionId!,
      PaymentProvider.PAYTABS
    );

    expect(statusResponse.transactionId).toBe(paymentResponse.transactionId);

    // Process refund (mock implementation)
    const refundResponse = await fintechClient.processRefund(
      paymentResponse.transactionId!,
      299.99,
      PaymentProvider.PAYTABS,
      'Customer requested refund'
    );

    expect(refundResponse.success).toBe(true);
    expect(refundResponse.refundAmount).toBe(299.99);
  });
});