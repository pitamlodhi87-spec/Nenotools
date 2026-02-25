import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCcw, Lock, Unlock, Image as ImageIcon, Settings, Save, Info } from 'lucide-react';
import { ImageFormat } from '../types';
import { readFileAsDataURL, processImage, loadImage, formatFileSize, getBase64Size, compressToTargetSize } from '../services/imageUtils';
import { RelatedTools } from '../components/RelatedTools';
import { AdBanner, Banner728x90 } from '../components/Layout';

type Unit = 'px' | '%' | 'inch';

const ImageResizer: React.FC = () => {
  const [srcImage, setSrcImage] = useState<string | null>(null);
  const [srcSize, setSrcSize] = useState<number>(0);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });

  // Target Dimensions in Pixels (Internal state)
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  
  // Local string states for inputs to handle typing gracefully
  const [widthInput, setWidthInput] = useState<string>('0');
  const [heightInput, setHeightInput] = useState<string>('0');
  
  // Settings
  const [unit, setUnit] = useState<Unit>('px');
  const [format, setFormat] = useState<ImageFormat>(ImageFormat.JPEG);
  const [quality, setQuality] = useState<number>(0.92);
  const [lockRatio, setLockRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  
  // Target File Size Settings
  const [targetSizeValue, setTargetSizeValue] = useState<string>('');
  const [targetSizeUnit, setTargetSizeUnit] = useState<'KB' | 'MB'>('KB');

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [outSize, setOutSize] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setSrcSize(file.size);
      try {
        const dataUrl = await readFileAsDataURL(file);
        setSrcImage(dataUrl);
        const img = await loadImage(dataUrl);
        
        const dims = { width: img.width, height: img.height };
        setOriginalDimensions(dims);
        setWidth(img.width);
        setHeight(img.height);
        
        const ratio = img.width / img.height;
        setAspectRatio(ratio);
        
        // Update input strings based on current unit
        syncInputsFromPixels(img.width, img.height, ratio, unit, dims);
        
        // Initial process
        const res = await processImage(dataUrl, format, dims, quality);
        setProcessedImage(res);
        setOutSize(getBase64Size(res));
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const syncInputsFromPixels = (w: number, h: number, ratio: number, currentUnit: Unit, dims: {width: number, height: number}) => {
    if (currentUnit === 'px') {
      setWidthInput(Math.round(w).toString());
      setHeightInput(Math.round(h).toString());
    } else if (currentUnit === '%') {
      setWidthInput(Math.round((w / dims.width) * 100).toString());
      setHeightInput(Math.round((h / dims.height) * 100).toString());
    } else if (currentUnit === 'inch') {
      setWidthInput((w / 96).toFixed(2));
      setHeightInput((h / 96).toFixed(2));
    }
  };

  // When unit changes, we need to refresh the display strings based on current pixels
  useEffect(() => {
    if (srcImage) {
      syncInputsFromPixels(width, height, aspectRatio, unit, originalDimensions);
    }
  }, [unit]);

  const handleWidthInputChange = (valStr: string) => {
    setWidthInput(valStr);
    const val = parseFloat(valStr);
    if (isNaN(val)) return;

    let newPixels = 0;
    if (unit === 'px') newPixels = val;
    if (unit === '%') newPixels = (val / 100) * originalDimensions.width;
    if (unit === 'inch') newPixels = val * 96;

    newPixels = Math.max(1, Math.round(newPixels));
    setWidth(newPixels);

    if (lockRatio) {
      const newHeight = Math.max(1, Math.round(newPixels / aspectRatio));
      setHeight(newHeight);
      // Sync height input string too
      if (unit === 'px') setHeightInput(newHeight.toString());
      else if (unit === '%') setHeightInput(Math.round((newHeight / originalDimensions.height) * 100).toString());
      else if (unit === 'inch') setHeightInput((newHeight / 96).toFixed(2));
    }
  };

  const handleHeightInputChange = (valStr: string) => {
    setHeightInput(valStr);
    const val = parseFloat(valStr);
    if (isNaN(val)) return;

    let newPixels = 0;
    if (unit === 'px') newPixels = val;
    if (unit === '%') newPixels = (val / 100) * originalDimensions.height;
    if (unit === 'inch') newPixels = val * 96;

    newPixels = Math.max(1, Math.round(newPixels));
    setHeight(newPixels);

    if (lockRatio) {
      const newWidth = Math.max(1, Math.round(newPixels * aspectRatio));
      setWidth(newWidth);
      // Sync width input string too
      if (unit === 'px') setWidthInput(newWidth.toString());
      else if (unit === '%') setWidthInput(Math.round((newWidth / originalDimensions.width) * 100).toString());
      else if (unit === 'inch') setWidthInput((newWidth / 96).toFixed(2));
    }
  };

  const handleProcess = async () => {
    if (!srcImage) return;
    setIsProcessing(true);
    try {
      // Use pixel values directly for processing
      let result = await processImage(srcImage, format, { width, height }, quality);
      
      if (targetSizeValue) {
         let targetBytes = parseFloat(targetSizeValue);
         if (!isNaN(targetBytes) && targetBytes > 0) {
             if (targetSizeUnit === 'KB') targetBytes *= 1024;
             if (targetSizeUnit === 'MB') targetBytes *= 1024 * 1024;
             result = await compressToTargetSize(result, format, targetBytes);
         }
      }

      setProcessedImage(result);
      setOutSize(getBase64Size(result));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      let ext = 'jpg';
      if (format === ImageFormat.PNG) ext = 'png';
      if (format === ImageFormat.WEBP) ext = 'webp';
      
      link.download = `resized-${width}x${height}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 pb-6 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Advanced Image Resizer</h1>
          <p className="text-gray-500">Resize by pixels, percentage, or inches. Convert formats and optimize file size.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Section */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 space-y-6">
                
                {/* Upload Button */}
                <div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-chrome-blue transition-colors shadow-sm active:bg-gray-100"
                  >
                    <Upload size={18} />
                    {srcImage ? 'Change Image' : 'Upload Image'}
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                {srcImage && (
                  <>
                    <div className="text-xs sm:text-sm text-gray-500 flex justify-between">
                      <span>Original: {originalDimensions.width}x{originalDimensions.height} px</span>
                      <span>{formatFileSize(srcSize)}</span>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Dimensions & Units */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                         <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                           <Settings size={14} /> Resize Options
                         </label>
                         <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                           {(['px', '%', 'inch'] as Unit[]).map((u) => (
                             <button
                               key={u}
                               onClick={() => setUnit(u)}
                               className={`px-3 py-1 text-xs rounded-md transition-colors ${unit === u ? 'bg-chrome-blue text-white' : 'text-gray-500 hover:text-gray-900'}`}
                             >
                               {u}
                             </button>
                           ))}
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Width ({unit})</label>
                          <input 
                            type="text" 
                            value={widthInput}
                            onChange={(e) => handleWidthInputChange(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-chrome-blue focus:border-chrome-blue bg-white p-2.5 text-gray-900 font-medium shadow-sm transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Height ({unit})</label>
                          <input 
                            type="text" 
                            value={heightInput}
                            onChange={(e) => handleHeightInputChange(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-chrome-blue focus:border-chrome-blue bg-white p-2.5 text-gray-900 font-medium shadow-sm transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => setLockRatio(!lockRatio)}
                          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${lockRatio ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}
                        >
                          {lockRatio ? <Lock size={12} /> : <Unlock size={12} />}
                          {lockRatio ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
                        </button>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Format & Quality */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Output Format</label>
                        <div className="grid grid-cols-3 gap-2">
                           {[
                             { label: 'JPG', val: ImageFormat.JPEG },
                             { label: 'PNG', val: ImageFormat.PNG },
                             { label: 'WEBP', val: ImageFormat.WEBP }
                           ].map((f) => (
                             <button
                               key={f.label}
                               onClick={() => setFormat(f.val)}
                               className={`py-2 text-sm font-medium rounded-lg border transition-all ${
                                 format === f.val 
                                   ? 'border-chrome-blue bg-blue-50 text-chrome-blue ring-1 ring-chrome-blue' 
                                   : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                               }`}
                             >
                               {f.label}
                             </button>
                           ))}
                        </div>
                      </div>
                      
                      <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                Max File Size <span className="text-xs font-normal text-chrome-blue bg-blue-50 px-1 rounded">PRO</span>
                            </label>
                            <span className="text-xs text-gray-500">Optional</span>
                          </div>
                          <div className="flex gap-2">
                            <input 
                                type="number" 
                                placeholder="e.g. 200"
                                value={targetSizeValue}
                                onChange={(e) => setTargetSizeValue(e.target.value)}
                                className="flex-grow border border-gray-300 rounded-lg p-2 focus:ring-chrome-blue focus:border-chrome-blue text-sm"
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

                      {(!targetSizeValue && format !== ImageFormat.PNG) && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-semibold text-gray-700">Quality (0-100)</label>
                             <div className="relative">
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={Math.round(quality * 100)}
                                  onChange={(e) => {
                                    let val = parseInt(e.target.value);
                                    if (isNaN(val)) val = 90;
                                    if (val > 100) val = 100;
                                    if (val < 1) val = 1;
                                    setQuality(val / 100);
                                  }}
                                  className="w-16 py-1 px-2 text-right text-sm border border-gray-300 rounded focus:ring-chrome-blue focus:border-chrome-blue"
                                />
                                <span className="absolute right-6 top-1 text-gray-400 text-xs pointer-events-none">%</span>
                             </div>
                          </div>
                          <input 
                            type="range" 
                            min="0.01" 
                            max="1.0" 
                            step="0.01" 
                            value={quality}
                            onChange={(e) => setQuality(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-chrome-blue"
                          />
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="w-full bg-chrome-blue hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
                      Resize Image
                    </button>
                  </>
                )}
             </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex-grow bg-gray-100 rounded-2xl border border-gray-200 relative overflow-hidden flex items-center justify-center min-h-[300px] lg:min-h-[500px]">
              {processedImage ? (
                <div className="relative p-4 w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 z-0 opacity-10" style={{ 
                        backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', 
                        backgroundSize: '20px 20px' 
                    }}></div>
                    
                    <img 
                      src={processedImage} 
                      alt="Preview" 
                      className="relative z-10 shadow-2xl rounded-sm max-w-full max-h-full object-contain"
                    />
                </div>
              ) : (
                <div className="text-gray-400 flex flex-col items-center p-4 text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                     <ImageIcon size={40} className="text-gray-400"/>
                  </div>
                  <span className="text-lg font-medium">Upload an image to start editing</span>
                </div>
              )}
              
              {isProcessing && (
                <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                  <RefreshCcw className="animate-spin text-chrome-blue mb-2" size={48} />
                  <span className="font-medium text-gray-600">Processing...</span>
                </div>
              )}
            </div>

            {processedImage && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm w-full sm:w-auto text-center sm:text-left">
                    <p className="text-xs text-gray-500 uppercase font-bold">New Size</p>
                    <p className="text-lg font-bold text-gray-900">{formatFileSize(outSize)}</p>
                  </div>
                  <div className="hidden sm:block h-10 w-px bg-gray-300"></div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-600">Dimensions: <strong>{width} x {height} px</strong></p>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-xl font-bold shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Download size={20} />
                  Download Image
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AdBanner />
      <article className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 prose prose-lg max-w-none text-gray-600">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">The Ultimate Guide to Resizing Images Online</h2>
        <p>Whether you are managing a WordPress blog, an e-commerce store on Shopify, or just posting to Instagram, having the correct image dimensions is critical. FileMakerOn's <strong>Advanced Image Resizer</strong> allows you to change the resolution of your photos with pixel-perfect accuracy.</p>
        
        <Banner728x90 />

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why is Image Resizing Important for SEO?</h3>
        <p>Google's Core Web Vitals heavily penalize slow-loading websites. One of the biggest culprits of slow speeds is serving images that are larger than necessary.</p>
        
        <Banner728x90 />

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Batch Operations and Format Control</h3>
        <p>Our tool supports multiple format exports including high-compression WebP and standard JPEG, allowing you to optimize your delivery assets effectively.</p>
        
        <Banner728x90 />

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Client-Side Performance</h3>
        <p>Because we process images in your browser using modern JavaScript, your files are never uploaded to our servers, ensuring 100% data privacy.</p>

        <Banner728x90 />
      </article>
      <RelatedTools />
    </div>
  );
};

export default ImageResizer;