import React from 'react';

interface Recipient {
  id: string;
  label: string;
}

interface RecipientPickerProps {
  recipients: Recipient[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const RecipientPicker: React.FC<RecipientPickerProps> = ({ recipients, selectedId, onSelect }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-[0.2em] text-white/60">Pick recipient</h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {recipients.map((recipient) => (
          <button
            key={recipient.id}
            onClick={() => onSelect(recipient.id)}
            className={`shrink-0 px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
              selectedId === recipient.id
                ? 'bg-purple-500 text-white border-purple-400'
                : 'bg-white/5 border-white/10 text-white/70'
            }`}
          >
            {recipient.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecipientPicker;
