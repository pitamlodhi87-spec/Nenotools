
import React, { useState, useRef, useEffect } from 'react';
import { Minimize2, RefreshCcw, Download, Check, ArrowRight, Image as ImageIcon, Scaling, Lock, Unlock, Settings, Info } from 'lucide-react';
import { ImageFormat } from '../types';
import { readFileAsDataURL, processImage, formatFileSize, getBase64Size, loadImage, compressToTargetSize } from '../services/imageUtils';
import { RelatedTools } from '../components/RelatedTools';
import { AdBanner } from '../components/Layout';

const ImageCompressor: React.FC = () => {
  const [srcImage, setSrcImage] = useState<string | null>(null);
  const [srcSize, setSrcSize] = useState<number>(0);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  
  // Resize State
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [enableResizing, setEnableResizing] = useState<boolean>(false);

  // Compression State
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [compSize, setCompSize] = useState<number>(0);
  const [quality, setQuality] = useState<number>(0.7);
  
  // Target File Size State
  const [targetSizeValue, setTargetSizeValue] = useState<string>('');
  const [targetSizeUnit, setTargetSizeUnit] = useState<'KB' | 'MB'>('KB');

  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounced processing effect
  useEffect(() => {
    if (!srcImage) return;

    setIsProcessing(true);
    const timer = setTimeout(() => {
      compress();
    }, 400); 

    return () => clearTimeout(timer);
  }, [quality, srcImage, width, height, enableResizing, targetSizeValue, targetSizeUnit]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSrcSize(file.size);
      setIsProcessing(true);
      setCompressedImage(null);
      try {
        const dataUrl = await readFileAsDataURL(file);
        setSrcImage(dataUrl);
        
        const img = await loadImage(dataUrl);
        setOriginalDimensions({ width: img.width, height: img.height });
        setWidth(img.width);
        setHeight(img.height);
        setAspectRatio(img.width / img.height);
        
        // Initial process will trigger via useEffect
      } catch (err) {
        console.error(err);
        setIsProcessing(false);
      }
    }
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockRatio) {
      setHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockRatio) {
      setWidth(Math.round(val * aspectRatio));
    }
  };

  const compress = async () => {
    if (!srcImage) return;
    try {
        let result;
        
        // 1. Handle Explicit Resize first (if enabled)
        // We use high quality (1.0) for this intermediate step to preserve detail before final compression
        let intermediateSrc = srcImage;
        if (enableResizing) {
            intermediateSrc = await processImage(srcImage, ImageFormat.JPEG, { width, height }, 1.0);
        }

        // 2. Handle Compression (Target Size OR Manual Quality)
        if (targetSizeValue) {
             let targetBytes = parseFloat(targetSizeValue);
             if (!isNaN(targetBytes) && targetBytes > 0) {
                 if (targetSizeUnit === 'KB') targetBytes *= 1024;
                 if (targetSizeUnit === 'MB') targetBytes *= 1024 * 1024;
                 
                 // Use the smart compression algorithm
                 result = await compressToTargetSize(intermediateSrc, ImageFormat.JPEG, targetBytes);
             } else {
                 // Fallback if invalid number is entered (treat as empty)
                 result = await processImage(intermediateSrc, ImageFormat.JPEG, undefined, quality);
             }
        } else {
             // Manual Quality Slider
             result = await processImage(intermediateSrc, ImageFormat.JPEG, undefined, quality);
        }

        setCompressedImage(result);
        setCompSize(getBase64Size(result));
    } catch(e) {
        console.error("Compression error:", e);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuality(parseFloat(e.target.value));
  };

  const handleDownload = () => {
    if (compressedImage) {
      const link = document.createElement('a');
      link.href = compressedImage;
      link.download = `compressed-filemakeron-${enableResizing ? `${width}x${height}-` : ''}${targetSizeValue ? 'auto' : Math.round(quality*100)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const reduction = srcSize > 0 && compSize > 0 ? Math.round(((srcSize - compSize) / srcSize) * 100) : 0;
  const isReductionPositive = reduction > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Image Compressor & Resizer</h1>
          <p className="text-gray-500">Reduce file size by up to 80% and resize dimensions in one go.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Upload and Controls */}
          <div className="space-y-6">
             <div 
               onClick={() => fileInputRef.current?.click()}
               className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-64 ${srcImage ? 'border-gray-300 bg-gray-50' : 'border-red-300 bg-red-50 hover:bg-red-100'}`}
             >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                {srcImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                     <img src={srcImage} alt="Original" className="max-h-full max-w-full object-contain opacity-50" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <button className="bg-white/90 text-gray-800 px-4 py-2 rounded-full shadow-sm font-medium hover:bg-white">Change Image</button>
                     </div>
                  </div>
                ) : (
                  <>
                    <Minimize2 className="text-red-500 mb-4" size={48} />
                    <p className="font-bold text-lg text-gray-800">Click to Upload Image</p>
                    <p className="text-gray-500 text-sm mt-1">Supports JPG, PNG, WEBP</p>
                  </>
                )}
             </div>
             
             {srcImage && (
               <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-6">
                 
                 {/* Resize Section */}
                 <div>
                    <div className="flex items-center justify-between mb-3">
                       <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={enableResizing} 
                            onChange={(e) => setEnableResizing(e.target.checked)}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                          />
                          <Scaling size={18} /> Resize Image
                       </label>
                       {enableResizing && (
                         <button 
                            onClick={() => {
                               setLockRatio(!lockRatio);
                               if (!lockRatio) setHeight(Math.round(width / aspectRatio));
                            }}
                            className="text-xs flex items-center gap-1 text-gray-500 hover:text-gray-900"
                         >
                            {lockRatio ? <Lock size={12}/> : <Unlock size={12}/>}
                            {lockRatio ? 'Ratio Locked' : 'Ratio Unlocked'}
                         </button>
                       )}
                    </div>
                    
                    {enableResizing && (
                      <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Width (px)</label>
                           <input 
                             type="number" 
                             value={width} 
                             onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                             className="w-full border-gray-300 rounded-lg p-2 text-sm"
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Height (px)</label>
                           <input 
                             type="number" 
                             value={height} 
                             onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                             className="w-full border-gray-300 rounded-lg p-2 text-sm"
                           />
                        </div>
                      </div>
                    )}
                 </div>

                 <hr className="border-gray-100" />

                 {/* Compression Section */}
                 <div>
                   <label className="flex items-center gap-2 font-bold text-gray-700 mb-3">
                      <Settings size={18} /> Compression Settings
                   </label>

                   {/* Target Size Input */}
                   <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-gray-600">Target File Size (Optional)</label>
                        <span className="text-xs text-gray-400">Leaves manual slider if empty</span>
                      </div>
                      <div className="flex gap-2">
                        <input 
                            type="number" 
                            placeholder="e.g. 100"
                            value={targetSizeValue}
                            onChange={(e) => setTargetSizeValue(e.target.value)}
                            className="flex-grow border border-gray-300 rounded-lg p-2 focus:ring-red-500 focus:border-red-500 text-sm"
                        />
                        <select
                            value={targetSizeUnit}
                            onChange={(e) => setTargetSizeUnit(e.target.value as any)}
                            className="w-20 border border-gray-300 rounded-lg p-2 bg-white text-sm"
                        >
                            <option value="KB">KB</option>
                            <option value="MB">MB</option>
                        </select>
                      </div>
                   </div>

                   {/* Manual Slider (Only visible if no target size) */}
                   {!targetSizeValue ? (
                     <div>
                       <div className="flex justify-between items-center mb-2">
                         <label className="text-sm text-gray-600 font-semibold">Manual Quality</label>
                         <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-bold">{Math.round(quality * 100)}%</span>
                       </div>
                       
                       <div className="relative pt-1">
                         <input 
                           type="range" 
                           min="0.1" 
                           max="0.9" 
                           step="0.01" 
                           value={quality} 
                           onChange={handleQualityChange}
                           className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                         />
                         <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                           <span>Low Quality (Small)</span>
                           <span>High Quality (Big)</span>
                         </div>
                       </div>
                     </div>
                   ) : (
                     <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 flex gap-2 border border-blue-100">
                        <Info size={16} className="flex-shrink-0" />
                        <p>Auto-Compress active: Quality will be automatically adjusted to fit under <strong>{targetSizeValue} {targetSizeUnit}</strong>.</p>
                     </div>
                   )}
                 </div>
               </div>
             )}
          </div>

          {/* Right Column: Preview and Results */}
          <div className="space-y-6">
            <div className="bg-gray-100 rounded-xl h-64 lg:h-96 flex items-center justify-center overflow-hidden relative border border-gray-200">
              {compressedImage ? (
                <img src={compressedImage} alt="Compressed" className="max-w-full max-h-full object-contain shadow-lg" />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                   <ImageIcon size={48} className="mb-2 opacity-30" />
                   <span className="font-medium">Compressed preview</span>
                </div>
              )}
               {isProcessing && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                  <RefreshCcw className="animate-spin text-red-600 mb-2" size={32} />
                  <span className="font-bold text-gray-800">Processing...</span>
                </div>
              )}
            </div>

            {compressedImage && !isProcessing && (
              <div className="bg-green-50 border border-green-200 p-5 rounded-xl animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                  <div className="text-center sm:text-left">
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Original Size</p>
                     <p className="text-lg font-bold text-gray-700">{formatFileSize(srcSize)}</p>
                     <p className="text-xs text-gray-500">{originalDimensions.width}x{originalDimensions.height}px</p>
                  </div>
                  
                  <ArrowRight className="text-green-400 hidden sm:block" />
                  
                  <div className="text-center sm:text-right">
                     <p className="text-xs text-gray-500 uppercase font-bold mb-1">Result Size</p>
                     <p className="text-2xl font-extrabold text-green-700">{formatFileSize(compSize)}</p>
                     {enableResizing && <p className="text-xs text-gray-500">{width}x{height}px</p>}
                  </div>
                </div>

                <div className="bg-white/50 rounded-lg p-2 mb-4 text-center border border-green-100">
                   {isReductionPositive ? (
                     <span className="text-green-700 font-bold flex items-center justify-center gap-2">
                       <Check size={18} /> Saved {reduction}% storage space!
                     </span>
                   ) : (
                     <span className="text-orange-600 font-medium text-sm">
                       File size increased (Check quality settings)
                     </span>
                   )}
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Image
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mid-Content Ad */}
      <AdBanner />

      {/* SEO Article & FAQ */}
      <article className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 prose prose-lg max-w-none text-gray-600">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Compress and Resize Images Online</h2>
        
        <p>
          Managing image files often involves two steps: resizing dimensions and compressing file size. 
          FileMakerOn's <strong>Image Compressor & Resizer</strong> combines these into a single, powerful tool. 
          Whether you need a 1200px wide image for a blog post or a sub-100KB file for an email attachment, you can do it all here.
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Resize Before Compressing?</h3>
        <p>
           Resizing is the most effective way to reduce file size. An image that comes straight from a modern camera might be 6000 pixels wide. 
           If you only need to display it at 800 pixels, resizing it eliminates millions of unnecessary pixels. 
           Combining this with our smart JPEG compression ensures the smallest possible file size with the highest visual quality.
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Features</h3>
        <ul className="list-disc pl-6 space-y-2">
           <li><strong>Dual Action:</strong> Enable "Resize Image" to change dimensions while you compress.</li>
           <li><strong>Aspect Ratio Lock:</strong> Automatically calculates height when you change width to prevent distortion.</li>
           <li><strong>Target File Size (PRO):</strong> Specify a maximum file size (e.g. 50 KB), and the tool will automatically find the best compression level to meet your target.</li>
        </ul>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Frequently Asked Questions (FAQ)</h3>
        
        <div className="space-y-4">
          <div>
             <h5 className="font-bold text-gray-900">What format is the output?</h5>
             <p>The compressor outputs standard JPEG files, which offer the best balance of quality and size for photographs and web images.</p>
          </div>
          <div>
             <h5 className="font-bold text-gray-900">How do I just compress without resizing?</h5>
             <p>Simply uncheck the "Resize Image" box (it is unchecked by default). The tool will keep original dimensions and only apply compression.</p>
          </div>
          <div>
             <h5 className="font-bold text-gray-900">How does "Target File Size" work?</h5>
             <p>When you enter a target size (e.g. 100KB), we perform a binary search on the quality settings to find the highest possible quality that results in a file smaller than 100KB. If quality reduction isn't enough, we may slightly reduce dimensions to guarantee the file fits.</p>
          </div>
        </div>
      </article>

      <RelatedTools />
    </div>
  );
};

export default ImageCompressor;
