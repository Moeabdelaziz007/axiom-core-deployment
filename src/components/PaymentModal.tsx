'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, CheckCircle, Clock, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  amount: number;
  recipient: string;
  userId: string;
  currency?: string;
  label?: string;
  message?: string;
  splToken?: {
    mint?: string;
    decimals?: number;
  };
}

interface PaymentStatus {
  status: 'pending' | 'scanning' | 'confirmed' | 'verified' | 'finalized' | 'failed';
  message?: string;
  signature?: string;
  timestamp?: number;
  metadata?: any;
}

export const PaymentModal = ({ 
  isOpen, 
  onClose, 
  paymentId, 
  amount, 
  recipient, 
  userId,
  currency = 'SOL',
  label,
  message,
  splToken 
}: PaymentModalProps) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'pending' });
  const [serializedTransaction, setSerializedTransaction] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [referenceKey, setReferenceKey] = useState<string>('');
  const eventSourceRef = useRef<EventSource | null>(null);

  // Payment progression states for UI
  const progressionSteps = [
    { status: 'pending', label: 'Initializing', icon: Clock },
    { status: 'scanning', label: 'Awaiting Payment', icon: QrCode },
    { status: 'confirmed', label: 'Transaction Confirmed', icon: RefreshCw },
    { status: 'verified', label: 'Verification Complete', icon: CheckCircle },
    { status: 'finalized', label: 'Payment Finalized', icon: CheckCircle },
  ];

  // Get current step index
  const getCurrentStepIndex = (status: PaymentStatus['status']) => {
    return progressionSteps.findIndex(step => step.status === status);
  };

  // Check if step is completed
  const isStepCompleted = (stepIndex: number) => {
    const currentIndex = getCurrentStepIndex(paymentStatus.status);
    return stepIndex < currentIndex;
  };

  // Check if step is current
  const isStepCurrent = (stepIndex: number) => {
    const currentIndex = getCurrentStepIndex(paymentStatus.status);
    return stepIndex === currentIndex;
  };

  // Generate Solana Pay transaction
  const generatePayment = async () => {
    if (!paymentId) return;

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch(`/api/pay/req/${paymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amountLamports: amount,
          recipient,
          label: label || 'AxiomID Payment',
          message: message || `Payment for AxiomID services`,
          splToken,
          metadata: {
            paymentId,
            userId,
            timestamp: Date.now()
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        setReferenceKey(result.data.referenceKey);
        setSerializedTransaction(result.data.transaction.serialized);
        
        // Generate QR code for the serialized transaction
        await generateQRCode(`solana:${result.data.transaction.serialized}`);
        
        setPaymentStatus({ 
          status: 'scanning', 
          message: 'Scan QR code with your Solana wallet to authorize payment',
          timestamp: Date.now(),
          metadata: {
            amount: result.data.amount,
            referenceKey: result.data.referenceKey
          }
        });
        
        // Start SSE connection for real-time updates
        startSSEConnection();
      } else {
        setError(result.error || 'Failed to generate payment');
      }
    } catch (err) {
      console.error('Payment generation error:', err);
      setError('Failed to generate payment. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate QR code from URL
  const generateQRCode = async (url: string) => {
    try {
      // Simple QR code generation using a public API
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      setQrCode(qrApiUrl);
    } catch (err) {
      console.error('QR code generation error:', err);
      // Fallback: show URL as text
      setQrCode('');
    }
  };

  // Start Server-Sent Events connection
  const startSSEConnection = () => {
    if (!paymentId) return;

    const sseUrl = `/api/sse/payment-status/${paymentId}`;

    try {
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection opened');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different event types
          if (event.type === 'connected') {
            console.log('SSE connected:', data);
            return;
          }

          // Update payment status
          const newStatus = data.status as PaymentStatus['status'];
          setPaymentStatus({
            status: newStatus,
            message: getPaymentStatusMessage(newStatus),
            signature: data.metadata?.signature,
            timestamp: data.timestamp,
            metadata: data.metadata
          });

          // Auto-progress through states
          if (newStatus === 'verified' || newStatus === 'finalized') {
            setTimeout(() => {
              onClose();
            }, 3000);
          }
        } catch (parseError) {
          console.error('SSE parse error:', parseError);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setError('Connection lost. Retrying...');
        
        // Retry connection after delay
        setTimeout(() => {
          if (retryCount < 3) {
            setRetryCount(prev => prev + 1);
            startSSEConnection();
          }
        }, 2000);
      };

    } catch (err) {
      console.error('SSE connection error:', err);
      setError('Failed to establish real-time connection');
    }
  };

  // Get user-friendly status message
  const getPaymentStatusMessage = (status: PaymentStatus['status']): string => {
    switch (status) {
      case 'pending':
        return 'Initializing payment system...';
      case 'scanning':
        return 'Scan QR code with your Solana wallet to authorize payment';
      case 'confirmed':
        return 'Transaction confirmed on Solana network. Verifying...';
      case 'verified':
        return 'Payment verified! Finalizing...';
      case 'finalized':
        return 'Payment completed successfully!';
      case 'failed':
        return 'Payment failed. Please try again.';
      default:
        return 'Processing payment...';
    }
  };

  // Get status icon
  const getStatusIcon = (status: PaymentStatus['status'], isAnimated = false) => {
    const iconClass = `w-5 h-5 ${isAnimated ? 'animate-spin' : ''}`;
    
    switch (status) {
      case 'pending':
        return <Clock className={`${iconClass} text-yellow-500`} />;
      case 'scanning':
        return <QrCode className={`${iconClass} text-blue-500`} />;
      case 'confirmed':
        return <RefreshCw className={`${iconClass} text-orange-500 animate-spin`} />;
      case 'verified':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'finalized':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'failed':
        return <AlertCircle className={`${iconClass} text-red-500`} />;
      default:
        return <Clock className={`${iconClass} text-gray-500`} />;
    }
  };

  // Get status color for progress indicators
  const getStepColor = (stepIndex: number): string => {
    if (isStepCompleted(stepIndex)) return 'text-green-500 bg-green-500/20 border-green-500';
    if (isStepCurrent(stepIndex)) return 'text-blue-500 bg-blue-500/20 border-blue-500';
    return 'text-gray-500 bg-gray-500/20 border-gray-500';
  };

  // Manual retry
  const handleRetry = () => {
    setRetryCount(0);
    setError('');
    setPaymentStatus({ status: 'pending' });
    generatePayment();
  };

  // Manual status check
  const handleManualCheck = async () => {
    try {
      const response = await fetch(`/api/pay/check-status?paymentId=${paymentId}&referenceKey=${referenceKey}&userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setPaymentStatus({
          status: result.data.payment.status,
          message: getPaymentStatusMessage(result.data.payment.status),
          signature: result.data.payment.signature,
          timestamp: Date.now(),
          metadata: result.data.payment
        });
      } else {
        setError(result.error || 'Failed to check status');
      }
    } catch (err) {
      console.error('Manual check error:', err);
      setError('Failed to check payment status');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Generate payment when modal opens
  useEffect(() => {
    if (isOpen && paymentId) {
      generatePayment();
    }
  }, [isOpen, paymentId]);

  // Close SSE connection when modal closes
  useEffect(() => {
    if (!isOpen && eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-lg w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          title="Close payment modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Complete Payment</h2>
          <p className="text-gray-400">
            {amount} {currency} • {label || 'AxiomID Service'}
          </p>
        </div>

        {/* Progressive State Indicators */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {progressionSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = isStepCompleted(index);
              const isCurrent = isStepCurrent(index);
              
              return (
                <div key={step.status} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted ? 'bg-green-500/20 border-green-500' : 
                    isCurrent ? 'bg-blue-500/20 border-blue-500 animate-pulse' : 
                    'bg-gray-500/20 border-gray-500'
                  }`}>
                    {getStatusIcon(step.status, index === 2)}
                  </div>
                  
                  <div className="ml-2 flex flex-col">
                    <span className={`text-xs font-medium ${
                      isCompleted ? 'text-green-400' : 
                      isCurrent ? 'text-blue-400' : 
                      'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  
                  {index < progressionSteps.length - 1 && (
                    <div className={`mx-2 h-0.5 w-8 transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-600'
                    }`}>
                      {isCurrent && (
                        <div className="h-full bg-blue-500 animate-pulse"></div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Status */}
        <div className="border border-blue-500/20 bg-blue-500/10 rounded-xl p-4 mb-6 flex items-center gap-3">
          {getStatusIcon(paymentStatus.status, paymentStatus.status === 'confirmed')}
          <div className="flex-1">
            <p className="text-white font-medium">
              {paymentStatus.message || getPaymentStatusMessage(paymentStatus.status)}
            </p>
            {paymentStatus.timestamp && (
              <p className="text-xs text-gray-400">
                {new Date(paymentStatus.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* QR Code or Transaction Display */}
        {serializedTransaction && (
          <div className="mb-6">
            {qrCode ? (
              <div className="text-center">
                <img 
                  src={qrCode} 
                  alt="Payment QR Code" 
                  className="mx-auto mb-4 rounded-lg border border-white/10"
                />
                <p className="text-sm text-gray-400 mb-4">
                  Scan this QR code with your Solana wallet
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-300 break-all font-mono">
                    {serializedTransaction.substring(0, 50)}...
                  </p>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Transaction ready for signing
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleManualCheck}
            disabled={isGenerating}
            className="flex-1 bg-white/10 text-white rounded-xl p-3 font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            Check Status
          </button>
          
          {(error || paymentStatus.status === 'failed') && (
            <button
              onClick={handleRetry}
              disabled={isGenerating || retryCount >= 3}
              className="flex-1 bg-white/10 text-white rounded-xl p-3 font-medium hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              Retry ({retryCount}/3)
            </button>
          )}
        </div>

        {/* Transaction Details */}
        {paymentStatus.signature && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-400 mb-2">Transaction Signature:</p>
            <div className="bg-black/50 rounded-lg p-2">
              <p className="text-xs text-green-400 font-mono break-all">
                {paymentStatus.signature}
              </p>
            </div>
            <button
              onClick={() => {
                const explorerUrl = `https://solscan.io/tx/${paymentStatus.signature}`;
                window.open(explorerUrl, '_blank');
              }}
              className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View on Solscan →
            </button>
          </div>
        )}

        {/* Payment Info */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="text-xs text-gray-400 space-y-1">
            <p>Payment ID: {paymentId}</p>
            <p>Recipient: {recipient.slice(0, 8)}...{recipient.slice(-8)}</p>
            <p>Amount: {amount} {currency}</p>
            {referenceKey && <p>Reference: {referenceKey.substring(0, 20)}...</p>}
          </div>
        </div>
      </div>
    </div>
  );
};