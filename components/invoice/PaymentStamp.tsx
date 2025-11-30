'use client';

interface PaymentStampProps {
  paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PaymentStamp({
  paymentStatus,
  size = 'md',
  className = '',
}: PaymentStampProps) {
  const getStampConfig = () => {
    switch (paymentStatus) {
      case 'PAID':
        return {
          text: 'PAID',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-300',
          textColor: 'text-green-700',
          badgeColor: 'bg-green-100 text-green-800',
        };
      case 'PARTIALLY_PAID':
        return {
          text: 'PARTIALLY PAID',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-300',
          textColor: 'text-yellow-700',
          badgeColor: 'bg-yellow-100 text-yellow-800',
        };
      case 'UNPAID':
      default:
        return {
          text: 'UNPAID',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-300',
          textColor: 'text-red-700',
          badgeColor: 'bg-red-100 text-red-800',
        };
    }
  };

  const config = getStampConfig();

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-block ${sizeClasses[size]} font-bold rounded border-2 ${config.borderColor} ${config.bgColor} ${config.textColor} ${className}`}
    >
      {config.text}
    </span>
  );
}
