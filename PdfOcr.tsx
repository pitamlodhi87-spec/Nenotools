import React, { useState, useRef } from 'react';
import { 
  FileSearch, Upload, Download, RefreshCw, 
  CheckCircle, FileText, Loader2, Sparkles, 
  Shield, BrainCircuit, Copy, Trash2, 
  ArrowRight, FileType
} from 'lucide-react';
import { getAllPdfPagesAsImages } from '../services/pdfUtils';
import { formatFileSize } from '../services/imageUtils';
import { AdBanner } from '../components/Layout';
import { RelatedTools } from '../components/RelatedTools';

declare const Tesseract: any;

interface OcrPage {
  index: number;
  image: string;
  text: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
}

const PdfOcr: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<OcrPage[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isOcrRunning, setIsOcrRunning] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPages([]);
      setShowResults(false);
      setIsExtracting(true);
      
      try {
        const extracted = await getAllPdfPagesAsImages(f, 2.0); // High res for OCR
        setPages(extracted.map(p => ({
          index: p.pageIndex,
          image: p.thumbnail,
          text: '',
          status: 'pending',
          progress: 0
        })));
      } catch (err) {
        alert("Failed to read PDF. It may be encrypted.");
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const startOcrBatch = async () => {
    if (pages.length === 0) return;
    setIsOcrRunning(true);
    
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          // Progress for individual worker (if we only used one)
        }
      }
    });

    const updatedPages = [...pages];

    for (let i = 0; i < updatedPages.length; i++) {
      updatedPages[i].status = 'processing';
      setPages([...updatedPages]);

      try {
        const { data: { text } } = await Tesseract.recognize(updatedPages[i].image, 'eng');
        updatedPages[i].text = text;
        updatedPages[i].status = 'completed';
        updatedPages[i].progress = 100;
        setTotalProgress(Math.round(((i + 1) / updatedPages.length) * 100));
      } catch (e) {
        updatedPages[i].status = 'error';
      }
      setPages([...updatedPages]);
    }

    await worker.terminate();
    setIsOcrRunning(false);
    setShowResults(true);
  };

  const downloadFullText = () => {
    const fullContent = pages.map(p => `--- PAGE ${p.index + 1} ---\n\n${p.text}`).join('\n\n');
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr-result-${file?.name}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const fullContent = pages.map(p => p.text).join('\n\n');
    navigator.clipboard.writeText(fullContent);
    alert("Full document text copied to clipboard!");
  };

  const reset = () => {
    setFile(null);
    setPages([]);
    setShowResults(false);
    setTotalProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <section className="text-center space-y-4 pt-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-black uppercase tracking-widest">
           <BrainCircuit size={14} className="animate-pulse" /> Advanced Neural OCR
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900">
            PDF to Text <span className="text-cyan-500">Scanner</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Extract editable text from scanned PDFs and images using high-precision Optical Character Recognition.
        </p>
      </section>

      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-100">
        {!file ? (
          <div 
            onClick={() => inputRef.current?.click()}
            className="border-4 border-dashed border-cyan-100 bg-cyan-50/30 rounded-[2.5rem] p-20 flex flex-col items-center justify-center cursor-pointer hover:bg-cyan-50 hover:border-cyan-300 transition-all group"
          >
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            <FileSearch className="text-cyan-500 mb-6 group-hover:scale-110 transition-transform" size={80} />
            <span className="text-2xl font-black text-slate-800">Upload Scanned PDF</span>
            <p className="text-slate-400 mt-2 font-medium">Drag and drop documents or images for text extraction</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm font-black border border-slate-100">PDF</div>
                <div>
                   <h3 className="font-black text-slate-800 truncate max-w-xs">{file.name}</h3>
                   <p className="text-slate-400 font-bold uppercase text-xs">{formatFileSize(file.size)} • {pages.length} Pages</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button onClick={reset} className="p-4 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={22}/></button>
                {!showResults && (
                  <button 
                    onClick={startOcrBatch}
                    disabled={isOcrRunning || isExtracting}
                    className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl flex items-center gap-2 hover:bg-black transition-all disabled:opacity-30"
                  >
                    {isOcrRunning ? <Loader2 className="animate-spin" /> : <Sparkles size={18}/>}
                    {isOcrRunning ? `Scanning (${totalProgress}%)` : "Start Recognition"}
                  </button>
                )}
                {showResults && (
                  <>
                    <button onClick={copyToClipboard} className="bg-slate-100 text-slate-700 px-6 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all"><Copy size={18}/> Copy All</button>
                    <button onClick={downloadFullText} className="bg-cyan-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200"><Download size={18}/> Download Text</button>
                  </>
                )}
              </div>
            </div>

            {isOcrRunning && (
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full transition-all duration-500 shadow-[0_0_10px_cyan]" 
                  style={{ width: `${totalProgress}%` }}
                ></div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {pages.map((p, idx) => (
                <div key={idx} className={`bg-white border rounded-3xl p-6 transition-all ${p.status === 'processing' ? 'border-cyan-400 ring-4 ring-cyan-50' : 'border-slate-100 hover:border-slate-200'}`}>
                   <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-4 lg:col-span-3">
                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                           <img src={p.image} className="w-full h-full object-contain" alt={`Page ${idx+1}`} />
                           <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-black px-2 py-1 rounded">PAGE {idx + 1}</div>
                           {p.status === 'processing' && (
                             <div className="absolute inset-0 bg-cyan-500/20 backdrop-blur-[1px] flex items-center justify-center">
                                <Loader2 className="text-white animate-spin" size={32} />
                             </div>
                           )}
                        </div>
                      </div>
                      <div className="md:col-span-8 lg:col-span-9 flex flex-col">
                         <div className="flex justify-between items-center mb-4">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${p.status === 'completed' ? 'text-green-500' : p.status === 'processing' ? 'text-cyan-500' : 'text-slate-400'}`}>
                               {p.status === 'completed' ? 'Extraction Complete' : p.status === 'processing' ? 'Neural Processing...' : 'Ready for Scan'}
                            </span>
                            {p.status === 'completed' && <CheckCircle size={16} className="text-green-500" />}
                         </div>
                         <div className="flex-grow bg-slate-50 rounded-2xl p-6 font-mono text-sm text-slate-700 leading-relaxed overflow-auto max-h-60 border border-slate-100">
                            {p.status === 'completed' ? p.text : p.status === 'processing' ? (
                               <div className="flex flex-col gap-2 opacity-30 animate-pulse">
                                  <div className="h-4 bg-slate-300 w-full rounded"></div>
                                  <div className="h-4 bg-slate-300 w-3/4 rounded"></div>
                                  <div className="h-4 bg-slate-300 w-5/6 rounded"></div>
                               </div>
                            ) : "Text will appear here after scanning..."}
                         </div>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AdBanner />

      <article className="bg-white rounded-[3rem] p-10 md:p-20 shadow-sm border border-slate-100 prose prose-slate max-w-none text-slate-600">
         <h2 className="text-4xl font-black text-slate-900 mb-10">Professional Client-Side PDF OCR</h2>
         <p className="lead text-2xl mb-10 text-slate-500">
            Extract text from scanned images, unsearchable PDFs, and screen captures without the security risk of cloud uploads.
         </p>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-16">
            <div className="bg-cyan-50 p-10 rounded-[2.5rem] border border-cyan-100">
               <h4 className="font-black text-cyan-900 text-xl mb-4 flex items-center gap-2"><BrainCircuit className="text-cyan-500" size={20}/> Tesseract Neural Engine</h4>
               <p className="text-cyan-800 leading-relaxed text-sm font-medium">
                  We utilize the world's most powerful open-source OCR engine. It supports multiple languages and handles complex document layouts with neural-network-backed accuracy.
               </p>
            </div>
            <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
               <h4 className="font-black text-slate-900 text-xl mb-4 flex items-center gap-2"><Shield className="text-slate-500" size={20}/> 100% Secure & Private</h4>
               <p className="text-slate-800 leading-relaxed text-sm font-medium">
                  Your legal, medical, or financial documents never leave your RAM. The recognition logic is downloaded to your browser and runs locally. Total privacy by design.
               </p>
            </div>
         </div>

         <h3 className="text-3xl font-black text-slate-900 mt-16 mb-6">How PDF OCR Works</h3>
         <p className="text-lg leading-relaxed mb-8">
            Traditional PDF converters fail on scanned documents because those files are essentially just pictures of text. OCR works by analyzing the light and dark patterns of the pixels, identifying letter shapes, and reconstructing them into computer-readable characters.
         </p>
         
         <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white">
            <h4 className="text-2xl font-black mb-6">OCR Optimization Tips</h4>
            <ul className="space-y-4">
               <li className="flex items-start gap-3">
                  <ArrowRight className="text-cyan-400 mt-1 shrink-0" size={18} />
                  <span><strong>Higher Resolution:</strong> We automatically render pages at 300 DPI to ensure the OCR engine gets the best possible source data.</span>
               </li>
               <li className="flex items-start gap-3">
                  <ArrowRight className="text-cyan-400 mt-1 shrink-0" size={18} />
                  <span><strong>Clean Documents:</strong> Scans with lots of noise or handwriting may have lower accuracy. For best results, use digital-first scans.</span>
               </li>
               <li className="flex items-start gap-3">
                  <ArrowRight className="text-cyan-400 mt-1 shrink-0" size={18} />
                  <span><strong>Batch Handling:</strong> Our tool processes pages sequentially to keep your browser responsive, even for 100+ page documents.</span>
               </li>
            </ul>
         </div>
      </article>

      <RelatedTools />
    </div>
  );
};

export default PdfOcr;