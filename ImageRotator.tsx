
import React, { useState, useRef } from 'react';
import { Upload, Download, RotateCw, RotateCcw, ArrowLeftRight, ArrowUpDown, Image as ImageIcon } from 'lucide-react';
import { readFileAsDataURL, rotateImage } from '../services/imageUtils';
import { RelatedTools } from '../components/RelatedTools';
import { AdBanner } from '../components/Layout';

const ImageRotator: React.FC = () => {
  const [srcImage, setSrcImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const dataUrl = await readFileAsDataURL(file);
      setSrcImage(dataUrl);
      setProcessedImage(dataUrl); // Initial state
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    }
  };

  const applyTransform = async () => {
    if (!srcImage) return;
    const result = await rotateImage(srcImage, rotation, flipH, flipV);
    setProcessedImage(result);
  };

  // Apply transforms whenever state changes
  React.useEffect(() => {
    applyTransform();
  }, [rotation, flipH, flipV]);

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `rotated-image.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rotate & Flip Image</h1>
          <p className="text-gray-500">Fix orientation or create mirror effects instantly.</p>
        </div>

        {!srcImage ? (
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
           >
             <Upload className="text-indigo-500 mb-4" size={48} />
             <span className="text-xl font-medium text-gray-700">Upload Image to Rotate</span>
             <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
           </div>
        ) : (
          <div className="space-y-8">
             <div className="flex flex-wrap justify-center gap-4">
               <button onClick={() => setRotation((r) => r - 90)} className="p-3 bg-gray-100 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Rotate Left">
                 <RotateCcw />
               </button>
               <button onClick={() => setRotation((r) => r + 90)} className="p-3 bg-gray-100 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="Rotate Right">
                 <RotateCw />
               </button>
               <button onClick={() => setFlipH(!flipH)} className={`p-3 rounded-lg transition-colors ${flipH ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 hover:bg-indigo-50'}`} title="Flip Horizontal">
                 <ArrowLeftRight />
               </button>
               <button onClick={() => setFlipV(!flipV)} className={`p-3 rounded-lg transition-colors ${flipV ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 hover:bg-indigo-50'}`} title="Flip Vertical">
                 <ArrowUpDown />
               </button>
             </div>

             <div className="bg-gray-100 rounded-xl p-4 min-h-[300px] flex items-center justify-center overflow-hidden">
                {processedImage && <img src={processedImage} alt="Transformed" className="max-w-full max-h-[500px] shadow-md" />}
             </div>

             <div className="flex justify-center gap-4">
               <button 
                 onClick={() => { setSrcImage(null); setProcessedImage(null); }}
                 className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
               >
                 Start Over
               </button>
               <button 
                 onClick={handleDownload}
                 className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
               >
                 <Download size={20} /> Download Image
               </button>
             </div>
          </div>
        )}
      </div>
      
      {/* Mid-Content Ad */}
      <AdBanner />

      {/* SEO Article & FAQ */}
      <article className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 prose prose-lg max-w-none text-gray-600">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Quickly Rotate and Flip Images Online</h2>
        
        <p>
          We've all been there: you upload a photo from your phone to your computer, and it's sideways. Or maybe you took a selfie that's mirrored, and you need to flip it back. 
          FileMakerOn's <strong>Image Rotator</strong> is the simplest way to correct orientation issues without opening Photoshop.
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Understanding Image Orientation</h3>
        <p>
          Digital cameras and smartphones embed "EXIF" data into photos to tell software which way is "up". However, some websites or older software ignore this data, displaying your photo sideways. 
          Using our tool physically rotates the pixels and saves a new file, ensuring the image looks correct on <em>every</em> device and platform permanently.
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Mirroring Images (Flipping)</h3>
        <p>
          Flipping an image horizontally creates a mirror effect. This is often used for:
        </p>
        <ul className="list-disc pl-6 space-y-2">
           <li><strong>Selfie Correction:</strong> Many front-facing cameras mirror the preview but save the "real" view. Flipping it can make it look like what you saw on screen.</li>
           <li><strong>Design Balance:</strong> Graphic designers flip images to guide the viewer's eye towards text or a call to action.</li>
        </ul>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Frequently Asked Questions (FAQ)</h3>
        
        <div className="space-y-4">
          <div>
             <h5 className="font-bold text-gray-900">Does rotating an image reduce quality?</h5>
             <p>Generally, rotating by 90-degree increments (90, 180, 270) is a "lossless" operation in many advanced editors. Our tool re-encodes the image to ensure compatibility, but uses high-quality settings so any difference is invisible to the naked eye.</p>
          </div>
          <div>
             <h5 className="font-bold text-gray-900">What formats are supported?</h5>
             <p>You can rotate JPG, PNG, WebP, and GIF images. The output will be a high-quality PNG to preserve transparency if present.</p>
          </div>
        </div>
      </article>

      <RelatedTools />
    </div>
  );
};

export default ImageRotator;
