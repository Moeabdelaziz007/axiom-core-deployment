import { createHmac } from 'crypto';
import {
  FawryPaymentRequest,
  FawryPaymentResponse,
  FawryWebhookPayload,
  FawryError,
  PaymentStatus,
  PaymentMethod,
  PaymentLogEntry,
  Currency
} from './payment-interfaces';

export class FawrySigner {
  private merchantCode: string;
  private secureKey: string;
  private baseUrl: string;
  private isProduction: boolean;

  constructor(config: {
    merchantCode: string;
    secureKey: string;
    baseUrl: string;
    isProduction: boolean;
  }) {
    this.merchantCode = config.merchantCode;
    this.secureKey = config.secureKey;
    this.baseUrl = config.baseUrl;
    this.isProduction = config.isProduction;
  }

  /**
   * Generate HMAC SHA256 signature for Fawry requests
   */
  generateSignature(params: Record<string, any>): string {
    // Sort parameters alphabetically by key
    const sortedKeys = Object.keys(params).sort();
    
    // Build signature string
    let signatureString = '';
    sortedKeys.forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        signatureString += key + '=' + params[key];
      }
    });

    // Append secure key
    signatureString += this.secureKey;

    // Generate HMAC SHA256
    const hmac = createHmac('sha256', this.secureKey);
    hmac.update(signatureString);
    return hmac.digest('hex');
  }

  /**
   * Verify webhook signature from Fawry
   */
  verifyWebhookSignature(webhookPayload: FawryWebhookPayload): boolean {
    try {
      const { signature, ...payloadData } = webhookPayload;
      
      // Create signature string from webhook payload
      const signatureString = this.buildWebhookSignatureString(payloadData);
      
      // Generate expected signature
      const expectedSignature = createHmac('sha256', this.secureKey)
        .update(signatureString)
        .digest('hex');

      // Compare signatures
      return signature === expectedSignature;
    } catch (error) {
      this.logError('WEBHOOK_SIGNATURE_VERIFICATION', error as Error);
      return false;
    }
  }

  /**
   * Build signature string for webhook verification
   */
  private buildWebhookSignatureString(payload: Omit<FawryWebhookPayload, 'signature'>): string {
    const fields = [
      'type',
      'merchantCode',
      'merchantRefNumber',
      'fawryRefNumber',
      'paymentAmount',
      'paymentStatus',
      'paymentMethod',
      'orderStatus',
      'orderCreationDate',
      'paidAmount',
      'adjustedAmount',
      'cashCollectionAmount',
      'cashCollectionFees'
    ];

    let signatureString = '';
    fields.forEach(field => {
      if (payload[field as keyof typeof payload] !== undefined) {
        signatureString += field + '=' + payload[field as keyof typeof payload];
      }
    });

    signatureString += this.secureKey;
    return signatureString;
  }

  /**
   * Format amount to two decimal places (strict formatting)
   */
  formatAmount(amount: number): string {
    return amount.toFixed(2);
  }

  /**
   * Parse amount string to number with validation
   */
  parseAmount(amountStr: string): number {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount < 0) {
      throw new Error(`Invalid amount: ${amountStr}`);
    }
    return Math.round(amount * 100) / 100; // Ensure two decimal places
  }

  /**
   * Create payment request with proper formatting and signature
   */
  createPaymentRequest(request: Omit<FawryPaymentRequest, 'signature'>): FawryPaymentRequest {
    try {
      // Validate and format amount
      const formattedAmount = this.formatAmount(request.amount);
      const parsedAmount = this.parseAmount(formattedAmount);

      // Validate charge items
      if (!request.chargeItems || request.chargeItems.length === 0) {
        throw new Error('At least one charge item is required');
      }

      // Validate charge items amounts
      const totalChargeItems = request.chargeItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);

      if (Math.abs(totalChargeItems - parsedAmount) > 0.01) {
        throw new Error(`Charge items total (${totalChargeItems}) doesn't match payment amount (${parsedAmount})`);
      }

      // Build request parameters for signature
      const signatureParams = {
        merchantCode: this.merchantCode,
        merchantRefNum: request.merchantRefNum,
        customerProfileId: request.customerProfileId || '',
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        customerMobile: request.customerMobile,
        amount: formattedAmount,
        currency: request.currency,
        paymentMethod: request.paymentMethod,
        language: request.language || 'en',
        chargeItems: JSON.stringify(request.chargeItems)
      };

      // Generate signature
      const signature = this.generateSignature(signatureParams);

      // Log payment request creation
      this.logOperation('CREATE_PAYMENT_REQUEST', {
        merchantRefNum: request.merchantRefNum,
        amount: formattedAmount,
        currency: request.currency,
        paymentMethod: request.paymentMethod
      });

      return {
        ...request,
        amount: parsedAmount,
        fawrySecureKey: this.secureKey,
        signature
      };
    } catch (error) {
      this.logError('CREATE_PAYMENT_REQUEST', error as Error, request);
      throw error;
    }
  }

  /**
   * Process cash collection workflow
   */
  processCashCollection(request: FawryPaymentRequest): FawryPaymentRequest {
    if (request.paymentMethod !== PaymentMethod.CASH_COLLECTION) {
      throw new Error('Payment method must be CASH_COLLECTION for cash collection workflow');
    }

    // Add cash collection specific parameters
    const cashCollectionRequest = {
      ...request,
      chargeItems: request.chargeItems.map(item => ({
        ...item,
        price: this.formatAmount(item.price)
      }))
    };

    this.logOperation('PROCESS_CASH_COLLECTION', {
      merchantRefNum: request.merchantRefNum,
      amount: this.formatAmount(request.amount)
    });

    return this.createPaymentRequest(cashCollectionRequest);
  }

  /**
   * Validate webhook payload structure
   */
  validateWebhookPayload(payload: any): FawryWebhookPayload {
    const requiredFields = [
      'type',
      'merchantCode',
      'merchantRefNumber',
      'fawryRefNumber',
      'paymentAmount',
      'paymentStatus',
      'paymentMethod',
      'signature',
      'orderStatus',
      'orderCreationDate'
    ];

    for (const field of requiredFields) {
      if (!payload[field]) {
        throw new Error(`Missing required field in webhook payload: ${field}`);
      }
    }

    // Validate merchant code
    if (payload.merchantCode !== this.merchantCode) {
      throw new Error(`Invalid merchant code: ${payload.merchantCode}`);
    }

    // Validate payment status
    if (!Object.values(PaymentStatus).includes(payload.paymentStatus as PaymentStatus)) {
      throw new Error(`Invalid payment status: ${payload.paymentStatus}`);
    }

    // Validate payment method
    if (!Object.values(PaymentMethod).includes(payload.paymentMethod as PaymentMethod)) {
      throw new Error(`Invalid payment method: ${payload.paymentMethod}`);
    }

    return payload as FawryWebhookPayload;
  }

  /**
   * Process webhook payload with full validation
   */
  processWebhook(payload: any): {
    isValid: boolean;
    data?: FawryWebhookPayload;
    error?: FawryError;
  } {
    try {
      // Validate payload structure
      const validatedPayload = this.validateWebhookPayload(payload);

      // Verify signature
      const isSignatureValid = this.verifyWebhookSignature(validatedPayload);

      if (!isSignatureValid) {
        const error: FawryError = {
          code: 'INVALID_SIGNATURE',
          message: 'Webhook signature verification failed',
          timestamp: new Date().toISOString()
        };
        return { isValid: false, error };
      }

      // Log successful webhook processing
      this.logOperation('PROCESS_WEBHOOK', {
        merchantRefNumber: validatedPayload.merchantRefNumber,
        fawryRefNumber: validatedPayload.fawryRefNumber,
        paymentStatus: validatedPayload.paymentStatus,
        paymentAmount: validatedPayload.paymentAmount
      });

      return { isValid: true, data: validatedPayload };
    } catch (error) {
      const fawryError: FawryError = {
        code: 'WEBHOOK_PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error processing webhook',
        timestamp: new Date().toISOString(),
        details: error
      };

      this.logError('PROCESS_WEBHOOK', error as Error, payload);
      return { isValid: false, error: fawryError };
    }
  }

  /**
   * Get supported currencies for Fawry
   */
  getSupportedCurrencies(): Currency[] {
    return [Currency.EGP]; // Fawry primarily supports Egyptian Pound
  }

  /**
   * Log operation for monitoring and debugging
   */
  private logOperation(operation: string, metadata: any): void {
    const logEntry: PaymentLogEntry = {
      timestamp: new Date().toISOString(),
      provider: 'fawry',
      operation,
      amount: metadata.amount,
      currency: metadata.currency,
      status: PaymentStatus.PENDING,
      metadata
    };

    // In production, this would integrate with your logging system
    console.log('Fawry Operation:', JSON.stringify(logEntry, null, 2));
  }

  /**
   * Log errors for monitoring and debugging
   */
  private logError(operation: string, error: Error, context?: any): void {
    const logEntry: PaymentLogEntry = {
      timestamp: new Date().toISOString(),
      provider: 'fawry',
      operation,
      status: PaymentStatus.FAILED,
      error: {
        code: operation,
        message: error.message,
        details: error,
        timestamp: new Date().toISOString()
      },
      metadata: context
    };

    // In production, this would integrate with your error monitoring system
    console.error('Fawry Error:', JSON.stringify(logEntry, null, 2));
  }

  /**
   * Get Fawry payment URL for redirect
   */
  getPaymentUrl(fawryRefNumber: string): string {
    const baseUrl = this.isProduction 
      ? 'https://www.atfawry.com' 
      : 'https://atfawry.fawrystaging.com';
    
    return `${baseUrl}/FawryPayments/Payment?paymentId=${fawryRefNumber}`;
  }
}