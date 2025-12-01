import { FawrySigner } from '../services/fintech/fawry-signer';
import { PayTabsIntegration } from '../services/fintech/paytabs-integration';
import {
  PaymentConfig,
  PaymentProvider,
  PaymentStatus,
  PaymentMethod,
  Currency,
  BasePaymentRequest,
  BasePaymentResponse,
  FawryPaymentRequest,
  FawryPaymentResponse,
  PayTabsPaymentRequest,
  PayTabsPaymentResponse,
  RefundRequest,
  RefundResponse,
  PaymentError
} from '../services/fintech/payment-interfaces';

// Enhanced fintech client with MENA payment provider support
class EnhancedFintechClient {
  private fawrySigner?: FawrySigner;
  private payTabsIntegration?: PayTabsIntegration;
  private config?: PaymentConfig;
  private isInitialized = false;

  /**
   * Initialize the fintech client with payment provider configuration
   */
  async initialize(config: PaymentConfig): Promise<void> {
    try {
      this.config = config;

      // Initialize Fawry if configured
      if (config.credentials.fawry) {
        this.fawrySigner = new FawrySigner({
          merchantCode: config.credentials.fawry.merchantCode,
          secureKey: config.credentials.fawry.secureKey,
          baseUrl: config.credentials.fawry.baseUrl,
          isProduction: config.isProduction
        });
      }

      // Initialize PayTabs if configured
      if (config.credentials.paytabs) {
        this.payTabsIntegration = new PayTabsIntegration({
          profileId: config.credentials.paytabs.profileId,
          serverKey: config.credentials.paytabs.serverKey,
          baseUrl: config.credentials.paytabs.baseUrl,
          siteUrl: config.credentials.paytabs.siteUrl,
          isProduction: config.isProduction
        });
      }

      this.isInitialized = true;
      console.log('Fintech client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize fintech client:', error);
      throw error;
    }
  }

