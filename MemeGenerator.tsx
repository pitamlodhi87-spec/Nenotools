
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Smile, Type, Palette } from 'lucide-react';
import { readFileAsDataURL, createMeme } from '../services/imageUtils';
import { RelatedTools } from '../components/RelatedTools';
import { AdBanner } from '../components/Layout';

const MemeGenerator: React.FC = () => {
  const [srcImage, setSrcImage] = useState<string | null>(null);
  const [memeImage, setMemeImage] = useState<string | null>(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  
  // Customization State
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(1); // multiplier 0.5 to 2.0

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const dataUrl = await readFileAsDataURL(file);
      setSrcImage(dataUrl);
      setMemeImage(dataUrl); 
    }
  };

  useEffect(() => {
    if (srcImage) {
      createMeme(srcImage, topText, bottomText, textColor, strokeColor, fontSize).then(setMemeImage);
    }
  }, [srcImage, topText, bottomText, textColor, strokeColor, fontSize]);

  const handleDownload = () => {
    if (memeImage) {
      const link = document.createElement('a');
      link.href = memeImage;
      link.download = `meme-filemakeron.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="border-b border-gray-100 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Meme Generator</h1>
          <p className="text-gray-500">Create viral memes with custom colors, fonts, and styles instantly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls Side */}
          <div className="space-y-6">
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-pink-500 transition-colors"
             >
               <Upload className="text-pink-500 mb-2" size={32} />
               <span className="font-medium text-gray-700">Upload Template Image</span>
               <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF supported</p>
               <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
             </div>

             <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
               <div className="flex items-center gap-2 mb-2 font-bold text-gray-700">
                  <Type size={18} /> Text Settings
               </div>
               
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Top Text</label>
                 <input 
                   type="text" 
                   className="w-full border-gray-300 rounded-lg p-3 focus:ring-pink-500 focus:border-pink-500 font-bold"
                   placeholder="WHEN YOU CODE..."
                   value={topText}
                   onChange={e => setTopText(e.target.value)}
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bottom Text</label>
                 <input 
                   type="text" 
                   className="w-full border-gray-300 rounded-lg p-3 focus:ring-pink-500 focus:border-pink-500 font-bold"
                   placeholder="BUT IT WORKS"
                   value={bottomText}
                   onChange={e => setBottomText(e.target.value)}
                 />
               </div>

               <hr className="border-gray-200 my-4" />
               
               <div className="flex items-center gap-2 mb-2 font-bold text-gray-700">
                  <Palette size={18} /> Style & Colors
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Text Color</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-10 w-12 rounded cursor-pointer border-0 p-0"
                      />
                      <span className="text-sm font-mono text-gray-600">{textColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Border Color</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                        className="h-10 w-12 rounded cursor-pointer border-0 p-0"
                      />
                      <span className="text-sm font-mono text-gray-600">{strokeColor}</span>
                    </div>
                  </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex justify-between">
                    <span>Font Size</span>
                    <span>{Math.round(fontSize * 100)}%</span>
                 </label>
                 <input 
                   type="range" 
                   min="0.5" 
                   max="2.0" 
                   step="0.1" 
                   value={fontSize} 
                   onChange={(e) => setFontSize(parseFloat(e.target.value))}
                   className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                 />
               </div>
             </div>
          </div>

          {/* Preview Side */}
          <div className="space-y-4">
             <div className="bg-gray-900 rounded-xl p-2 min-h-[400px] flex items-center justify-center relative overflow-hidden">
               {memeImage ? (
                 <img src={memeImage} alt="Meme Preview" className="max-w-full max-h-[500px] object-contain shadow-2xl" />
               ) : (
                 <div className="text-gray-500 flex flex-col items-center">
                   <Smile size={64} className="mb-4 opacity-20 text-white"/>
                   <span className="text-gray-400 font-medium">Meme Preview</span>
                   <span className="text-gray-600 text-sm mt-2">Upload an image to start</span>
                 </div>
               )}
             </div>
             
             <button 
               onClick={handleDownload}
               disabled={!memeImage}
               className="w-full bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-pink-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <Download size={24} /> Download Meme
             </button>
          </div>
        </div>
      </div>
      
      {/* Mid-Content Ad */}
      <AdBanner />

      {/* SEO Article Section */}
      <article className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 prose prose-lg max-w-none text-gray-600">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">The Ultimate Guide to Online Meme Generation: Create Viral Content for Free</h2>
        
        <p className="lead">
          In the digital age, memes have become the universal language of the internet. From social media feeds to corporate marketing campaigns, 
          these bite-sized pieces of visual humor convey complex emotions, cultural references, and trending topics instantly. 
          FileMakerOn's <strong>Online Meme Generator</strong> is designed to empower you to create high-quality, professional memes in seconds without installing any heavy software.
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why Use FileMakerOn's Meme Generator?</h3>
        <p>
          While there are countless apps available, our web-based tool offers distinct advantages for creators, marketers, and casual users alike:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Zero Installation:</strong> Works directly in your browser (Chrome, Safari, Firefox, Edge).</li>
          <li><strong>Privacy First:</strong> We use Client-Side processing. Your personal photos are never uploaded to a server; they stay on your device.</li>
          <li><strong>Customization:</strong> Unlike basic tools, we offer full control over text colors, stroke borders, and font sizing.</li>
          <li><strong>No Watermarks:</strong> Create clean, professional-looking memes without intrusive branding.</li>
          <li><strong>Speed:</strong> Instant rendering using HTML5 Canvas technology.</li>
        </ul>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How to Optimize Memes for SEO and Social Media</h3>
        <p>
          Creating the meme is just the first step. To ensure your content goes viral and ranks well on search engines (Google Images, Pinterest), follow these optimization tips:
        </p>
        
        <h4 className="text-xl font-bold text-gray-800 mt-6 mb-2">1. File Naming Matters</h4>
        <p>
          Before uploading your meme to social media or your blog, rename the file from <code>IMG_1234.jpg</code> to something descriptive like 
          <code>funny-coding-meme-javascript.jpg</code>. Search engines read file names to understand image context.
        </p>

        <h4 className="text-xl font-bold text-gray-800 mt-6 mb-2">2. Use Alt Text</h4>
        <p>
          When posting your meme, always include "Alt Text" (Alternative Text). Describe the image and the text on it. 
          For example: "A picture of a confused cat with text overlay saying 'When the code works but I don't know why'". 
          This makes your meme accessible to visually impaired users and helps Google index your content.
        </p>

        <h4 className="text-xl font-bold text-gray-800 mt-6 mb-2">3. Choose the Right Format</h4>
        <p>
          Our tool exports in PNG format by default, which is high quality. However, if you need a smaller file size for a website, 
          you can use our <a href="#/img-to-jpg" className="text-pink-600 hover:underline">Image to JPG Converter</a> to compress it. 
          JPEGs are generally better for loading speed, while PNGs preserve text clarity best.
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Frequently Asked Questions (FAQ)</h3>
        
        <div className="space-y-4">
          <div>
            <h5 className="font-bold text-gray-900">Is this tool free?</h5>
            <p>Yes, FileMakerOn is 100% free to use for unlimited memes.</p>
          </div>
          <div>
            <h5 className="font-bold text-gray-900">Do you support other languages?</h5>
            <p>Yes! Since the tool uses your system fonts, you can type in any language supported by your keyboard, including Emoji, Spanish, Hindi, and more.</p>
          </div>
          <div>
            <h5 className="font-bold text-gray-900">Can I use these memes commercially?</h5>
            <p>The meme <em>template</em> (the image you upload) determines copyright. If you own the photo or use a public domain image, the resulting meme is yours to use commercially.</p>
          </div>
        </div>
      </article>
      
      <RelatedTools />
    </div>
  );
};

export default MemeGenerator;
