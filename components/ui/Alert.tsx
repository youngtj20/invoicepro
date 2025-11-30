import { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
  className?: string;
}

export default function Alert({ variant = 'info', children, className }: AlertProps) {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600" />,
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <XCircle className="w-5 h-5 text-red-600" />,
    },
  };

  const { container, icon } = variants[variant];

  return (
    <div className={cn('border rounded-lg p-4 flex items-start gap-3', container, className)}>
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
