import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCcw, Image as ImageIcon, Settings, Info } from 'lucide-react';
import { ImageFormat } from '../types';
import { readFileAsDataURL, processImage, formatFileSize, getBase64Size, compressToTargetSize } from '../services/imageUtils';
import { RelatedTools } from '../components/RelatedTools';
import { AdBanner, Banner728x90 } from '../components/Layout';

interface ConverterProps {
  targetFormat: ImageFormat;
  title: string;
  description: string;
}

const ImageConverter: React.FC<ConverterProps> = ({ targetFormat, title, description }) => {
  const [srcImage, setSrcImage] = useState<string | null>(null);
  const [srcSize, setSrcSize] = useState<number>(0);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [outSize, setOutSize] = useState<number>(0);
  const [fileName, setFileName] = useState<string>('converted-image');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // File size control state
  const [targetSizeValue, setTargetSizeValue] = useState<string>('');
  const [targetSizeUnit, setTargetSizeUnit] = useState<'KB' | 'MB'>('KB');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatName = targetFormat.split('/')[1].toUpperCase().replace('SVG+XML', 'SVG');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const name = file.name.split('.')[0];
      setFileName(name);
      setSrcSize(file.size);
      setIsProcessing(true);
      try {
        const dataUrl = await readFileAsDataURL(file);
        setSrcImage(dataUrl);
        // We'll let the effect handle the conversion
      } catch (err) {
        console.error(err);
        alert('Error processing image');
        setIsProcessing(false);
      }
    }
  };

  // Re-process image when source or target settings change
  useEffect(() => {
    if (!srcImage) return;

    const performConversion = async () => {
      setIsProcessing(true);
      try {
        let result;
        if (targetSizeValue) {
          let targetBytes = parseFloat(targetSizeValue);
          if (!isNaN(targetBytes) && targetBytes > 0) {
            if (targetSizeUnit === 'KB') targetBytes *= 1024;
            if (targetSizeUnit === 'MB') targetBytes *= 1024 * 1024;
            result = await compressToTargetSize(srcImage, targetFormat, targetBytes);
          } else {
            result = await processImage(srcImage, targetFormat);
          }
        } else {
          result = await processImage(srcImage, targetFormat);
        }
        setProcessedImage(result);
        setOutSize(getBase64Size(result));
      } catch (e) {
        console.error(e);
      } finally {
        setIsProcessing(false);
      }
    };

    const timer = setTimeout(performConversion, 400);
    return () => clearTimeout(timer);
  }, [srcImage, targetFormat, targetSizeValue, targetSizeUnit]);

  const getExtension = (fmt: ImageFormat) => {
    switch (fmt) {
      case ImageFormat.PNG: return 'png';
      case ImageFormat.JPEG: return 'jpg';
      case ImageFormat.WEBP: return 'webp';
      case ImageFormat.GIF: return 'gif';
      case ImageFormat.BMP: return 'bmp';
      case ImageFormat.SVG: return 'svg';
      default: return 'img';
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      const ext = getExtension(targetFormat);
      link.download = `${fileName}-FileMakerOn.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-500">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">Upload Image</label>
               <div 
                 className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-chrome-blue transition-colors h-64"
                 onClick={() => fileInputRef.current?.click()}
               >
                 <input 
                   ref={fileInputRef}
                   type="file" 
                   accept="image/*" 
                   className="hidden" 
                   onChange={handleFileChange}
                 />
                 <div className="bg-blue-50 p-4 rounded-full mb-4">
                   <Upload className="text-chrome-blue" size={32} />
                 </div>
                 <p className="text-gray-900 font-medium">Click to upload</p>
                 <p className="text-gray-500 text-sm mt-1">PNG, JPG, WEBP, GIF, BMP</p>
               </div>
            </div>

            {srcImage && (
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                 <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                       <Settings size={14} /> Target File Size <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">PRO</span>
                    </label>
                    <span className="text-xs text-gray-400">Optional</span>
                 </div>
                 <div className="flex gap-2">
                    <input 
                       type="number" 
                       placeholder="e.g. 50"
                       value={targetSizeValue}
                       onChange={(e) => setTargetSizeValue(e.target.value)}
                       className="flex-grow border-gray-300 rounded-lg p-2.5 focus:ring-chrome-blue focus:border-chrome-blue text-sm"
                    />
                    <select
                       value={targetSizeUnit}
                       onChange={(e) => setTargetSizeUnit(e.target.value as any)}
                       className="w-20 border-gray-300 rounded-lg p-2.5 bg-white text-sm"
                    >
                       <option value="KB">KB</option>
                       <option value="MB">MB</option>
                    </select>
                 </div>
                 <div className="text-[10px] text-gray-400 flex gap-1">
                    <Info size={12} className="flex-shrink-0" />
                    <span>Quality will be adjusted automatically to fit under the target size.</span>
                 </div>
              </div>
            )}
            
            {srcImage && (
              <p className="text-center text-sm text-gray-500">Original Size: <span className="font-semibold text-gray-900">{formatFileSize(srcSize)}</span></p>
            )}
          </div>

          {/* Preview & Action Section */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Converted Preview</label>
            <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center overflow-hidden relative border border-gray-200">
              {processedImage ? (
                <img 
                  src={processedImage} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain" 
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <ImageIcon size={48} className="mb-2 opacity-50"/>
                  <span>No image loaded</span>
                </div>
              )}
              
              {isProcessing && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-sm">
                  <RefreshCcw className="animate-spin text-white" size={32} />
                </div>
              )}
            </div>

             {processedImage && (
              <p className="text-center text-sm text-gray-500">Output Size: <span className="font-semibold text-green-600">{formatFileSize(outSize)}</span></p>
            )}

            <button
              onClick={handleDownload}
              disabled={!processedImage || isProcessing}
              className="w-full flex items-center justify-center gap-2 bg-chrome-blue hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-bold shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={20} />
              Download {getExtension(targetFormat).toUpperCase()}
            </button>
          </div>
        </div>
      </div>
      
      <AdBanner />

      {/* SEO Content Section */}
      <article className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 prose prose-lg max-w-none text-gray-600">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Convert Images with Precision File Size Control</h2>
        
        <p>
          Need to convert your photos to {formatName} format with a specific byte limit? FileMakerOn provides the fastest and most secure way to change image formats directly in your web browser, now with <strong>Smart File Size Targetting</strong>.
        </p>

        <Banner728x90 />

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Use File Size Control?</h3>
        <p>
          Many online platforms, especially government portals, job applications, and specialized website builders, have strict "Maximum File Size" limits (often 50KB or 100KB). Manually trying to hit these targets by guessing quality sliders is frustrating. Our tool automates this process:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Automatic Quality Adjustment:</strong> We analyze the image and decrease compression quality iteratively until the file size is exactly under your requirement.</li>
          <li><strong>Scale Optimization:</strong> If simple compression isn't enough, we optionally resize the image dimensions slightly to guarantee it fits your limit.</li>
          <li><strong>Browser-Based:</strong> Your sensitive documents stay on your computer. We process everything locally using JavaScript.</li>
        </ul>

        <Banner728x90 />

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How to Convert to {formatName}</h3>
        <ol className="list-decimal pl-6 space-y-2">
           <li>Click the <strong>Upload Image</strong> box or drag and drop your file.</li>
           <li>Set a <strong>Target File Size</strong> if you have a limit you need to meet.</li>
           <li>Wait a moment for the conversion to complete automatically.</li>
           <li>Preview your new {formatName} image and click <strong>Download</strong>.</li>
        </ol>

        <Banner728x90 />

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">SEO Benefits of Image Format Optimization</h3>
        <p>Using modern formats like WebP can drastically improve your site's load speed and Core Web Vitals score, which is a significant ranking factor for Google.</p>

        <Banner728x90 />
      </article>

      <RelatedTools />
    </div>
  );
};

export default ImageConverter;