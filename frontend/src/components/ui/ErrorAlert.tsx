import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div
      className="flex items-start gap-3 rounded-lg border p-4"
      style={{ backgroundColor: '#fff1f0', borderColor: '#ffc8c4' }}
    >
      <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#e61f13' }} />
      <p className="text-sm" style={{ color: '#e61f13' }}>
        {message}
      </p>
    </div>
  );
}
