// Common payment protocol interfaces and types

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  WALLET = 'WALLET',
  CASH_COLLECTION = 'CASH_COLLECTION',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum Currency {
  SAR = 'SAR', // Saudi Riyal
  AED = 'AED', // UAE Dirham
  EGP = 'EGP', // Egyptian Pound
  KWD = 'KWD', // Kuwaiti Dinar
  BHD = 'BHD', // Bahraini Dinar
  QAR = 'QAR', // Qatari Riyal
  OMR = 'OMR', // Omani Rial
  JOD = 'JOD', // Jordanian Dinar
  USD = 'USD'  // US Dollar (fallback)
}

export interface BasePaymentRequest {
  merchantCode: string;
  merchantRefNum: string;
  customerProfileId?: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  amount: number;
  currency: Currency;
  description: string;
  paymentMethod: PaymentMethod;
  language?: 'en' | 'ar';
}

export interface BasePaymentResponse {
  success: boolean;
  status: PaymentStatus;
  transactionId?: string;
  merchantRefNum?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  message?: string;
  errorCode?: string;
  timestamp: string;
}

export interface WebhookSignatureData {
  signature: string;
  payload: any;
  timestamp: string;
}

export interface PaymentError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Fawry specific interfaces
export interface FawryPaymentRequest extends BasePaymentRequest {
  fawrySecureKey: string;
  chargeItems: FawryChargeItem[];
  signature?: string;
}

export interface FawryChargeItem {
  itemId: string;
  description: string;
  price: number;
  quantity: number;
}

export interface FawryPaymentResponse extends BasePaymentResponse {
  fawryRefNumber?: string;
  authCode?: string;
  expiryTime?: string;
  paymentUrl?: string;
  cashCollectionAmount?: number;
  cashCollectionFees?: number;
}

export interface FawryWebhookPayload {
  type: 'PAYMENT_STATUS';
  merchantCode: string;
  merchantRefNumber: string;
  fawryRefNumber: string;
  paymentAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  signature: string;
  orderStatus: string;
  orderExpiryDate?: string;
  customerMobile?: string;
  customerMail?: string;
  orderCreationDate: string;
  paidAmount?: number;
  adjustedAmount?: number;
  cashCollectionAmount?: number;
  cashCollectionFees?: number;
}

// PayTabs specific interfaces
export interface PayTabsPaymentRequest extends BasePaymentRequest {
  profileId: string;
  serverKey: string;
  siteUrl: string;
  returnUrl: string;
  callbackUrl?: string;
  iframeMode?: boolean;
  tokenization?: boolean;
  hideShipping?: boolean;
  billingAddress?: PayTabsAddress;
  shippingAddress?: PayTabsAddress;
  cartDescription?: string;
  cartId?: string;
  cartCurrency?: string;
  cartAmount?: number;
}

export interface PayTabsAddress {
  name: string;
  email: string;
  phone: string;
  street1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface PayTabsPaymentResponse extends BasePaymentResponse {
  paymentUrl?: string;
  tranRef?: string;
  tranType?: string;
  cartId?: string;
  cartDescription?: string;
  customerName?: string;
  currency?: string;
  amount?: number;
  token?: string;
  redirectUrl?: string;
  paymentInfo?: PayTabsPaymentInfo;
}

export interface PayTabsPaymentInfo {
  paymentMethod: string;
  cardScheme: string;
  paymentDescription: string;
  expiryDate?: string;
  maskedPan?: string;
}

export interface PayTabsWebhookPayload {
  tran_ref: string;
  tran_type: string;
  cart_id: string;
  cart_description: string;
  cart_currency: string;
  cart_amount: number;
  status: string;
  payment_result: PayTabsPaymentResult;
  customer_details: PayTabsCustomerDetails;
  payment_info: PayTabsPaymentInfo;
  ipn_trace: string;
  signature: string;
}

export interface PayTabsPaymentResult {
  response_status: string;
  response_code: string;
  response_message: string;
  transaction_time: string;
  payment_method: string;
  card_scheme: string;
  payment_description: string;
  expiryDate?: string;
  maskedPan?: string;
}

export interface PayTabsCustomerDetails {
  name: string;
  email: string;
  phone: string;
  street1: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  ip: string;
}

// Refund interfaces
export interface RefundRequest {
  originalTransactionId: string;
  refundAmount: number;
  reason?: string;
  merchantRefNum?: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  originalTransactionId?: string;
  refundAmount?: number;
  status: PaymentStatus;
  message?: string;
  errorCode?: string;
  timestamp: string;
}

// Error types
export interface FawryError extends PaymentError {
  fawryCode?: string;
  fawryMessage?: string;
}

export interface PayTabsError extends PaymentError {
  paytabsCode?: string;
  paytabsMessage?: string;
}

// Utility types
export enum PaymentProvider {
  FAWRY = 'fawry',
  PAYTABS = 'paytabs'
}

export interface PaymentConfig {
  provider: PaymentProvider;
  isProduction: boolean;
  credentials: {
    fawry?: {
      merchantCode: string;
      secureKey: string;
      baseUrl: string;
    };
    paytabs?: {
      profileId: string;
      serverKey: string;
      baseUrl: string;
      siteUrl: string;
    };
  };
  webhookSecret?: string;
  defaultCurrency: Currency;
  supportedCurrencies: Currency[];
}

// Logging interfaces
export interface PaymentLogEntry {
  timestamp: string;
  provider: PaymentProvider;
  operation: string;
  transactionId?: string;
  merchantRefNum?: string;
  amount?: number;
  currency?: string;
  status: PaymentStatus;
  error?: PaymentError;
  metadata?: any;
}