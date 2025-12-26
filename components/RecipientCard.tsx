
import React from 'react';
import { User, Music, Mic, Users, Table as TableIcon } from 'lucide-react';
import { Recipient, RecipientType } from '../types';

interface RecipientCardProps {
  recipient: Recipient;
  onClick: () => void;
}

const getIcon = (type: RecipientType) => {
  switch (type) {
    case RecipientType.CELEBRANT: return <User className="w-5 h-5" />;
    case RecipientType.DJ: return <Music className="w-5 h-5" />;
    case RecipientType.MC: return <Mic className="w-5 h-5" />;
    case RecipientType.TABLE: return <TableIcon className="w-5 h-5" />;
    default: return <Users className="w-5 h-5" />;
  }
};

const RecipientCard: React.FC<RecipientCardProps> = ({ recipient, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-purple-600/20 hover:border-purple-500/50 transition-all active:scale-95 text-center overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
        {getIcon(recipient.type)}
      </div>
      <div className="mb-3 p-4 bg-white/10 rounded-full group-hover:bg-purple-500/20 group-hover:scale-110 transition-all">
        {getIcon(recipient.type)}
      </div>
      <h3 className="font-bold text-lg leading-tight mb-1">{recipient.label}</h3>
      <p className="text-xs uppercase tracking-widest text-gray-500 group-hover:text-purple-400 font-medium">
        {recipient.type === RecipientType.TABLE ? `Table ${recipient.table_no}` : recipient.type}
      </p>
    </button>
  );
};

export default RecipientCard;
