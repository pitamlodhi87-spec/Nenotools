import React, { useState, useRef } from 'react';
import { Upload, FilePlus, Merge, Trash2, ArrowDown, CheckCircle, Download, RefreshCw, Loader2, FileText, Shield, Zap } from 'lucide-react';
import { mergePdfs } from '../services/pdfUtils';
import { formatFileSize as formatBytes } from '../services/imageUtils';
import { AdBanner, Banner728x90 } from '../components/Layout';
import { RelatedTools } from '../components/RelatedTools';

const PdfMerge: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
      setDownloadUrl(null);
    }
  };

  const removeFile = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
    setDownloadUrl(null);
  };

  const moveFile = (from: number, to: number) => {
    const newFiles = [...files];
    const [moved] = newFiles.splice(from, 1);
    newFiles.splice(to, 0, moved);
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    
    // Give UI time to update
    await new Promise(r => setTimeout(r, 100));

    try {
      const mergedBytes = await mergePdfs(files);
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert('Merge failed. Ensure files are not encrypted.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10">
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Merge PDF Documents</h1>
        <p className="text-slate-500 mb-10 font-medium">Combine multiple PDF files into one clean, professional document instantly.</p>
        
        {downloadUrl ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-10 animate-fade-in">
             <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-2">Documents Merged!</h2>
             <p className="text-slate-600 mb-8">Successfully combined {files.length} files into a single PDF.</p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={downloadUrl} download="merged-documents-filemakeron.pdf" className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                   <Download size={20} /> Download Result
                </a>
                <button onClick={() => { setFiles([]); setDownloadUrl(null); }} className="bg-white border-2 border-slate-200 px-10 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all text-slate-600">Start New Merge</button>
             </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div 
              onClick={() => inputRef.current?.click()}
              className="border-4 border-dashed border-slate-100 bg-slate-50/50 rounded-[2.5rem] p-16 cursor-pointer hover:bg-slate-100 hover:border-indigo-200 transition-all group"
            >
              <input ref={inputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={handleFileChange} />
              <FilePlus className="mx-auto text-indigo-500 mb-4 group-hover:scale-110 transition-transform" size={60} />
              <span className="font-black text-slate-800 block text-2xl">Upload PDF Files</span>
              <span className="text-slate-400 font-medium">Select multiple files to combine in order</span>
            </div>

            {files.length > 0 && (
              <div className="text-left space-y-4">
                <div className="flex justify-between items-center px-4">
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Merge Queue ({files.length})</h3>
                  <button onClick={() => setFiles([])} className="text-xs font-bold text-red-500 hover:underline">Clear Queue</button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{formatBytes(file.size)}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {idx < files.length - 1 && (
                              <button onClick={() => moveFile(idx, idx + 1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400" title="Move Down"><ArrowDown size={16} /></button>
                            )}
                            <button onClick={() => removeFile(idx)} className="p-2 hover:bg-red-50 text-red-400 rounded-lg transition-colors" title="Remove"><Trash2 size={18} /></button>
                          </div>
                      </div>
                    ))}
                </div>
                
                {isProcessing && (
                  <div className="bg-indigo-50 rounded-2xl p-6 flex flex-col items-center gap-3 animate-fade-in border border-indigo-100">
                     <Loader2 className="animate-spin text-indigo-600" size={32} />
                     <p className="font-black text-indigo-900">Reconstructing Document Structure...</p>
                     <div className="w-full bg-indigo-200 h-1 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full animate-progress-indefinite"></div>
                     </div>
                  </div>
                )}

                {!isProcessing && (
                  <button
                    onClick={handleMerge}
                    disabled={files.length < 2}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl shadow-2xl hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                      <Merge size={24} />
                      Combine Files Now
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress-indefinite {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-indefinite {
          width: 50%;
          animation: progress-indefinite 1.5s infinite linear;
        }
      `}} />

      <AdBanner />

      <article className="bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-slate-100 prose prose-slate max-w-none text-slate-600">
         <h2 className="text-4xl font-black text-slate-900 mb-8">Professional Grade PDF Merging</h2>
         <p className="lead text-xl mb-10">
            Combine reports, certificates, or book chapters into a single cohesive document. FileMakerOn provides the fastest and most secure way to merge PDFs without leaving your browser.
         </p>

         <Banner728x90 />

         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-16">
            <div className="bg-blue-50 p-10 rounded-[2.5rem] border border-blue-100">
               <h4 className="font-black text-blue-900 text-xl mb-4 flex items-center gap-2"><Zap className="text-blue-500" size={20}/> Instant Local Processing</h4>
               <p className="text-blue-800 leading-relaxed text-sm">
                  We leverage WebAssembly to process your files right in your RAM. This means no upload time, no server-side queues, and 100% privacy for your documents.
               </p>
            </div>
            <div className="bg-indigo-50 p-10 rounded-[2.5rem] border border-indigo-100">
               <h4 className="font-black text-indigo-900 text-xl mb-4 flex items-center gap-2"><Shield className="text-indigo-500" size={20}/> Privacy First Architecture</h4>
               <p className="text-indigo-800 leading-relaxed text-sm">
                  Your sensitive legal or financial documents never touch a third-party server. Everything stays on your computer, ensuring compliance with strict privacy standards.
               </p>
            </div>
         </div>

         <Banner728x90 />

         <h3 className="text-2xl font-bold text-slate-900 mt-16 mb-6">Why Merge PDFs?</h3>
         <p>Many organizations require documents to be submitted as a single file. Merging helps keep your archives organized and professional.</p>

         <Banner728x90 />

         <h3 className="text-2xl font-bold text-slate-900 mt-16 mb-6">Optimized for SEO and Document Indexing</h3>
         <p>Search engines prefer well-structured, comprehensive documents. By merging multiple related assets into one, you improve your E-A-T score.</p>

         <Banner728x90 />
      </article>

      <RelatedTools />
    </div>
  );
};

export default PdfMerge;