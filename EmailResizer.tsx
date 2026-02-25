
import React, { useState, useRef } from 'react';
import { Upload, Download, Mail } from 'lucide-react';
import { ImageFormat } from '../types';
import { readFileAsDataURL, processImage, loadImage, formatFileSize } from '../services/imageUtils';
import { RelatedTools } from '../components/RelatedTools';
import { AdBanner } from '../components/Layout';

interface Preset {
  name: string;
  width: number;
  height: number;
}

const presets: Preset[] = [
  { name: 'Email Signature (Small)', width: 300, height: 100 },
  { name: 'Email Signature (Medium)', width: 400, height: 120 },
  { name: 'Newsletter Header', width: 600, height: 200 },
  { name: 'Gmail Profile Picture', width: 180, height: 180 },
  { name: 'Facebook Post', width: 1200, height: 630 },
  { name: 'Instagram Post', width: 1080, height: 1080 },
];

const EmailResizer: React.FC = () => {
  const [srcImage, setSrcImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number>(2); // Default Newsletter
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const dataUrl = await readFileAsDataURL(file);
      setSrcImage(dataUrl);
      processWithPreset(dataUrl, presets[selectedPreset]);
    }
  };

  const processWithPreset = async (src: string, preset: Preset) => {
    const result = await processImage(src, ImageFormat.JPEG, { width: preset.width, height: preset.height });
    setProcessedImage(result);
  };

  const handlePresetChange = (idx: number) => {
    setSelectedPreset(idx);
    if (srcImage) {
      processWithPreset(srcImage, presets[idx]);
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `email-ready-${presets[selectedPreset].name.replace(/\s+/g, '-')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Email & Social Resizer</h1>
          <p className="text-gray-500">Presets for professional email signatures and social media posts.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="space-y-6">
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="w-full py-4 border-2 border-dashed border-teal-300 bg-teal-50 rounded-xl flex flex-col items-center justify-center text-teal-700 font-medium hover:bg-teal-100 transition-colors"
             >
               <Mail className="mb-2" />
               Upload Image
               <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
             </button>

             <div className="space-y-2">
               <label className="block text-sm font-medium text-gray-700">Select Template</label>
               <div className="space-y-2">
                 {presets.map((p, idx) => (
                   <button
                     key={idx}
                     onClick={() => handlePresetChange(idx)}
                     className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                       selectedPreset === idx 
                         ? 'border-teal-500 bg-teal-50 text-teal-900 font-medium ring-1 ring-teal-500' 
                         : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                     }`}
                   >
                     <div className="flex justify-between">
                       <span>{p.name}</span>
                       <span className="text-xs text-gray-400">{p.width}x{p.height}</span>
                     </div>
                   </button>
                 ))}
               </div>
             </div>
           </div>

           <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-100 rounded-xl h-[500px] flex items-center justify-center p-4 overflow-hidden relative">
                {processedImage ? (
                  <img src={processedImage} alt="Preview" className="shadow-xl max-w-full max-h-full object-contain" />
                ) : (
                   <span className="text-gray-400">Select a template to see preview</span>
                )}
              </div>
              <button 
                onClick={handleDownload}
                disabled={!processedImage}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                Download Optimized Image
              </button>
           </div>
        </div>
      </div>
      
      {/* Mid-Content Ad */}
      <AdBanner />

      {/* SEO Article & FAQ */}
      <article className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 prose prose-lg max-w-none text-gray-600">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Optimize Images for Professional Email Signatures</h2>
        
        <p>
          Your email signature is often the first and last thing a professional contact sees. A blurry, stretched, or overly large logo can damage your credibility. 
          FileMakerOn's <strong>Email Resizer</strong> helps you format your headshots and company logos perfectly for Gmail, Outlook, Apple Mail, and social platforms.
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Do Images Look Blurry in Emails?</h3>
        <p>
          This usually happens due to scaling. If you upload a massive 3000px wide logo and force the email client to display it at 300px, it might look jagged. 
          Conversely, if you upload a tiny image and it gets stretched on a "Retina" (High DPI) screen, it looks pixelated. 
          The best practice is to resize your image to exactly the width you want it to display (or 2x that width for Retina screens).
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Standard Dimensions for 2024</h3>
        <ul className="list-disc pl-6 space-y-2">
           <li><strong>Email Signatures:</strong> Keep width under 600px to ensure it fits on mobile screens. A height of 100-150px is ideal for banners.</li>
           <li><strong>Profile Pictures:</strong> Most platforms use circular avatars. A 180x180 or 400x400 square image works best as the corners will be cropped.</li>
           <li><strong>Newsletter Headers:</strong> 600px width is the industry standard for HTML email templates.</li>
        </ul>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Frequently Asked Questions (FAQ)</h3>
        
        <div className="space-y-4">
          <div>
             <h5 className="font-bold text-gray-900">What format is best for email signatures?</h5>
             <p><strong>JPEG</strong> is safest for compatibility and small file size. <strong>PNG</strong> is good if you need a transparent background, but some older versions of Outlook do not render transparency correctly (turning the background black). We generally recommend JPG on a white background.</p>
          </div>
          <div>
             <h5 className="font-bold text-gray-900">How do I add the image to my signature?</h5>
             <p>After downloading your optimized image, go to your email settings (e.g., Gmail Settings {'>'} General {'>'} Signature), click the "Insert Image" icon, and upload the file.</p>
          </div>
        </div>
      </article>

      <RelatedTools />
    </div>
  );
};

export default EmailResizer;
