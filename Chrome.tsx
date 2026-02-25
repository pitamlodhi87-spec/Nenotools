import React, { useState, useEffect } from 'react';
import { 
  Calculator, ArrowRightLeft, Trash2, ArrowDown, Code, 
  Binary, FileJson, Check, Copy, AlertCircle, RefreshCw, Cpu, Layers,
  Thermometer, Ruler, Weight, Zap, Hash, Database, Globe, MousePointer2
} from 'lucide-react';
import { AdBanner } from '../components/Layout';
import { RelatedTools } from '../components/RelatedTools';

const Chrome: React.FC = () => {
  // Sum Tool
  const [inputNumbers, setInputNumbers] = useState('');
  const [total, setTotal] = useState<number>(0);
  
  // Unit Tool (PX to REM)
  const [pxVal, setPxVal] = useState<number>(16);
  const [baseSize, setBaseSize] = useState<number>(16);
  
  // Universal Unit Converter
  const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'temp' | 'data'>('length');
  const [unitVal, setUnitVal] = useState<number>(0);
  const [fromUnit, setFromUnit] = useState<string>('');
  const [toUnit, setToUnit] = useState<string>('');
  const [unitResult, setUnitResult] = useState<number | null>(null);

  // JSON Tool
  const [jsonInput, setJsonInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState('');

  // Base64 Tool
  const [b64Input, setB64Input] = useState('');
  const [b64Output, setB64Output] = useState('');

  // URL Tool
  const [urlInput, setUrlInput] = useState('');
  const [urlOutput, setUrlOutput] = useState('');

  useEffect(() => {
    const nums = inputNumbers.split(/[\n, ]+/).filter(n => n.trim() !== '').map(Number).filter(n => !isNaN(n));
    setTotal(nums.reduce((a, b) => a + b, 0));
  }, [inputNumbers]);

  useEffect(() => {
    // Set defaults when category changes
    if (unitCategory === 'length') { setFromUnit('m'); setToUnit('cm'); }
    if (unitCategory === 'weight') { setFromUnit('kg'); setToUnit('g'); }
    if (unitCategory === 'temp') { setFromUnit('c'); setToUnit('f'); }
    if (unitCategory === 'data') { setFromUnit('mb'); setToUnit('gb'); }
  }, [unitCategory]);

  useEffect(() => {
    convertUnits();
  }, [unitVal, fromUnit, toUnit, unitCategory]);

  const convertUnits = () => {
    if (isNaN(unitVal)) return;
    let res = 0;

    if (unitCategory === 'length') {
      const toMeters: Record<string, number> = { m: 1, cm: 0.01, km: 1000, inch: 0.0254, ft: 0.3048 };
      const meters = unitVal * toMeters[fromUnit];
      res = meters / toMeters[toUnit];
    } else if (unitCategory === 'weight') {
      const toGrams: Record<string, number> = { g: 1, kg: 1000, mg: 0.001, lb: 453.592, oz: 28.3495 };
      const grams = unitVal * toGrams[fromUnit];
      res = grams / toGrams[toUnit];
    } else if (unitCategory === 'temp') {
      if (fromUnit === 'c' && toUnit === 'f') res = (unitVal * 9/5) + 32;
      else if (fromUnit === 'f' && toUnit === 'c') res = (unitVal - 32) * 5/9;
      else if (fromUnit === 'c' && toUnit === 'k') res = unitVal + 273.15;
      else if (fromUnit === 'k' && toUnit === 'c') res = unitVal - 273.15;
      else res = unitVal;
    } else if (unitCategory === 'data') {
      const toBytes: Record<string, number> = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3, tb: 1024 ** 4 };
      const bytes = unitVal * toBytes[fromUnit];
      res = bytes / toBytes[toUnit];
    }
    setUnitResult(res);
  };

  const formatJson = () => {
    try {
      setJsonError('');
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
    } catch (e: any) {
      setJsonError(e.message);
      setJsonOutput('');
    }
  };

  const handleBase64 = (encode: boolean) => {
    try {
      if (encode) setB64Output(btoa(b64Input));
      else setB64Output(atob(b64Input));
    } catch (e) {
      setB64Output('Invalid input for operation.');
    }
  };

  const handleUrl = (encode: boolean) => {
    try {
      if (encode) setUrlOutput(encodeURIComponent(urlInput));
      else setUrlOutput(decodeURIComponent(urlInput));
    } catch (e) {
      setUrlOutput('Invalid URL encoding.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4">
       <header className="text-center space-y-6 pt-16">
          <div className="inline-flex items-center justify-center gap-4 text-5xl md:text-6xl font-black tracking-tighter uppercase text-slate-900 drop-shadow-sm">
            <div className="bg-slate-900 text-cyan-400 p-3 rounded-2xl shadow-xl rotate-3 hover:rotate-0 transition-transform duration-300">
               <Cpu size={40} />
            </div>
            <span>Chrome <span className="text-cyan-500 underline decoration-4 underline-offset-8 decoration-cyan-500/20">DevBox</span></span>
          </div>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            The ultimate browser-side toolbelt for modern web engineers. <br className="hidden md:block"/> 
            Instant processing, zero server overhead, 100% precision.
          </p>
       </header>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Adder Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><Calculator /></div>
                <h2 className="text-xl font-bold text-slate-800">Smart Adder</h2>
             </div>
             <textarea
                value={inputNumbers}
                onChange={(e) => setInputNumbers(e.target.value)}
                className="w-full h-40 p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm outline-none transition-all"
                placeholder="Paste lists of numbers, CSV, or spaces to sum..."
             />
             <div className="mt-4 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white flex flex-col items-center shadow-xl">
                <span className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Running Total</span>
                <span className="text-5xl font-black tabular-nums">{total.toLocaleString()}</span>
             </div>
             <button onClick={() => setInputNumbers('')} className="mt-4 text-xs font-bold text-slate-400 hover:text-red-500 flex items-center justify-center gap-1 transition-colors py-2"><Trash2 size={12}/> Clear All</button>
          </div>

          {/* PX to REM Converter */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl shadow-inner"><Layers /></div>
                <h2 className="text-xl font-bold text-slate-800">PX ↔ REM Studio</h2>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Base Size</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={baseSize} onChange={e => setBaseSize(Number(e.target.value))} className="w-20 p-2 bg-white border border-slate-200 rounded-xl text-center font-black text-slate-700 focus:ring-2 focus:ring-cyan-500 outline-none" />
                    <span className="text-xs font-bold text-slate-400">px</span>
                  </div>
                </div>
                <div className="p-10 bg-gradient-to-br from-slate-50 to-white rounded-[2.5rem] border border-slate-100 space-y-6 text-center relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                   <input 
                    type="number" 
                    value={pxVal} 
                    onChange={e => setPxVal(Number(e.target.value))} 
                    className="w-full bg-transparent text-7xl font-black text-center text-slate-800 focus:outline-none relative z-10 tabular-nums" 
                   />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] relative z-10">Pixels</p>
                   <div className="w-12 h-12 bg-white rounded-full shadow-lg mx-auto flex items-center justify-center border border-slate-100 relative z-10 -my-4"><ArrowDown size={22} className="text-cyan-500 animate-bounce-slow"/></div>
                   <div className="text-6xl font-black text-cyan-600 relative z-10 tabular-nums">
                     {(pxVal / baseSize).toFixed(3)}<span className="text-xl ml-1 opacity-50 font-bold uppercase tracking-tighter">rem</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Universal Unit Converter */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col h-full hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shadow-inner"><Zap /></div>
                <h2 className="text-xl font-bold text-slate-800">Unit Hub</h2>
             </div>
             <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
                <button onClick={() => setUnitCategory('length')} className={`flex-1 flex items-center justify-center p-3 rounded-xl text-[10px] font-black uppercase transition-all ${unitCategory === 'length' ? 'bg-white shadow-md text-purple-600' : 'text-slate-500'}`}><Ruler size={14} className="mr-1" /> Length</button>
                <button onClick={() => setUnitCategory('temp')} className={`flex-1 flex items-center justify-center p-3 rounded-xl text-[10px] font-black uppercase transition-all ${unitCategory === 'temp' ? 'bg-white shadow-md text-purple-600' : 'text-slate-500'}`}><Thermometer size={14} className="mr-1" /> Temp</button>
                <button onClick={() => setUnitCategory('data')} className={`flex-1 flex items-center justify-center p-3 rounded-xl text-[10px] font-black uppercase transition-all ${unitCategory === 'data' ? 'bg-white shadow-md text-purple-600' : 'text-slate-500'}`}><Database size={14} className="mr-1" /> Data</button>
             </div>
             
             <div className="space-y-6">
                <input 
                  type="number" 
                  value={unitVal} 
                  onChange={e => setUnitVal(Number(e.target.value))} 
                  className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-3xl font-black text-center outline-none focus:ring-2 focus:ring-purple-500 tabular-nums"
                />
                <div className="flex gap-3 items-center">
                   <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="flex-1 p-4 bg-slate-50 rounded-2xl text-xs font-bold border-none outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors">
                      {unitCategory === 'length' && <>
                        <option value="m">Meters (m)</option><option value="cm">CM</option><option value="km">KM</option><option value="inch">Inch</option><option value="ft">Feet</option>
                      </>}
                      {unitCategory === 'temp' && <>
                        <option value="c">Celsius (°C)</option><option value="f">Fahrenheit (°F)</option><option value="k">Kelvin (K)</option>
                      </>}
                      {unitCategory === 'data' && <>
                        <option value="b">Bytes</option><option value="kb">KB</option><option value="mb">MB</option><option value="gb">GB</option><option value="tb">TB</option>
                      </>}
                   </select>
                   <div className="text-slate-300"><ArrowRightLeft size={18}/></div>
                   <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="flex-1 p-4 bg-slate-50 rounded-2xl text-xs font-bold border-none outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors">
                      {unitCategory === 'length' && <>
                        <option value="m">Meters (m)</option><option value="cm">CM</option><option value="km">KM</option><option value="inch">Inch</option><option value="ft">Feet</option>
                      </>}
                      {unitCategory === 'temp' && <>
                        <option value="c">Celsius (°C)</option><option value="f">Fahrenheit (°F)</option><option value="k">Kelvin (K)</option>
                      </>}
                      {unitCategory === 'data' && <>
                        <option value="b">Bytes</option><option value="kb">KB</option><option value="mb">MB</option><option value="gb">GB</option><option value="tb">TB</option>
                      </>}
                   </select>
                </div>
                <div className="p-8 bg-purple-50 rounded-[2.5rem] border border-purple-100 text-center shadow-inner">
                   <p className="text-4xl font-black text-purple-700 tabular-nums">
                      {unitResult !== null ? (unitResult % 1 === 0 ? unitResult : unitResult.toFixed(4)) : '0'}
                   </p>
                   <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mt-2">Converted to {toUnit.toUpperCase()}</p>
                </div>
             </div>
          </div>

          {/* JSON Formatter */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-12 flex flex-col h-full md:col-span-2 lg:col-span-3 hover:shadow-2xl transition-all duration-300">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner"><FileJson /></div>
                <h2 className="text-2xl font-black text-slate-800">JSON Beautifier & Validator</h2>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      className="w-full h-96 p-6 bg-slate-50 border border-slate-200 rounded-3xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
                      placeholder="Paste messy JSON here..."
                   />
                   <div className="flex gap-4">
                     <button onClick={formatJson} className="flex-grow bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl active:scale-95">
                        <RefreshCw size={24} /> Beautify Code
                     </button>
                     <button onClick={() => setJsonInput('')} className="bg-slate-100 text-slate-500 p-5 rounded-2xl hover:bg-slate-200 transition-colors"><Trash2 size={24}/></button>
                   </div>
                </div>
                <div className="relative h-[500px] group">
                   <div className="w-full h-full p-8 bg-slate-950 text-emerald-400 rounded-3xl font-mono text-xs overflow-auto whitespace-pre border border-slate-800 shadow-2xl custom-scrollbar selection:bg-indigo-500 selection:text-white">
                      {jsonOutput || (jsonError ? <span className="text-rose-400 flex items-center gap-3 font-bold bg-rose-400/10 p-4 rounded-xl border border-rose-400/20"><AlertCircle size={20}/> PARSE ERROR: {jsonError}</span> : <span className="text-slate-600 italic">Prettified and validated JSON output will appear here...</span>)}
                   </div>
                   {jsonOutput && (
                     <button onClick={() => copyToClipboard(jsonOutput)} className="absolute top-6 right-6 bg-slate-800/80 backdrop-blur-md text-white px-5 py-3 rounded-2xl hover:bg-slate-700 transition-all shadow-lg flex items-center gap-2 text-xs font-bold border border-slate-700 active:scale-90">
                        <Copy size={16}/> Copy
                     </button>
                   )}
                </div>
             </div>
          </div>

          {/* Base64 & URL Studio */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-12 flex flex-col h-full md:col-span-2 lg:col-span-3 hover:shadow-2xl transition-all duration-300">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner"><Binary /></div>
                   <h2 className="text-2xl font-black text-slate-800">Transformation Studio</h2>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">Quick Actions</span>
                </div>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Base64 Converter</label>
                      <textarea
                         value={b64Input}
                         onChange={(e) => setB64Input(e.target.value)}
                         className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                         placeholder="String to encode or Base64 to decode..."
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleBase64(true)} className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">Encode</button>
                        <button onClick={() => handleBase64(false)} className="flex-1 border-2 border-slate-100 text-slate-700 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Decode</button>
                      </div>
                   </div>
                   <div className="p-6 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-xs border border-slate-800 shadow-xl min-h-[100px] break-all relative">
                      {b64Output || <span className="text-slate-700 italic">Base64 result...</span>}
                      {b64Output && <button onClick={() => copyToClipboard(b64Output)} className="absolute top-2 right-2 p-2 text-slate-500 hover:text-white"><Copy size={14}/></button>}
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-3">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">URL Encoder/Decoder</label>
                      <textarea
                         value={urlInput}
                         onChange={(e) => setUrlInput(e.target.value)}
                         className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                         placeholder="URL to safely encode or raw string to decode..."
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleUrl(true)} className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">URL Encode</button>
                        <button onClick={() => handleUrl(false)} className="flex-1 border-2 border-slate-100 text-slate-700 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">URL Decode</button>
                      </div>
                   </div>
                   <div className="p-6 bg-slate-950 text-blue-400 rounded-2xl font-mono text-xs border border-slate-800 shadow-xl min-h-[100px] break-all relative">
                      {urlOutput || <span className="text-slate-700 italic">URL transformation result...</span>}
                      {urlOutput && <button onClick={() => copyToClipboard(urlOutput)} className="absolute top-2 right-2 p-2 text-slate-500 hover:text-white"><Copy size={14}/></button>}
                   </div>
                </div>
             </div>
          </div>
       </div>

       <AdBanner />
       <RelatedTools />
    </div>
  );
};

export default Chrome;