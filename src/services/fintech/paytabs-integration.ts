import { createHmac } from 'crypto';
import {
  PayTabsPaymentRequest,
  PayTabsPaymentResponse,
  PayTabsWebhookPayload,
  PayTabsError,
  RefundRequest,
  RefundResponse,
  PaymentStatus,
  PaymentMethod,
  PaymentLogEntry,
  Currency
} from './payment-interfaces';

export class PayTabsIntegration {
  private profileId: string;
  private serverKey: string;
  private baseUrl: string;
  private siteUrl: string;
  private isProduction: boolean;

  constructor(config: {
    profileId: string;
    serverKey: string;
    baseUrl: string;
    siteUrl: string;
    isProduction: boolean;
  }) {
    this.profileId = config.profileId;
    this.serverKey = config.serverKey;
    this.baseUrl = config.baseUrl;
    this.siteUrl = config.siteUrl;
    this.isProduction = config.isProduction;
  }

  /**
   * Generate HMAC SHA256 signature for PayTabs requests
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

    // Append server key
    signatureString += this.serverKey;

    // Generate HMAC SHA256
    const hmac = createHmac('sha256', this.serverKey);
    hmac.update(signatureString);
    return hmac.digest('hex');
  }

  /**
   * Verify webhook signature from PayTabs
   */
  verifyWebhookSignature(webhookPayload: PayTabsWebhookPayload): boolean {
    try {
      const { signature, ...payloadData } = webhookPayload;
      
      // Create signature string from webhook payload
      const signatureString = this.buildWebhookSignatureString(payloadData);
      
      // Generate expected signature
      const expectedSignature = createHmac('sha256', this.serverKey)
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
  private buildWebhookSignatureString(payload: Omit<PayTabsWebhookPayload, 'signature'>): string {
    const fields = [
      'tran_ref',
      'tran_type',
      'cart_id',
      'cart_description',
      'cart_currency',
      'cart_amount',
      'status',
      'payment_result',
      'customer_details',
      'payment_info',
      'ipn_trace'
    ];

    let signatureString = '';
    fields.forEach(field => {
      if (payload[field as keyof typeof payload] !== undefined) {
        const value = typeof payload[field as keyof typeof payload] === 'object' 
          ? JSON.stringify(payload[field as keyof typeof payload])
          : payload[field as keyof typeof payload];
        signatureString += field + '=' + value;
      }
    });

    signatureString += this.serverKey;
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
  createPaymentRequest(request: Omit<PayTabsPaymentRequest, 'profileId' | 'serverKey'>): PayTabsPaymentRequest {
    try {
      // Validate and format amount
      const formattedAmount = this.formatAmount(request.amount);
      const parsedAmount = this.parseAmount(formattedAmount);

      // Validate currency
      if (!this.getSupportedCurrencies().includes(request.currency)) {
        throw new Error(`Unsupported currency: ${request.currency}`);
      }

      // Build request parameters for signature
      const signatureParams = {
        profileId: this.profileId,
        tranType: 'sale',
        tranClass: 'ecom',
        cartId: request.merchantRefNum,
        cartDescription: request.description,
        cartCurrency: request.currency,
        cartAmount: formattedAmount,
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        customerPhone: request.customerMobile,
        language: request.language || 'en',
        callback: request.callbackUrl || `${this.siteUrl}/api/payments/paytabs/callback`,
        return: request.returnUrl,
        frameMode: request.iframeMode ? 'popup' : 'redirect',
        tokenization: request.tokenization ? 'yes' : 'no',
        hideShipping: request.hideShipping ? 'true' : 'false'
      };

      // Add billing and shipping addresses if provided
      if (request.billingAddress) {
        signatureParams.billingAddress = JSON.stringify(request.billingAddress);
      }
      if (request.shippingAddress) {
        signatureParams.shippingAddress = JSON.stringify(request.shippingAddress);
      }

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
        profileId: this.profileId,
        serverKey: this.serverKey,
        siteUrl: this.siteUrl
      };
    } catch (error) {
      this.logError('CREATE_PAYMENT_REQUEST', error as Error, request);
      throw error;
    }
  }

  /**
   * Process payment via PayTabs API
   */
  async processPayment(request: PayTabsPaymentRequest): Promise<PayTabsPaymentResponse> {
    try {
      const paymentRequest = this.createPaymentRequest(request);

      // DEBUG: Log processing attempt
      console.log(`DEBUG: PayTabs processing payment for amount: ${paymentRequest.amount}, currency: ${paymentRequest.currency}`);
      console.log(`DEBUG: Base URL: ${this.baseUrl}, Is Production: ${this.isProduction}`);

      // For testing purposes, return mock response instead of making real API call
      if (!this.isProduction) {
        console.log('DEBUG: Using mock PayTabs response for testing');
        const mockResponse: PayTabsPaymentResponse = {
          success: true,
          status: PaymentStatus.PENDING,
          transactionId: `paytabs_mock_${Date.now()}`,
          merchantRefNum: paymentRequest.merchantRefNum,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          paymentUrl: `https://secure.paytabs.com/mock-payment/${Date.now()}`,
          tranRef: `paytabs_mock_${Date.now()}`,
          tranType: 'sale',
          cartId: paymentRequest.merchantRefNum,
          cartDescription: paymentRequest.description,
          customerName: paymentRequest.customerName,
          timestamp: new Date().toISOString()
        };

        this.logOperation('PROCESS_PAYMENT_MOCK', {
          merchantRefNum: paymentRequest.merchantRefNum,
          transactionId: mockResponse.transactionId,
          status: mockResponse.status,
          amount: this.formatAmount(paymentRequest.amount)
        });

        return mockResponse;
      }

      // Build API request payload
      const apiPayload = {
        profile_id: paymentRequest.profileId,
        tran_type: 'sale',
        tran_class: 'ecom',
        cart_id: paymentRequest.merchantRefNum,
        cart_description: paymentRequest.description,
        cart_currency: paymentRequest.currency,
        cart_amount: this.formatAmount(paymentRequest.amount),
        customer_details: {
          name: paymentRequest.customerName,
          email: paymentRequest.customerEmail,
          phone: paymentRequest.customerMobile,
          street1: paymentRequest.billingAddress?.street1 || '',
          city: paymentRequest.billingAddress?.city || '',
          state: paymentRequest.billingAddress?.state || '',
          country: paymentRequest.billingAddress?.country || '',
          postalCode: paymentRequest.billingAddress?.postalCode || ''
        },
        shipping_details: paymentRequest.shippingAddress ? {
          name: paymentRequest.customerName,
          email: paymentRequest.customerEmail,
          phone: paymentRequest.customerMobile,
          street1: paymentRequest.shippingAddress.street1,
          city: paymentRequest.shippingAddress.city,
          state: paymentRequest.shippingAddress.state,
          country: paymentRequest.shippingAddress.country,
          postalCode: paymentRequest.shippingAddress.postalCode
        } : undefined,
        payment_method: paymentRequest.paymentMethod.toLowerCase().replace('_', ''),
        language: paymentRequest.language || 'en',
        callback: paymentRequest.callbackUrl || `${this.siteUrl}/api/payments/paytabs/callback`,
        return: paymentRequest.returnUrl,
        frame_mode: paymentRequest.iframeMode ? 'popup' : 'redirect',
        tokenization: paymentRequest.tokenization ? 'yes' : 'no',
        hide_shipping: paymentRequest.hideShipping ? 'true' : 'false'
      };

      // Generate signature for API request
      const signature = this.generateSignature(apiPayload);
      apiPayload.signature = signature;

      // Make API call to PayTabs
      const response = await fetch(`${this.baseUrl}/payment/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.serverKey}`
        },
        body: JSON.stringify(apiPayload)
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(`PayTabs API error: ${responseData.message || 'Unknown error'}`);
      }

      // Transform response to our format
      const paymentResponse: PayTabsPaymentResponse = {
        success: true,
        status: this.mapPayTabsStatus(responseData.status),
        transactionId: responseData.tran_ref,
        merchantRefNum: responseData.cart_id,
        amount: this.parseAmount(responseData.cart_amount),
        currency: responseData.cart_currency,
        paymentUrl: responseData.redirect_url,
        tranRef: responseData.tran_ref,
        tranType: responseData.tran_type,
        cartId: responseData.cart_id,
        cartDescription: responseData.cart_description,
        customerName: responseData.customer_details?.name,
        paymentInfo: responseData.payment_info ? {
          paymentMethod: responseData.payment_info.paymentMethod,
          cardScheme: responseData.payment_info.cardScheme,
          paymentDescription: responseData.payment_info.paymentDescription,
          expiryDate: responseData.payment_info.expiryDate,
          maskedPan: responseData.payment_info.maskedPan
        } : undefined,
        timestamp: new Date().toISOString()
      };

      this.logOperation('PROCESS_PAYMENT', {
        merchantRefNum: paymentRequest.merchantRefNum,
        transactionId: paymentResponse.transactionId,
        status: paymentResponse.status,
        amount: this.formatAmount(paymentRequest.amount)
      });

      return paymentResponse;
    } catch (error) {
      const paytabsError: PayTabsError = {
        code: 'PAYMENT_PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error processing payment',
        timestamp: new Date().toISOString(),
        details: error
      };

      this.logError('PROCESS_PAYMENT', error as Error, request);
      throw paytabsError;
    }
  }

  /**
   * Process refund via PayTabs API
   */
  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      console.log(`DEBUG: PayTabs processing refund for transaction: ${request.originalTransactionId}, amount: ${request.refundAmount}`);

      // For testing purposes, return mock response instead of making real API call
      if (!this.isProduction) {
        console.log('DEBUG: Using mock PayTabs refund response for testing');
        const mockResponse: RefundResponse = {
          success: true,
          refundId: `refund_mock_${Date.now()}`,
          originalTransactionId: request.originalTransactionId,
          refundAmount: request.refundAmount,
          status: PaymentStatus.REFUNDED,
          timestamp: new Date().toISOString()
        };

        this.logOperation('PROCESS_REFUND_MOCK', {
          originalTransactionId: request.originalTransactionId,
          refundId: mockResponse.refundId,
          refundAmount: request.refundAmount,
          status: mockResponse.status
        });

        return mockResponse;
      }

      // Build refund request payload
      const refundPayload = {
        tran_ref: request.originalTransactionId,
        tran_type: 'refund',
        tran_class: 'ecom',
        cart_id: request.merchantRefNum || `refund_${Date.now()}`,
        cart_description: request.reason || 'Refund request',
        cart_currency: 'SAR', // Default currency for refunds
        cart_amount: this.formatAmount(request.refundAmount),
        callback: `${this.siteUrl}/api/payments/paytabs/refund-callback`
      };

      // Generate signature for refund request
      const signature = this.generateSignature(refundPayload);
      refundPayload.signature = signature;

      // Make API call to PayTabs
      const response = await fetch(`${this.baseUrl}/payment/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.serverKey}`
        },
        body: JSON.stringify(refundPayload)
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(`PayTabs refund error: ${responseData.message || 'Unknown error'}`);
      }

