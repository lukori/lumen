import React, { useState } from 'react';
import { ChevronLeft, Download, Loader2, ArrowUpRight, RefreshCcw, Save, Check } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Project, Generation, AspectRatioMode, UploadedFile } from '../types';
import { MOCK_METADATA_VARIATIONS } from '../constants';
import UploadZone from './UploadZone';
import AspectRatioControl from './AspectRatioControl';
import MetadataPanel from './MetadataPanel';

interface StudioProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (updatedProject: Project) => void;
}

const Studio: React.FC<StudioProps> = ({ project, onBack, onUpdateProject }) => {
  // --- State ---
  const [activeGeneration, setActiveGeneration] = useState<Generation | null>(
    project.generations.length > 0 ? project.generations[0] : null
  );
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('portrait');
  
  // Upload states
  const [productImg, setProductImg] = useState<UploadedFile | null>(null);
  const [lightingImg, setLightingImg] = useState<UploadedFile | null>(null);
  const [envImg, setEnvImg] = useState<UploadedFile | null>(null);

  // --- Handlers ---

  const handleUpload = (file: File, type: 'product' | 'lighting' | 'environment') => {
    const previewUrl = URL.createObjectURL(file);
    const uploadData = { file, previewUrl, type };
    if (type === 'product') setProductImg(uploadData);
    if (type === 'lighting') setLightingImg(uploadData);
    if (type === 'environment') setEnvImg(uploadData);
  };

  const handleIterate = () => {
    if (!activeGeneration) return;

    // Helper to convert data URL to File
    const dataURLtoFile = (dataurl: string, filename: string) => {
      const arr = dataurl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) return null;
      
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    };

    const file = dataURLtoFile(activeGeneration.imageUrl, `iteration_${activeGeneration.id.slice(-6)}.png`);
    
    if (file) {
      handleUpload(file, 'product');
      // Visual feedback: scroll inputs into view
      const container = document.querySelector('.custom-scrollbar');
      if (container) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleManualSave = async () => {
      setIsSaving(true);
      try {
          // Trigger update on the parent to ensure persistence
          await onUpdateProject({
              ...project,
              lastEdited: new Date().toISOString()
          });
          // Visual delay for UX
          await new Promise(r => setTimeout(r, 600));
      } catch (err) {
          console.error("Manual save failed", err);
      } finally {
          setIsSaving(false);
      }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const parts: any[] = [];

      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
             const res = reader.result as string;
             resolve(res.split(',')[1]); 
          };
          reader.onerror = error => reject(error);
        });
      };

      // Construct Prompt with Semantic Separation
      // 1. Product (Subject)
      if (productImg) {
        const b64 = await fileToBase64(productImg.file);
        parts.push({ inlineData: { mimeType: productImg.file.type, data: b64 } });
        parts.push({ text: "Subject Reference: Use this image as the main product shape and design source." });
      }

      // 2. Lighting (Style)
      if (lightingImg) {
        const b64 = await fileToBase64(lightingImg.file);
        parts.push({ inlineData: { mimeType: lightingImg.file.type, data: b64 } });
        parts.push({ text: "Lighting Reference: Extract ONLY the lighting style (direction, color, intensity, shadows) from this image and apply it to the subject." });
      }

      // 3. Environment (Style)
      if (envImg) {
        const b64 = await fileToBase64(envImg.file);
        parts.push({ inlineData: { mimeType: envImg.file.type, data: b64 } });
        parts.push({ text: "Environment Reference: Extract ONLY the background/environment context from this image and place the subject within it." });
      }

      // 4. Text Prompt
      const basePrompt = "Generate a photorealistic industrial design render.";
      const specificInstructions = [];
      if (productImg) specificInstructions.push("Keep the subject design.");
      if (lightingImg) specificInstructions.push("Apply the referenced lighting style.");
      if (envImg) specificInstructions.push("Use the referenced environment.");
      
      const userPrompt = prompt ? `User Details: ${prompt}` : "High quality, 8k resolution.";

      parts.push({ text: `${basePrompt} ${specificInstructions.join(" ")} ${userPrompt}` });

      // Map Aspect Ratio
      let ratio = "1:1";
      switch(aspectRatio) {
        case 'portrait': ratio = '9:16'; break;
        case 'landscape': ratio = '16:9'; break;
        case 'square': ratio = '1:1'; break;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            imageConfig: {
                aspectRatio: ratio
            }
        }
      });

      // Extract Image
      let generatedImageUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                  generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
                  break;
              }
          }
      }

      if (generatedImageUrl) {
         const randomMetaIndex = Math.floor(Math.random() * MOCK_METADATA_VARIATIONS.length);
         
         const newGen: Generation = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            imageUrl: generatedImageUrl,
            prompt: prompt,
            aspectRatio: aspectRatio,
            metadata: MOCK_METADATA_VARIATIONS[randomMetaIndex],
         };

         // Update project with new generation AND update thumbnail
         const updatedProject = {
            ...project,
            thumbnailUrl: generatedImageUrl, 
            generations: [newGen, ...project.generations],
            lastEdited: new Date().toISOString(),
         };

         onUpdateProject(updatedProject);
         setActiveGeneration(newGen);
      } else {
          console.warn("No image returned from API");
      }

    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHistoryClick = (gen: Generation) => {
    setActiveGeneration(gen);
    setPrompt(gen.prompt);
    setAspectRatio(gen.aspectRatio);
  };

  const handleDownload = () => {
    if (!activeGeneration) return;
    
    const link = document.createElement('a');
    link.href = activeGeneration.imageUrl;
    const safeName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `lumen_${safeName}_${activeGeneration.id.slice(-6)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Render ---
  
  return (
    <div className="flex h-screen bg-[#121212] text-white overflow-hidden">
      
      {/* LEFT COLUMN: Inputs */}
      <div className="w-[20%] min-w-[280px] border-r border-neutral-800 flex flex-col bg-[#161616]">
        <div className="h-14 border-b border-neutral-800 flex items-center px-4">
          <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
            <ChevronLeft size={16} />
            Back to Dashboard
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            <h2 className="text-sm font-semibold text-white mb-6 tracking-wide">Studio Controls</h2>

            {/* Uploads */}
            <div className="space-y-1 mb-8">
                <UploadZone 
                    label="Product Input (Main)" 
                    previewUrl={productImg?.previewUrl || null} 
                    onUpload={(f) => handleUpload(f, 'product')}
                    onClear={() => setProductImg(null)}
                />
                <UploadZone 
                    label="Lighting Ref (Style)" 
                    previewUrl={lightingImg?.previewUrl || null} 
                    onUpload={(f) => handleUpload(f, 'lighting')}
                    onClear={() => setLightingImg(null)}
                />
                <UploadZone 
                    label="Environment Ref (Style)" 
                    previewUrl={envImg?.previewUrl || null} 
                    onUpload={(f) => handleUpload(f, 'environment')}
                    onClear={() => setEnvImg(null)}
                />
            </div>

            <div className="h-px bg-neutral-800 mb-6 w-full"></div>

            {/* Aspect Ratio */}
            <AspectRatioControl value={aspectRatio} onChange={setAspectRatio} />

            <div className="h-px bg-neutral-800 mb-6 w-full"></div>

            {/* Prompt */}
            <div className="mb-6">
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    Design Prompt
                </label>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe materials, mood, and specific details..."
                    className="w-full bg-black border border-neutral-800 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 min-h-[120px] resize-none transition-colors"
                />
            </div>

            {/* Action */}
            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Rendering...
                    </>
                ) : (
                    "Generate Render"
                )}
            </button>
        </div>
      </div>

      {/* MIDDLE COLUMN: Stage */}
      <div className="w-[60%] flex flex-col bg-[#0a0a0a]">
        {/* Project Title Header */}
        <div className="h-14 border-b border-neutral-800 flex items-center justify-between px-6 bg-[#121212]">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-300">{project.name}</span>
                <span className="text-xs text-gray-600 bg-black/30 px-2 py-1 rounded border border-neutral-800 font-mono">
                    {activeGeneration ? activeGeneration.id.slice(-6) : 'READY'}
                </span>
            </div>
            
            <button 
                onClick={handleManualSave}
                disabled={isSaving}
                className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded transition-all duration-300 ${isSaving ? 'text-green-500 bg-green-500/10' : 'text-gray-400 hover:text-white hover:bg-neutral-800'}`}
            >
                {isSaving ? (
                    <>
                        <Check size={14} />
                        Saved
                    </>
                ) : (
                    <>
                        <Save size={14} />
                        Save Project
                    </>
                )}
            </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>

            {isGenerating ? (
                <div className="flex flex-col items-center justify-center z-10">
                    <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400 font-light tracking-widest text-sm animate-pulse">COMPUTING LIGHT RAYS...</p>
                </div>
            ) : activeGeneration ? (
                <div className="relative max-w-full max-h-full shadow-2xl shadow-black border border-neutral-800">
                    <img 
                        src={activeGeneration.imageUrl} 
                        alt="Generated Output" 
                        className="max-w-full max-h-[calc(100vh-300px)] object-contain"
                    />
                </div>
            ) : (
                <div className="text-center text-neutral-600 max-w-md border border-dashed border-neutral-800 p-12 rounded-xl bg-neutral-900/20">
                    <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500">
                        <ArrowUpRight size={24} />
                    </div>
                    <p className="text-lg font-medium mb-2">Stage Ready</p>
                    <p className="text-sm">Configure inputs on the left and click Generate to start rendering.</p>
                </div>
            )}
        </div>

        {/* Metadata & Actions */}
        <div className="bg-[#161616] relative z-20">
            <MetadataPanel metadata={activeGeneration?.metadata || null} isLoading={isGenerating} />
            
            {activeGeneration && !isGenerating && (
                 <div className="px-6 pb-6 flex items-center justify-end gap-3">
                    <button 
                        onClick={handleIterate}
                        className="flex items-center gap-2 text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded border border-neutral-700 transition-colors"
                        title="Use this image as input for the next render"
                    >
                        <RefreshCcw size={16} />
                        Iterate
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded border border-neutral-700 transition-colors"
                    >
                        <Download size={16} />
                        Download
                    </button>
                 </div>
            )}
        </div>
      </div>

      {/* RIGHT COLUMN: History */}
      <div className="w-[20%] min-w-[260px] border-l border-neutral-800 bg-[#161616] flex flex-col">
         <div className="h-14 border-b border-neutral-800 flex items-center px-5">
           <h3 className="text-sm font-semibold text-white tracking-wide">Session History</h3>
         </div>
         
         <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {project.generations.length === 0 ? (
                <div className="text-center mt-10 text-gray-600 text-sm italic">
                    No renders yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {project.generations.map((gen) => (
                        <div 
                            key={gen.id}
                            onClick={() => handleHistoryClick(gen)}
                            className={`group cursor-pointer rounded-lg overflow-hidden border transition-all duration-200 
                                ${activeGeneration?.id === gen.id ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-neutral-800 hover:border-neutral-600 opacity-70 hover:opacity-100'}`}
                        >
                            <div className="aspect-video bg-black relative">
                                <img src={gen.imageUrl} alt="thumb" className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                    <span className="text-[10px] text-gray-300 font-mono block">
                                        {new Date(gen.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                            {/* Prompt Snippet */}
                            <div className="p-3 bg-[#1f1f1f]">
                                <p className="text-xs text-gray-400 line-clamp-2 group-hover:text-gray-200">
                                    {gen.prompt || "No prompt provided..."}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
         </div>
      </div>

    </div>
  );
};

export default Studio;