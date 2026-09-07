import Icon from './Icon';

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-on-background/40 backdrop-blur-sm">
      <div className="w-full sm:max-w-lg bg-surface-container-lowest rounded-t-xl sm:rounded-xl max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-surface-container-lowest flex items-center justify-between p-space-md border-b border-outline-variant/40">
          <h3 className="font-display text-headline-sm text-primary">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-variant/40">
            <Icon name="close" />
          </button>
        </div>
        <div className="p-space-md">{children}</div>
      </div>
    </div>
  );
}
