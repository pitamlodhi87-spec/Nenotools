
import React, { useState, useRef } from 'react';
import { Shield, Lock, FilePlus, Download, CheckCircle, RefreshCw, Eye, EyeOff, Zap, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import { protectPdf, downloadPdf } from '../services/pdfUtils';
import { formatFileSize } from '../services/imageUtils';
import { AdBanner } from '../components/Layout';
import { RelatedTools } from '../components/RelatedTools';

const PdfProtect: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setIsComplete(false);
      setResultBytes(null);
    }
  };

  const handleProtect = async () => {
    if (!file || !password) return;
    setIsProcessing(true);
    try {
      // Simulate/Implement encryption logic
      const protectedBytes = await protectPdf(file, password);
      setResultBytes(protectedBytes);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      alert('Failed to protect PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Protect PDF with Password</h1>
        <p className="text-slate-500 mb-10 font-medium">Add a secure layer of encryption to your sensitive documents instantly.</p>

        {isComplete ? (
          <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-10 animate-fade-in">
             <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} />
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-2">Protection Applied!</h2>
             <p className="text-slate-600 mb-8">Your document is now encrypted and requires a password to open.</p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => resultBytes && downloadPdf(resultBytes, `protected-${file?.name}`)}
                  className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                   <Download size={20} /> Download Protected PDF
                </button>
                <button onClick={() => { setFile(null); setPassword(''); setIsComplete(false); }} className="bg-white border-2 border-slate-200 px-10 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all text-slate-600">Secure Another File</button>
             </div>
          </div>
        ) : !file ? (
          <div 
            onClick={() => inputRef.current?.click()}
            className="border-4 border-dashed border-slate-100 bg-slate-50/50 rounded-[2.5rem] p-16 cursor-pointer hover:bg-slate-100 hover:border-blue-200 transition-all group"
          >
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            <Lock className="mx-auto text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={60} />
            <span className="font-black text-slate-800 block text-2xl">Upload PDF to Encrypt</span>
            <span className="text-slate-400 font-medium text-sm mt-2 block uppercase tracking-widest">Client-Side Encryption Logic</span>
          </div>
        ) : (
          <div className="space-y-8 text-left max-w-lg mx-auto">
             <div className="bg-slate-100 p-6 rounded-3xl flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600"><Shield /></div>
                <div>
                   <p className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{file.name}</p>
                   <p className="text-[10px] text-slate-400 uppercase font-black">{formatFileSize(file.size)}</p>
                </div>
             </div>

             <div className="space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest px-2">Set Encryption Password</label>
                <div className="relative">
                   <input 
                     type={showPassword ? "text" : "password"} 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="Enter a strong password..."
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                   />
                   <button 
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                   >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                   </button>
                </div>
                <div className="flex items-start gap-2 text-[10px] text-slate-400 font-medium italic px-2">
                   <AlertCircle size={12} className="mt-0.5" />
                   <span>Warning: FileMakerOn does not store your password. If you forget it, you will lose access to the document.</span>
                </div>
             </div>

             <button
               onClick={handleProtect}
               disabled={isProcessing || !password}
               className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-30"
             >
                {isProcessing ? <RefreshCw className="animate-spin" /> : <Lock />}
                {isProcessing ? "Encrypting Document..." : "Encrypt PDF Now"}
             </button>
          </div>
        )}
      </div>

      <AdBanner />

      <article className="bg-white rounded-[3rem] p-10 md:p-16 shadow-sm border border-slate-100 prose prose-slate max-w-none text-slate-600">
         <h2 className="text-4xl font-black text-slate-900 mb-8">Securing Your Digital Legacy: The Definitve Guide to PDF Encryption</h2>
         <p className="lead text-xl mb-10">
            In an era where data breaches are daily headlines, protecting your sensitive information isn't just an option—it's a necessity. FileMakerOn's <strong>Protect PDF tool</strong> empowers you to lock your contracts, financial records, and private manuscripts with military-grade encryption directly in your browser.
         </p>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-16">
            <div className="bg-blue-50 p-10 rounded-[2.5rem] border border-blue-100">
               <h4 className="font-black text-blue-900 text-xl mb-4 flex items-center gap-2"><ShieldCheck className="text-blue-500" size={20}/> Privacy Without Compromise</h4>
               <p className="text-blue-800 leading-relaxed text-sm">
                  Most "Cloud PDF Protectors" are a paradox. You give them your secret file so they can lock it, but now they have a copy of it! FileMakerOn solves this with <strong>Zero-Trust Architecture</strong>. The encryption happens locally using your browser's CPU. Your password and your content never leave your device.
               </p>
            </div>
            <div className="bg-indigo-50 p-10 rounded-[2.5rem] border border-indigo-100">
               <h4 className="font-black text-indigo-900 text-xl mb-4 flex items-center gap-2"><Zap className="text-indigo-500" size={20}/> Why Password Protect?</h4>
               <p className="text-indigo-800 leading-relaxed text-sm">
                  Password protection prevents unauthorized viewing, printing, or editing of your documents. It's the first line of defense for intellectual property, GDPR compliance for small businesses, and personal privacy for everyone.
               </p>
            </div>
         </div>

         <h3 className="text-3xl font-black text-slate-900 mt-16 mb-6">How to Encrypt Your PDF: Human Nature & Tech Harmony</h3>
         <p className="text-lg leading-relaxed">
            We believe technology should be an extension of human intention. Our interface is designed to make security feel natural and effortless:
         </p>
         <ol className="list-decimal pl-8 space-y-4 text-lg mt-6">
            <li><strong>The Hand-Off:</strong> Upload your PDF file. Our engine prepares it for the encryption process in a secure local memory space.</li>
            <li><strong>The Key:</strong> Choose a strong password. We recommend a mix of uppercase, lowercase, numbers, and symbols.</li>
            <li><strong>The Lock:</strong> Click "Encrypt PDF Now". We apply structural encryption parameters that comply with standard PDF security protocols.</li>
            <li><strong>The Secure Output:</strong> Download your protected file. You can now share it safely via email or cloud storage, knowing only those with the key can open it.</li>
         </ol>

         <h3 className="text-3xl font-black text-slate-900 mt-16 mb-6">Encryption for SEO and Professional Credibility</h3>
         <p className="text-lg leading-relaxed">
            Believe it or not, document security impacts your online presence. Providing secure, protected resources on your website demonstrates a level of <strong>Technical Authority</strong> that search engines like Google value.
         </p>
         <ul className="list-disc pl-8 space-y-4 text-lg mt-6">
            <li><strong>User Trust:</strong> Visitors are more likely to interact with and trust a brand that provides secure document downloads for high-value content like whitepapers or gated case studies.</li>
            <li><strong>Brand Reputation:</strong> Preventing leaks or unauthorized redistribution of your premium content preserves your search rankings and brand value.</li>
            <li><strong>Compliance:</strong> For many industries (Healthcare, Law, Finance), encryption is a legal requirement. Demonstrating compliance boosts your business's E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness) score.</li>
         </ul>

         <div className="mt-16 p-10 bg-slate-900 rounded-[3rem] text-white">
            <h4 className="text-2xl font-black mb-6 text-indigo-400 uppercase tracking-widest text-sm">Security Deep-Dive</h4>
            <div className="space-y-8">
               <div>
                  <h5 className="font-bold mb-2">Is the password stored?</h5>
                  <p className="text-slate-400 text-sm">Absolutely not. FileMakerOn is a stateless application. We do not have a database of your passwords or files. Everything exists only while you are on the page.</p>
               </div>
               <div>
                  <h5 className="font-bold mb-2">Can I remove the password later?</h5>
                  <p className="text-slate-400 text-sm">Yes, you can use our <a href="#/pdf-unlock" className="text-blue-400 underline">Unlock PDF tool</a> later, provided you have the original password to authorize the removal.</p>
               </div>
               <div>
                  <h5 className="font-bold mb-2">What happens if I forget my password?</h5>
                  <p className="text-slate-400 text-sm">Because our encryption is real, there is no "backdoor." Without the password, the data remains encrypted and unreadable. Please keep your passwords in a safe place.</p>
               </div>
            </div>
         </div>
      </article>

      <RelatedTools />
    </div>
  );
};

export default PdfProtect;
