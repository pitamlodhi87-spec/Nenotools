import React, { useState, useRef } from 'react';
import { Upload, Minimize2, FileDown, CheckCircle, Download, RefreshCw, Trash2, Loader2, Package, FileText, Check, AlertCircle } from 'lucide-react';
import { compressPdf } from '../services/pdfUtils';
import { formatFileSize } from '../services/imageUtils';
import { AdBanner, Banner728x90 } from '../components/Layout';
import { RelatedTools } from '../components/RelatedTools';

// Declare JSZip from global scope (loaded via index.html)
declare const JSZip: any;

interface BatchFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  resultBlob?: Blob;
  resultSize?: number;
  error?: string;
}

const PdfCompress: React.FC = () => {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [quality, setQuality] = useState(0.7);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: BatchFile[] = Array.from(e.target.files).map((f: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        status: 'pending'
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleBatchCompress = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const updatedFiles = [...files];
    
    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status === 'completed') continue;
      
      updatedFiles[i].status = 'processing';
      setFiles([...updatedFiles]);

      try {
        const compressedBytes = await compressPdf(updatedFiles[i].file, quality);
        const blob = new Blob([compressedBytes], { type: 'application/pdf' });
        
        updatedFiles[i].status = 'completed';
        updatedFiles[i].resultBlob = blob;
        updatedFiles[i].resultSize = blob.size;
      } catch (err) {
        console.error(err);
        updatedFiles[i].status = 'error';
        updatedFiles[i].error = 'Compression failed';
      }
      setFiles([...updatedFiles]);
    }
    setIsProcessing(false);
  };

  const downloadSingle = (batchFile: BatchFile) => {
    if (!batchFile.resultBlob) return;
    const url = URL.createObjectURL(batchFile.resultBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed-${batchFile.file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAllAsZip = async () => {
    const completed = files.filter(f => f.status === 'completed' && f.resultBlob);
    if (completed.length === 0 || !JSZip) return;
    
    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const f of completed) {
        zip.file(`compressed-${f.file.name}`, f.resultBlob!);
      }
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compressed-pdfs-batch.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("ZIP generation failed");
    } finally {
      setIsZipping(false);
    }
  };

  const resetTool = () => {
    setFiles([]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const allCompleted = files.length > 0 && files.every(f => f.status === 'completed' || f.status === 'error');
  const hasCompleted = files.some(f => f.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
        <div className="text-center mb-10">
           <h1 className="text-4xl font-black text-gray-900 mb-2">Batch PDF Compressor</h1>
           <p className="text-gray-500 font-medium">Compress multiple PDF files simultaneously with one click.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Side */}
          <div className="lg:col-span-4 space-y-6">
            <div 
              onClick={() => inputRef.current?.click()}
              className="border-4 border-dashed border-green-100 bg-green-50/30 rounded-[2rem] p-10 cursor-pointer hover:bg-green-50 hover:border-green-200 transition-all text-center group"
            >
              <input ref={inputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={handleFileChange} />
              <Upload className="mx-auto text-green-500 mb-4 group-hover:scale-110 transition-transform" size={48} />
              <span className="font-black text-gray-800 block text-lg">Add PDF Files</span>
              <span className="text-xs text-green-600 font-bold uppercase tracking-widest mt-2 block">Batch Mode Active</span>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
               <label className="flex justify-between font-black text-gray-700 text-sm uppercase tracking-wider mb-2">
                  <span>Quality</span>
                  <span className="text-green-600">{Math.round(quality * 100)}%</span>
               </label>
               <input 
                 type="range" 
                 min="0.1" 
                 max="1.0" 
                 step="0.1" 
                 disabled={isProcessing}
                 value={quality} 
                 onChange={(e) => setQuality(parseFloat(e.target.value))}
                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
               />
               <div className="flex justify-between text-[10px] text-gray-400 font-black uppercase">
                  <span>Small File</span>
                  <span>High Quality</span>
               </div>
            </div>

            <button
              onClick={handleBatchCompress}
              disabled={isProcessing || files.length === 0 || allCompleted}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-30"
            >
               {isProcessing ? <Loader2 className="animate-spin" /> : <Minimize2 />}
               {isProcessing ? "Processing Batch..." : "Compress All"}
            </button>

            {hasCompleted && (
              <button 
                onClick={downloadAllAsZip}
                disabled={isZipping}
                className="w-full bg-green-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
              >
                {isZipping ? <Loader2 className="animate-spin" /> : <Package size={20} />}
                Download All (ZIP)
              </button>
            )}
            
            {files.length > 0 && (
              <button onClick={resetTool} className="w-full py-3 text-slate-400 font-bold text-sm hover:text-red-500 transition-colors">
                Clear All Files
              </button>
            )}
          </div>

          {/* List Side */}
          <div className="lg:col-span-8">
            <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 p-4 min-h-[400px]">
              {files.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-20">
                  <FileText size={64} className="mb-4 opacity-20" />
                  <p className="font-bold">No files selected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-4 mb-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Queue ({files.length} files)</h3>
                  </div>
                  {files.map((f) => (
                    <div key={f.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group">
                      <div className={`p-3 rounded-xl ${f.status === 'completed' ? 'bg-green-50 text-green-600' : f.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                         {f.status === 'completed' ? <Check size={20} /> : f.status === 'processing' ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-slate-800 text-sm truncate pr-4">{f.file.name}</p>
                          {f.status === 'completed' && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase">
                              Saved {Math.round(((f.file.size - (f.resultSize || 0)) / f.file.size) * 100)}%
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                          {formatFileSize(f.file.size)} 
                          {f.resultSize && ` → ${formatFileSize(f.resultSize)}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {f.status === 'completed' && (
                          <button 
                            onClick={() => downloadSingle(f)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download individually"
                          >
                            <Download size={18} />
                          </button>
                        )}
                        {f.status === 'error' && (
                          <div className="text-red-500" title={f.error}><AlertCircle size={18} /></div>
                        )}
                        {!isProcessing && (
                          <button 
                            onClick={() => removeFile(f.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <AdBanner />

      <article className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-sm border border-gray-100 prose prose-slate max-w-none text-gray-600">
        <h2 className="text-3xl font-black text-gray-900 mb-6">Efficient Batch PDF Compression for Professionals</h2>
        <p className="lead text-lg">
           Why waste time compressing PDF files one by one? FileMakerOn's <strong>Batch PDF Compressor</strong> allows you to upload an entire folder of documents and optimize them all in a single pass. Perfect for accountants, lawyers, and office administrators handling large volumes of paperwork.
        </p>

        <Banner728x90 />

        <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Why Choose Batch Processing?</h3>
        <ul className="list-disc pl-6 space-y-2">
           <li><strong>Significant Time Savings:</strong> Process 10, 20, or even 50 files with a single click.</li>
           <li><strong>Uniform Optimization:</strong> Ensure all your documents meet the same quality standards and file size targets.</li>
           <li><strong>ZIP Archiving:</strong> Download your entire compressed batch in one neat ZIP file, keeping your downloads folder organized.</li>
        </ul>

        <Banner728x90 />

        <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Security and Privacy</h3>
        <p>Just like our single-file tools, batch processing happens entirely in your browser. No data ever touches our servers.</p>

        <Banner728x90 />

        <h3 className="text-2xl font-bold text-gray-900 mt-10 mb-4">How it Works</h3>
        <p>
           Our tool utilizes advanced JavaScript worker threads to handle the heavy lifting of PDF rasterization and re-encoding. By distributing the workload, we can compress multiple files while keeping the user interface responsive.
        </p>

        <Banner728x90 />

        <div className="bg-green-50 border-l-4 border-green-500 p-6 mt-8 rounded-r-2xl">
           <h4 className="font-black text-green-900 mb-2">Pro Tip: ZIP Downloads</h4>
           <p className="text-sm text-green-800">
              When processing more than 3 files, we highly recommend using the <strong>Download All (ZIP)</strong> feature. It creates a single compressed archive of all your optimized PDFs.
           </p>
        </div>
      </article>

      <RelatedTools />
    </div>
  );
};

export default PdfCompress;