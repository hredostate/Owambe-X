import React from 'react';
import { formatNaira } from '../lib/money';

interface AmountChipsProps {
  amounts: number[];
  selected: number;
  onSelect: (amount: number) => void;
  onCustom: () => void;
}

const AmountChips: React.FC<AmountChipsProps> = ({ amounts, selected, onSelect, onCustom }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-xs uppercase tracking-[0.2em] text-white/60">Pick amount</h3>
      <div className="grid grid-cols-3 gap-2">
        {amounts.map((amount) => (
          <button
            key={amount}
            onClick={() => onSelect(amount)}
            className={`py-2 rounded-xl border text-sm font-bold ${
              selected === amount
                ? 'bg-white text-black border-white'
                : 'bg-white/5 border-white/10 text-white'
            }`}
          >
            {formatNaira(amount)}
          </button>
        ))}
        <button
          onClick={onCustom}
          className="py-2 rounded-xl border text-sm font-bold bg-white/5 border-dashed border-white/30 text-white"
        >
          Custom
        </button>
      </div>
    </div>
  );
};

export default AmountChips;
