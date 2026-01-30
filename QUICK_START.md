# NenoTools - Quick Start Guide

## 📦 Project Summary

NenoTools is a complete, modern online tools platform with 8 different utilities featuring:
- Modern UI/UX design with gradient themes
- Responsive design for all devices
- Client-side processing (100% secure)
- Beautiful animations and interactions

## 🎯 Available Tools

### 1. **PNG to JPG Converter** (`png-to-jpg.html`)
- Convert PNG images to JPG format
- Quality control slider
- Drag & drop upload
- Real-time preview

### 2. **JPG to PNG Converter** (`jpg-to-png.html`)
- Convert JPG to PNG with transparency
- Compression level control
- Maintains image quality

### 3. **PNG to PDF Converter** (`png-to-pdf.html`)
- Convert PNG images to PDF
- Customizable page sizes (A3, A4, Letter, Legal)
- Adjustable margins
- Uses html2pdf.js library

### 4. **JPG to PDF Converter** (`jpg-to-pdf.html`)
- Convert JPG images to PDF documents
- Same customization options as PNG to PDF
- Multi-page support

### 5. **Image Compressor** (`image-compressor.html`)
- Reduce image file sizes
- Multiple format support (JPEG, PNG, WebP)
- Shows size reduction statistics
- Quality adjustment slider

### 6. **Resize Image** (`resize-image.html`)
- Resize images to custom dimensions
- Aspect ratio locking option
- Pixel-perfect resizing
- Automatic dimension detection from uploads

### 7. **PDF to Image Converter** (`pdf-to-image.html`)
- Convert PDF pages to PNG/JPG
- Multi-page PDF support
- Each page converts to separate image
- Quality control
- Uses PDF.js library

### 8. **QR Code Generator** (`qr-generator.html`)
- Generate QR codes from text/URLs
- Customizable size options
- Color customization
- Uses QR Server API

## 🚀 How to Use

### Option 1: Direct File Opening
1. Open `index.html` in any modern web browser
2. Click on any tool card
3. Follow the on-screen instructions

### Option 2: Local Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js (with http-server)
npx http-server

# Using PHP
php -S localhost:8000
```
Then open: `http://localhost:8000`

## 📁 File Structure

```
Nenotools/
├── index.html              # Home page with all tools
├── png-to-jpg.html        # PNG → JPG converter
├── jpg-to-png.html        # JPG → PNG converter
├── png-to-pdf.html        # PNG → PDF converter
├── jpg-to-pdf.html        # JPG → PDF converter
├── image-compressor.html  # Image compression
├── resize-image.html      # Image resizing
├── pdf-to-image.html      # PDF → Image converter
├── qr-generator.html      # QR code generator
├── styles.css             # Main stylesheet (responsive, dark mode)
├── script.js              # JavaScript functionality
├── README.md              # Full documentation
└── QUICK_START.md         # This file
```

## 🎨 Design Features

### Color Palette
- **Primary Blue**: #6366f1
- **Secondary Pink**: #ec4899
- **Success Green**: #10b981
- **Warning Orange**: #f59e0b
- **Danger Red**: #ef4444

### Responsive Breakpoints
- Desktop: 1200px+
- Tablet: 768px - 1024px
- Mobile: 320px - 767px

### Key Features
- Gradient backgrounds
- Smooth animations
- Hover effects on all interactive elements
- Loading spinners
- Error/success messages
- Dark mode support (via CSS prefers-color-scheme)
- Drag & drop file handling

## 🛠️ Technology Stack

### Frontend Technologies
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with variables and animations
- **JavaScript (Vanilla)** - No dependencies required

### External Libraries
- **Font Awesome 6.0** - Icons
- **html2pdf.js** - PDF generation
- **PDF.js** - PDF processing
- **QR Server API** - QR code generation

### APIs Used
- HTML5 File API
- Canvas API
- Fetch API
- FileReader API

## 📋 Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | Latest  | ✅ Full |
| Firefox | Latest  | ✅ Full |
| Safari  | Latest  | ✅ Full |
| Edge    | Latest  | ✅ Full |

## 🔐 Security & Privacy

✅ **100% Client-Side Processing**
- All conversions happen in your browser
- No files uploaded to any server
- No tracking or analytics
- No cookies or data collection
- Completely open source

## ⚙️ Customization Tips

### Change Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #your-color;
    --secondary-color: #your-color;
    /* ... modify other colors */
}
```

### Add New Tools
1. Create new HTML file with standard layout
2. Include same nav and footer structure
3. Add tool-specific HTML/JS
4. Link to `styles.css` and `script.js`
5. Add tool card to `index.html`

### Modify Styling
- All spacing uses CSS variables
- Responsive values in media queries
- Grid and flexbox layouts for responsiveness

## 📱 Responsive Design

The website automatically adapts to:
- **Desktops** - Full-width layouts, multiple columns
- **Tablets** - 2-column grids, optimized spacing
- **Mobile** - Single column, touch-friendly buttons

## ⚡ Performance Tips

- All processing is instant (client-side)
- Images are cached in browser memory
- No server calls for conversions
- Minimal CSS (optimized for speed)
- Font Awesome icons load via CDN

## 🐛 Troubleshooting

### Files not converting?
- Ensure your browser is up-to-date
- Check browser console for errors (F12)
- Try a different file format

### Large files slow?
- Reduce file size first
- Use lower quality settings
- Try different browser

### Drag & drop not working?
- Try clicking the upload area instead
- Ensure you're using supported file formats
- Check file permissions

## 📚 Learn More

- See `README.md` for detailed documentation
- Check individual HTML files for specific tool implementation
- Review `styles.css` for design system
- Check `script.js` for JavaScript implementation

## 🎓 Code Quality

- Semantic HTML5
- Mobile-first CSS design
- Vanilla JavaScript (no frameworks)
- Organized file structure
- Well-commented code
- Responsive image handling

## 🚀 Future Enhancements

Consider adding:
- Batch file processing
- Video format conversion
- Audio conversion
- Document editing (DOCX, ODT)
- Image editing (crop, rotate, filters)
- Offline mode with Service Worker
- Progressive Web App (PWA)
- Multi-language support
- Cloud storage integration

## 📞 Support & Feedback

For issues or suggestions:
- Check browser console for errors
- Verify file format compatibility
- Ensure browser is modern and updated
- Try clearing browser cache

## 📄 License

Free to use and modify for any purpose.

---

**NenoTools** - Your Ultimate Online Tools Platform 🚀

Created with ❤️ for productivity and simplicity.
