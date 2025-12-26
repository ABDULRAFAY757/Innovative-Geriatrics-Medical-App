import { useState } from 'react';
import { CreditCard, Smartphone } from 'lucide-react';
import { Modal, Button, Input } from './UIComponents';
import { useLanguage } from '../../contexts/LanguageContext';
import { clsx } from 'clsx';

const PaymentModal = ({ isOpen, onClose, amount, description, onSuccess, onPaymentSuccess, title, disabled }) => {
  // Support both onSuccess and onPaymentSuccess prop names for backward compatibility
  const handleSuccess = onPaymentSuccess || onSuccess;

  const { t, isRTL } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const paymentMethods = [
    { id: 'credit_card', label: t('credit_card'), icon: CreditCard },
    { id: 'mada_card', label: t('mada_card'), icon: CreditCard },
    { id: 'apple_pay', label: t('apple_pay'), icon: Smartphone },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryDateChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setFormData(prev => ({ ...prev, expiryDate: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);

      // Determine card type based on payment method
      let cardType = 'Credit Card';
      if (paymentMethod === 'mada_card') cardType = 'Mada Card';
      if (paymentMethod === 'apple_pay') cardType = 'Apple Pay';

      const paymentData = {
        amount,
        description,
        paymentMethod,
        cardType, // Add cardType for compatibility
        timestamp: new Date().toISOString(),
        status: 'success',
        transactionId: `TXN${Date.now()}`,
        receipt_number: `RCP${Date.now()}`,
      };

      if (handleSuccess) {
        handleSuccess(paymentData);
      }
      onClose();

      // Reset form
      setFormData({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
      });
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('payment')} size="lg">
      <div className={clsx(isRTL && 'font-arabic')} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Payment Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('description')}</p>
              <p className="font-medium text-gray-900">{description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{t('total_amount')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {amount} {t('sar')}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('payment_method')}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={clsx(
                    'p-4 border-2 rounded-lg transition-all',
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  )}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm font-medium text-gray-900">{method.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {(paymentMethod === 'credit_card' || paymentMethod === 'mada_card') && (
            <>
              <Input
                label={t('card_number')}
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('expiry_date')}
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleExpiryDateChange}
                  placeholder="MM/YY"
                  maxLength="5"
                />
                <Input
                  label={t('cvv')}
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  maxLength="4"
                  type="password"
                />
              </div>

              <Input
                label={t('cardholder_name')}
                name="cardholderName"
                value={formData.cardholderName}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </>
          )}

          {paymentMethod === 'apple_pay' && (
            <div className="bg-black text-white rounded-lg p-8 text-center">
              <Smartphone className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Pay with Apple Pay</p>
              <p className="text-sm text-gray-300">Touch ID or Face ID to complete payment</p>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-800">
              🔒 Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? t('processing') : `${t('confirm')} ${amount} ${t('sar')}`}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PaymentModal;