  /**
   * Check if client is initialized
   */
  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('Fintech client not initialized. Call initialize() first.');
    }
  }

  /**
   * Get user balance (legacy MVP functionality)
   */
  async getBalance(userId: string): Promise<number> {
    // In production, this would integrate with your user balance system
    // For now, maintaining MVP mock functionality
    return 100.00;
  }

  /**
   * Claim bonus (legacy MVP functionality)
   */
  async claimBonus(userId: string): Promise<{ success: boolean }> {
    // In production, this would integrate with your bonus system
    return { success: true };
  }

  /**
   * Charge user using specified payment provider
   */
  async chargeUser(
    userId: string,
    amount: number,
    agentName: string,
    provider: PaymentProvider = 'paytabs',
    options?: {
      paymentMethod?: PaymentMethod;
      currency?: Currency;
      returnUrl?: string;
      callbackUrl?: string;
    }
  ): Promise<BasePaymentResponse> {
    this.ensureInitialized();

    try {
      const merchantRefNum = `user_${userId}_${Date.now()}`;
      const currency = options?.currency || this.config?.defaultCurrency || Currency.SAR;

      if (provider === 'fawry' && this.fawrySigner) {
        // Fawry primarily supports EGP, override currency if needed
        const fawryCurrency = this.fawrySigner.getSupportedCurrencies().includes(currency) ? currency : Currency.EGP;
        console.log(`DEBUG: Fawry payment - original currency: ${currency}, using currency: ${fawryCurrency}`);
        
        return await this.processFawryPayment({
          merchantCode: this.config!.credentials.fawry!.merchantCode,
          merchantRefNum,
          customerName: `User ${userId}`,
          customerEmail: `user${userId}@example.com`,
          customerMobile: '0500000000',
          amount,
          currency: fawryCurrency,
          description: `Purchase: ${agentName}`,
          paymentMethod: options?.paymentMethod || PaymentMethod.CREDIT_CARD,
          fawrySecureKey: this.config!.credentials.fawry!.secureKey,
          chargeItems: [{
            itemId: agentName,
            description: `Agent: ${agentName}`,
            price: amount,
            quantity: 1
          }]
        });
      } else if (provider === 'paytabs' && this.payTabsIntegration) {
        return await this.processPayTabsPayment({
          profileId: this.config!.credentials.paytabs!.profileId,
          serverKey: this.config!.credentials.paytabs!.serverKey,
          siteUrl: this.config!.credentials.paytabs!.siteUrl,
          merchantRefNum,
          customerName: `User ${userId}`,
          customerEmail: `user${userId}@example.com`,
          customerMobile: '0500000000',
          amount,
          currency,
          description: `Purchase: ${agentName}`,
          paymentMethod: options?.paymentMethod || PaymentMethod.CREDIT_CARD,
          returnUrl: options?.returnUrl || `${this.config!.credentials.paytabs!.siteUrl}/payment/success`,
          callbackUrl: options?.callbackUrl || `${this.config!.credentials.paytabs!.siteUrl}/api/payments/paytabs/callback`
        });
      } else {
        throw new Error(`Payment provider ${provider} not configured`);
      }
    } catch (error) {
      console.error('Charge user error:', error);
      throw error;
    }
  }

  /**
   * Process payment using Fawry
   */
  private async processFawryPayment(request: FawryPaymentRequest): Promise<FawryPaymentResponse> {
    if (!this.fawrySigner) {
      throw new Error('Fawry not configured');
    }

    try {
      // Create payment request with signature
      const signedRequest = this.fawrySigner.createPaymentRequest(request);

      console.log(`DEBUG: Fawry processing payment - currency: ${request.currency}, amount: ${request.amount}`);

      // In production, make actual API call to Fawry
      // For now, return mock response
      const response: FawryPaymentResponse = {
        success: true,
        status: PaymentStatus.PENDING,
        transactionId: `fawry_${Date.now()}`,
        merchantRefNum: request.merchantRefNum,
        amount: request.amount,
        currency: request.currency,
        paymentMethod: request.paymentMethod,
        fawryRefNumber: `FRN${Date.now()}`,
        paymentUrl: this.fawrySigner.getPaymentUrl(`FRN${Date.now()}`),
        timestamp: new Date().toISOString()
      };

      console.log(`DEBUG: Fawry mock response - currency: ${response.currency}, amount: ${response.amount}`);

      return response;
    } catch (error) {
      const paymentError: PaymentError = {
        code: 'FAWRY_PAYMENT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown Fawry payment error',
        timestamp: new Date().toISOString()
      };
      throw paymentError;
    }
  }

  /**
   * Process payment using PayTabs
   */
  private async processPayTabsPayment(request: PayTabsPaymentRequest): Promise<PayTabsPaymentResponse> {
    if (!this.payTabsIntegration) {
      throw new Error('PayTabs not configured');
    }

    try {
      // Process payment via PayTabs API
      const response = await this.payTabsIntegration.processPayment(request);
      return response;
    } catch (error) {
      const paymentError: PaymentError = {
        code: 'PAYTABS_PAYMENT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown PayTabs payment error',
        timestamp: new Date().toISOString()
      };
      throw paymentError;
    }
  }

  /**
   * Process refund
   */
  async processRefund(
    originalTransactionId: string,
    refundAmount: number,
    provider: PaymentProvider,
    reason?: string
  ): Promise<RefundResponse> {
    this.ensureInitialized();

    try {
      if (provider === 'paytabs' && this.payTabsIntegration) {
        return await this.payTabsIntegration.processRefund({
          originalTransactionId,
          refundAmount,
          reason
        });
      } else {
        throw new Error(`Refund not supported for provider: ${provider}`);
      }
    } catch (error) {
      const paymentError: PaymentError = {
        code: 'REFUND_ERROR',
        message: error instanceof Error ? error.message : 'Unknown refund error',
        timestamp: new Date().toISOString()
      };
      throw paymentError;
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(
    transactionId: string,
    provider: PaymentProvider
  ): Promise<BasePaymentResponse> {
    this.ensureInitialized();

    try {
      if (provider === 'paytabs' && this.payTabsIntegration) {
        return await this.payTabsIntegration.checkPaymentStatus(transactionId);
      } else {
        throw new Error(`Status check not supported for provider: ${provider}`);
      }
    } catch (error) {
      const paymentError: PaymentError = {
        code: 'STATUS_CHECK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown status check error',
        timestamp: new Date().toISOString()
      };
      throw paymentError;
    }
  }

  /**
   * Process webhook payload
   */
  async processWebhook(
    payload: any,
    provider: PaymentProvider
  ): Promise<{ isValid: boolean; data?: any; error?: PaymentError }> {
    this.ensureInitialized();

    try {
      if (provider === 'fawry' && this.fawrySigner) {
        return this.fawrySigner.processWebhook(payload);
      } else if (provider === 'paytabs' && this.payTabsIntegration) {
        return this.payTabsIntegration.processWebhook(payload);
      } else {
        throw new Error(`Webhook processing not supported for provider: ${provider}`);
      }
    } catch (error) {
      const paymentError: PaymentError = {
        code: 'WEBHOOK_PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'Unknown webhook processing error',
        timestamp: new Date().toISOString()
      };
      return { isValid: false, error: paymentError };
    }
  }

  /**
   * Get supported currencies for a provider
   */
  getSupportedCurrencies(provider: PaymentProvider): Currency[] {
    if (provider === 'fawry' && this.fawrySigner) {
      return this.fawrySigner.getSupportedCurrencies();
    } else if (provider === 'paytabs' && this.payTabsIntegration) {
      return this.payTabsIntegration.getSupportedCurrencies();
    } else {
      return [];
    }
  }

  /**
   * TTS functionality (legacy)
   */
  async speak(text: string): Promise<string | null> {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('TTS API failed');

      const data = await response.json();
      return data.audioContent; // Base64 PCM
    } catch (error) {
      console.error('TTS Client Error:', error);
      return null;
    }
  }

  /**
   * Get client configuration
   */
  getConfig(): PaymentConfig | undefined {
    return this.config;
  }

  /**
   * Check if provider is configured
   */
  isProviderConfigured(provider: PaymentProvider): boolean {
    if (provider === 'fawry') {
      return !!this.fawrySigner;
    } else if (provider === 'paytabs') {
      return !!this.payTabsIntegration;
    }
    return false;
  }
}

// Export singleton instance
export const fintechClient = new EnhancedFintechClient();

// Export types for external use
export type {
  PaymentConfig,
  PaymentProvider,
  PaymentStatus,
  PaymentMethod,
  Currency,
  BasePaymentRequest,
  BasePaymentResponse,
  FawryPaymentRequest,
  FawryPaymentResponse,
  PayTabsPaymentRequest,
  PayTabsPaymentResponse,
  RefundRequest,
  RefundResponse,
  PaymentError
};
