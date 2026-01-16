import { ChevronDown } from 'lucide-react';

type Props<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  children: React.ReactNode;
};

export default function PillSelect<T extends string>({
  value,
  onChange,
  children,
}: Props<T>) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-black/40 border border-gray-600 text-white pl-4 pr-10 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-black/80 transition-all appearance-none"
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}
