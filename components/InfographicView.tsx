import React, { useState, useEffect, useRef } from 'react';
import { generateInfographic } from '../services/geminiService';
import { Image as ImageIcon, Loader2, RefreshCw, AlertCircle, Download } from 'lucide-react';

interface InfographicViewProps {
  description: string;
  imageUrl?: string;
  onImageGenerated: (url: string) => void;
}

const InfographicView: React.FC<InfographicViewProps> = ({ description, imageUrl, onImageGenerated }) => {
  // Initialize loading to true if we don't have an image yet, to show loading immediately
  const [loading, setLoading] = useState(!imageUrl);
  const [error, setError] = useState<string | null>(null);
  const effectRan = useRef(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await generateInfographic(description);
      onImageGenerated(url);
    } catch (err) {
      setError("Failed to generate infographic. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically generate if no image exists and we haven't tried yet in this session
    if (!imageUrl && !effectRan.current) {
      effectRan.current = true;
      handleGenerate();
    }
  }, [imageUrl]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-slate-100 min-h-[500px]">
      
      {/* Loading State */}
      {loading && (
        <div className="text-center animate-fade-in">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-slate-800">Generating Infographic...</h3>
          <p className="text-slate-500 mt-2">Visualizing your study notes. This may take a few seconds.</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center animate-fade-in max-w-lg">
             <div className="bg-red-50 p-4 rounded-full mb-4 inline-block">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Generation Failed</h3>
             <p className="text-slate-600 mb-6">{error}</p>
             <button
            onClick={handleGenerate}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      )}

      {/* Result State */}
      {imageUrl && !loading && (
        <div className="w-full flex flex-col items-center animate-fade-in">
          <div className="relative group w-full max-w-3xl rounded-xl overflow-hidden shadow-lg border border-slate-200">
             <img 
               src={imageUrl} 
               alt="Generated Infographic" 
               className="w-full h-auto object-contain bg-slate-100"
             />
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={imageUrl} 
                  download="neuro-notion-infographic.png"
                  className="flex items-center gap-2 bg-white/90 backdrop-blur text-slate-800 px-4 py-2 rounded-lg shadow-md hover:bg-white font-medium text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
             </div>
          </div>
          <div className="mt-8">
             <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfographicView;