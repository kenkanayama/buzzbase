interface StatusBadgeProps {
  status: 'measured' | 'pending';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'measured') {
    return (
      <span
        className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
        style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}
      >
        計測完了
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
      style={{ backgroundColor: '#fff8ed', color: '#f29801' }}
    >
      計測待ち
    </span>
  );
}