      const refundResponse: RefundResponse = {
        success: true,
        refundId: responseData.tran_ref,
        originalTransactionId: request.originalTransactionId,
        refundAmount: request.refundAmount,
        status: this.mapPayTabsStatus(responseData.status),
        timestamp: new Date().toISOString()
      };

      this.logOperation('PROCESS_REFUND', {
        originalTransactionId: request.originalTransactionId,
        refundId: refundResponse.refundId,
        refundAmount: request.refundAmount,
        status: refundResponse.status
      });

      return refundResponse;
    } catch (error) {
      const paytabsError: PayTabsError = {
        code: 'REFUND_PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error processing refund',
        timestamp: new Date().toISOString(),
        details: error
      };

      this.logError('PROCESS_REFUND', error as Error, request);
      throw paytabsError;
    }
  }

  /**
   * Validate webhook payload structure
   */
  validateWebhookPayload(payload: any): PayTabsWebhookPayload {
    const requiredFields = [
      'tran_ref',
      'tran_type',
      'cart_id',
      'cart_currency',
      'cart_amount',
      'status',
      'payment_result',
      'customer_details',
      'payment_info',
      'ipn_trace',
      'signature'
    ];

    for (const field of requiredFields) {
      if (!payload[field]) {
        throw new Error(`Missing required field in webhook payload: ${field}`);
      }
    }

    // Validate transaction type
    if (payload.tran_type !== 'sale' && payload.tran_type !== 'refund') {
      throw new Error(`Invalid transaction type: ${payload.tran_type}`);
    }

    return payload as PayTabsWebhookPayload;
  }

  /**
   * Process webhook payload with full validation
   */
  processWebhook(payload: any): {
    isValid: boolean;
    data?: PayTabsWebhookPayload;
    error?: PayTabsError;
  } {
    try {
      // Validate payload structure
      const validatedPayload = this.validateWebhookPayload(payload);

      // Verify signature
      const isSignatureValid = this.verifyWebhookSignature(validatedPayload);

      if (!isSignatureValid) {
        const error: PayTabsError = {
          code: 'INVALID_SIGNATURE',
          message: 'Webhook signature verification failed',
          timestamp: new Date().toISOString()
        };
        return { isValid: false, error };
      }

      // Log successful webhook processing
      this.logOperation('PROCESS_WEBHOOK', {
        tranRef: validatedPayload.tran_ref,
        cartId: validatedPayload.cart_id,
        status: validatedPayload.status,
        amount: validatedPayload.cart_amount
      });

      return { isValid: true, data: validatedPayload };
    } catch (error) {
      const paytabsError: PayTabsError = {
        code: 'WEBHOOK_PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error processing webhook',
        timestamp: new Date().toISOString(),
        details: error
      };

      this.logError('PROCESS_WEBHOOK', error as Error, payload);
      return { isValid: false, error: paytabsError };
    }
  }

  /**
   * Map PayTabs status to our PaymentStatus enum
   */
  private mapPayTabsStatus(paytabsStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'A': PaymentStatus.SUCCESS,    // Authorized
      'H': PaymentStatus.PENDING,   // Hold
      'D': PaymentStatus.FAILED,    // Declined
      'V': PaymentStatus.CANCELLED, // Voided
      'R': PaymentStatus.REFUNDED,  // Refunded
      'E': PaymentStatus.EXPIRED    // Expired
    };

    return statusMap[paytabsStatus] || PaymentStatus.PENDING;
  }

  /**
   * Get supported currencies for PayTabs
   */
  getSupportedCurrencies(): Currency[] {
    return [
      Currency.SAR, // Saudi Riyal
      Currency.AED, // UAE Dirham
      Currency.EGP, // Egyptian Pound
      Currency.KWD, // Kuwaiti Dinar
      Currency.BHD, // Bahraini Dinar
      Currency.QAR, // Qatari Riyal
      Currency.OMR, // Omani Rial
      Currency.JOD, // Jordanian Dinar
      Currency.USD  // US Dollar
    ];
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(transactionId: string): Promise<PayTabsPaymentResponse> {
    try {
      console.log(`DEBUG: PayTabs checking payment status for transaction: ${transactionId}`);

      // For testing purposes, return mock response instead of making real API call
      if (!this.isProduction) {
        console.log('DEBUG: Using mock PayTabs status response for testing');
        const mockResponse: PayTabsPaymentResponse = {
          success: true,
          status: PaymentStatus.SUCCESS,
          transactionId: transactionId,
          merchantRefNum: `mock_${Date.now()}`,
          amount: 0, // Amount would be determined by original transaction
          currency: 'SAR',
          tranRef: transactionId,
          tranType: 'sale',
          cartId: `mock_${Date.now()}`,
          cartDescription: 'Mock status check',
          customerName: 'Mock User',
          paymentInfo: {
            paymentMethod: 'creditcard',
            cardScheme: 'visa',
            paymentDescription: 'Successful payment'
          },
          timestamp: new Date().toISOString()
        };

        this.logOperation('CHECK_PAYMENT_STATUS_MOCK', {
          transactionId,
          status: mockResponse.status
        });

        return mockResponse;
      }

      const response = await fetch(`${this.baseUrl}/payment/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.serverKey}`
        },
        body: JSON.stringify({
          profile_id: this.profileId,
          tran_ref: transactionId
        })
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(`PayTabs query error: ${responseData.message || 'Unknown error'}`);
      }

      const paymentResponse: PayTabsPaymentResponse = {
        success: true,
        status: this.mapPayTabsStatus(responseData.status),
        transactionId: responseData.tran_ref,
        merchantRefNum: responseData.cart_id,
        amount: this.parseAmount(responseData.cart_amount),
        currency: responseData.cart_currency,
        tranRef: responseData.tran_ref,
        tranType: responseData.tran_type,
        cartId: responseData.cart_id,
        cartDescription: responseData.cart_description,
        customerName: responseData.customer_details?.name,
        paymentInfo: responseData.payment_info ? {
          paymentMethod: responseData.payment_info.paymentMethod,
          cardScheme: responseData.payment_info.cardScheme,
          paymentDescription: responseData.payment_info.paymentDescription,
          expiryDate: responseData.payment_info.expiryDate,
          maskedPan: responseData.payment_info.maskedPan
        } : undefined,
        timestamp: new Date().toISOString()
      };

      this.logOperation('CHECK_PAYMENT_STATUS', {
        transactionId,
        status: paymentResponse.status,
        amount: responseData.cart_amount
      });

      return paymentResponse;
    } catch (error) {
      const paytabsError: PayTabsError = {
        code: 'STATUS_CHECK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error checking payment status',
        timestamp: new Date().toISOString(),
        details: error
      };

      this.logError('CHECK_PAYMENT_STATUS', error as Error, { transactionId });
      throw paytabsError;
    }
  }

  /**
   * Log operation for monitoring and debugging
   */
  private logOperation(operation: string, metadata: any): void {
    const logEntry: PaymentLogEntry = {
      timestamp: new Date().toISOString(),
      provider: 'paytabs',
      operation,
      amount: metadata.amount,
      currency: metadata.currency,
      status: PaymentStatus.PENDING,
      metadata
    };

    // In production, this would integrate with your logging system
    console.log('PayTabs Operation:', JSON.stringify(logEntry, null, 2));
  }

  /**
   * Log errors for monitoring and debugging
   */
  private logError(operation: string, error: Error, context?: any): void {
    const logEntry: PaymentLogEntry = {
      timestamp: new Date().toISOString(),
      provider: 'paytabs',
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
    console.error('PayTabs Error:', JSON.stringify(logEntry, null, 2));
  }
}