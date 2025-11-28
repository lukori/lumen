import React from 'react';
import { AspectRatioMode } from '../types';
import { Monitor, Smartphone, Square } from 'lucide-react';

interface AspectRatioControlProps {
  value: AspectRatioMode;
  onChange: (mode: AspectRatioMode) => void;
}

const AspectRatioControl: React.FC<AspectRatioControlProps> = ({ value, onChange }) => {
  // Calculate preview dimensions based on selection
  const getPreviewStyle = () => {
    switch (value) {
      case 'portrait': return { width: '20px', height: '32px' }; // 9:16 approx
      case 'landscape': return { width: '32px', height: '20px' }; // 16:9 approx
      case 'square': return { width: '26px', height: '26px' }; // 1:1
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
        Format & Ratio
      </label>
      
      <div className="flex items-stretch gap-3">
        {/* Toggle Buttons */}
        <div className="flex-1 flex items-center justify-between bg-neutral-900 p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => onChange('portrait')}
            className={`flex-1 flex justify-center items-center py-2 rounded-md transition-all ${value === 'portrait' ? 'bg-neutral-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            title="Portrait (9:16)"
          >
            <Smartphone size={16} />
          </button>
          <button
            onClick={() => onChange('square')}
            className={`flex-1 flex justify-center items-center py-2 rounded-md transition-all ${value === 'square' ? 'bg-neutral-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            title="Square (1:1)"
          >
            <Square size={16} />
          </button>
          <button
            onClick={() => onChange('landscape')}
            className={`flex-1 flex justify-center items-center py-2 rounded-md transition-all ${value === 'landscape' ? 'bg-neutral-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            title="Landscape (16:9)"
          >
            <Monitor size={16} />
          </button>
        </div>

        {/* Visual Preview Box */}
        <div className="w-12 flex-shrink-0 flex items-center justify-center border border-neutral-800 rounded-lg bg-neutral-900">
            <div 
                className="border-[1.5px] border-dashed border-blue-500/70 bg-blue-500/10 transition-all duration-300 ease-in-out rounded-sm"
                style={getPreviewStyle()}
            />
        </div>
      </div>
    </div>
  );
};

export default AspectRatioControl;