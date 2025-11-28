import React from 'react';
import { TechnicalMetadata } from '../types';
import { Aperture, Camera, Zap, Mountain } from 'lucide-react';

interface MetadataPanelProps {
  metadata: TechnicalMetadata | null;
  isLoading: boolean;
}

const MetadataPanel: React.FC<MetadataPanelProps> = ({ metadata, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full bg-neutral-900/50 border-t border-neutral-800 p-6 animate-pulse">
        <div className="h-4 w-32 bg-neutral-800 rounded mb-4"></div>
        <div className="grid grid-cols-3 gap-8">
           <div className="h-12 bg-neutral-800 rounded"></div>
           <div className="h-12 bg-neutral-800 rounded"></div>
           <div className="h-12 bg-neutral-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="w-full bg-[#161616] border-t border-neutral-800 p-6 flex items-center justify-center text-neutral-500 text-sm">
        Generate an image to view technical analysis.
      </div>
    );
  }

  return (
    <div className="w-full bg-[#161616] border-t border-neutral-800 p-6">
      <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Aperture size={14} />
        AI Reasoning Engine
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center text-gray-400 text-xs uppercase tracking-wide mb-1">
            <Zap size={12} className="mr-1.5" />
            Lighting Setup
          </div>
          <p className="text-sm text-white font-medium">{metadata.lighting}</p>
        </div>

        <div className="flex flex-col space-y-1">
          <div className="flex items-center text-gray-400 text-xs uppercase tracking-wide mb-1">
            <Camera size={12} className="mr-1.5" />
            Camera Settings
          </div>
          <p className="text-sm text-white font-medium">{metadata.camera}</p>
        </div>

        <div className="flex flex-col space-y-1">
          <div className="flex items-center text-gray-400 text-xs uppercase tracking-wide mb-1">
            <Mountain size={12} className="mr-1.5" />
            Environment
          </div>
          <p className="text-sm text-white font-medium">{metadata.environment}</p>
        </div>
      </div>
    </div>
  );
};

export default MetadataPanel;