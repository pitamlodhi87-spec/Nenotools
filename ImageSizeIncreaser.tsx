
import React, { useState, useRef } from 'react';
import { Upload, Download, Maximize, FilePlus, Info, Check } from 'lucide-react';
import { increaseFileSize, formatFileSize } from '../services/imageUtils';
import { RelatedTools } from '../components/RelatedTools';
import { AdBanner } from '../components/Layout';

const ImageSizeIncreaser: React.FC = () => {
  const [srcFile, setSrcFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  
  const [targetSizeValue, setTargetSizeValue] = useState<string>('');
  const [targetSizeUnit, setTargetSizeUnit] = useState<'KB' | 'MB'>('KB');
  const [finalSize, setFinalSize] = useState<number>(0);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSrcFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setProcessedUrl(null); // Reset previous result
    }
  };

  const handleProcess = async () => {
    if (!srcFile || !targetSizeValue) return;
    
    setIsProcessing(true);
    try {
       let targetBytes = parseFloat(targetSizeValue);
       if (isNaN(targetBytes) || targetBytes <= 0) {
           alert("Please enter a valid target size");
           setIsProcessing(false);
           return;
       }

       if (targetSizeUnit === 'KB') targetBytes *= 1024;
       if (targetSizeUnit === 'MB') targetBytes *= 1024 * 1024;

       if (targetBytes <= srcFile.size) {
           alert(`Target size must be larger than original file size (${formatFileSize(srcFile.size)})`);
           setIsProcessing(false);
           return;
       }

       const resultUrl = await increaseFileSize(srcFile, targetBytes);
       setProcessedUrl(resultUrl);
       setFinalSize(targetBytes); // It will be exactly or slightly more than targetBytes
    } catch (err) {
       console.error(err);
       alert("Failed to process image");
    } finally {
       setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedUrl && srcFile) {
      const link = document.createElement('a');
      link.href = processedUrl;
      // Append -increased to filename
      const nameParts = srcFile.name.split('.');
      const ext = nameParts.pop();
      const name = nameParts.join('.');
      link.download = `${name}-increased.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Increase Image Size (KB/MB)</h1>
          <p className="text-gray-500">Increase the file size of an image to meet minimum upload requirements (e.g., for government portals).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Controls */}
           <div className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-300 bg-purple-50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100 transition-colors h-48"
              >
                 <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                 {srcFile ? (
                    <div className="text-center">
                       <FilePlus size={40} className="text-purple-600 mb-2 mx-auto" />
                       <p className="font-bold text-gray-800 truncate max-w-[200px]">{srcFile.name}</p>
                       <p className="text-sm text-gray-500">{formatFileSize(srcFile.size)}</p>
                    </div>
                 ) : (
                    <>
                       <Upload size={32} className="text-purple-500 mb-2" />
                       <span className="font-bold text-gray-700">Upload Image</span>
                       <span className="text-xs text-purple-600 mt-1">JPG, PNG, PDF, WEBP</span>
                    </>
                 )}
              </div>

              {srcFile && (
                 <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
                    <label className="block text-sm font-bold text-gray-700">Desired File Size (Minimum)</label>
                    <div className="flex gap-2">
                       <input 
                          type="number" 
                          placeholder="e.g. 500"
                          value={targetSizeValue}
                          onChange={(e) => setTargetSizeValue(e.target.value)}
                          className="flex-grow border-gray-300 rounded-lg p-3 focus:ring-purple-500 focus:border-purple-500"
                       />
                       <select
                          value={targetSizeUnit}
                          onChange={(e) => setTargetSizeUnit(e.target.value as any)}
                          className="w-24 border-gray-300 rounded-lg p-3 bg-gray-50"
                       >
                          <option value="KB">KB</option>
                          <option value="MB">MB</option>
                       </select>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 flex gap-2">
                       <Info size={16} className="flex-shrink-0" />
                       <p>We will add invisible data to the file to reach this size without changing image quality.</p>
                    </div>

                    <button 
                      onClick={handleProcess}
                      disabled={isProcessing || !targetSizeValue}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       {isProcessing ? <Maximize className="animate-spin" /> : <Maximize />}
                       Increase Size
                    </button>
                 </div>
              )}
           </div>

           {/* Preview */}
           <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[300px]">
              {previewUrl ? (
                 <div className="w-full h-full flex flex-col items-center">
                    <img src={previewUrl} alt="Preview" className="max-w-full max-h-[250px] object-contain shadow-md rounded-lg mb-6" />
                    
                    {processedUrl && (
                       <div className="w-full animate-fade-in space-y-4">
                          <div className="bg-green-100 text-green-800 p-3 rounded-lg text-center font-bold flex items-center justify-center gap-2">
                             <Check size={18} />
                             New Size: {formatFileSize(finalSize)}
                          </div>
                          <button 
                             onClick={handleDownload}
                             className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                          >
                             <Download size={20} /> Download Image
                          </button>
                       </div>
                    )}
                 </div>
              ) : (
                 <div className="text-gray-400 text-center">
                    <Maximize size={48} className="mx-auto mb-3 opacity-30" />
                    <p>Upload an image to start</p>
                 </div>
              )}
           </div>
        </div>
      </div>
      
      <AdBanner />

      <article className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 prose prose-lg max-w-none text-gray-600">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Increase Image File Size in KB or MB</h2>
        <p>
           While most people want to compress images to save space, there are specific situations where you need to <strong>increase</strong> the file size of a JPG or PNG. 
           FileMakerOn's Size Increaser tool makes this easy, safe, and free.
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Would I Need to Increase File Size?</h3>
        <ul className="list-disc pl-6 space-y-2">
           <li><strong>Government Portals:</strong> Many official application forms (passports, visas, exams) have a minimum file size requirement (e.g., "Image must be between 50KB and 100KB"). If your optimized photo is 40KB, the system will reject it.</li>
           <li><strong>Print Requirements:</strong> Some print-on-demand services reject files that are "too small" purely based on byte count, even if the resolution is fine.</li>
           <li><strong>Social Media Algorithms:</strong> In rare cases, overly compressed images may be flagged as low quality.</li>
        </ul>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How Does It Work?</h3>
        <p>
           Our tool uses a technique called <strong>Zero-Padding</strong> or <strong>Metadata Injection</strong>. 
           We take your original image file and append invisible data (empty bytes) to the end of the file structure.
        </p>
        <p>
           <strong>Key Benefits:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2">
           <li><strong>No Quality Loss:</strong> We do not re-encode or stretch your image pixels. The visual quality remains exactly the same.</li>
           <li><strong>Exact Sizing:</strong> You specify the target (e.g., 200KB), and we make the file exactly that size (or slightly larger to be safe).</li>
           <li><strong>Format Support:</strong> Works with JPEG, PNG, and even PDF files.</li>
        </ul>
      </article>

      <RelatedTools />
    </div>
  );
};

export default ImageSizeIncreaser;
