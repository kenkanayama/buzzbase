import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxHeight?: string;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = 'max-h-[90vh]',
  className = '',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div className="fixed bottom-0 left-0 right-0 top-0 bg-black/50" onClick={onClose} />
      {/* モーダルコンテンツ */}
      <div
        className={`relative z-10 mx-4 w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl ${maxHeight} ${className}`}
      >
        {/* ヘッダー */}
        {title && (
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {/* コンテンツ */}
        {children}
      </div>
    </div>
  );
}
