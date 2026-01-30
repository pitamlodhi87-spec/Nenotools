# NenoTools - Free Online Tools Platform

A modern, feature-rich web application providing various online conversion and editing tools with beautiful UI/UX design.

## 🚀 Features

### Image Conversion Tools
- **PNG to JPG** - Convert PNG images to JPG format with quality control
- **JPG to PNG** - Convert JPG images to PNG format with transparency support
- **PNG to PDF** - Convert PNG images to PDF documents with customizable page size and margins
- **JPG to PDF** - Convert JPG images to PDF documents
- **PDF to Image** - Convert PDF pages to PNG or JPG images

### Image Processing Tools
- **Image Compressor** - Compress images while maintaining quality, supporting JPEG, PNG, and WebP formats
- **Resize Image** - Resize images to custom dimensions with aspect ratio locking

### Utility Tools
- **QR Code Generator** - Generate QR codes from text or URLs with customizable colors and sizes

## 📋 Features & Highlights

✨ **Modern UI/UX Design**
- Gradient-based theme with smooth animations
- Responsive design for all devices
- Dark mode support
- Smooth transitions and hover effects

🔒 **Security & Privacy**
- All processing done client-side
- No files stored on servers
- 100% secure and private

⚡ **Performance**
- Fast file processing
- Optimized compression
- No file size limitations for basic operations

🎨 **Customization**
- Multiple output format options
- Quality and compression settings
- Color customization for QR codes
- Customizable page sizes for PDF conversion

## 📁 Project Structure

```
Nenotools/
├── index.html              # Landing page
├── png-to-jpg.html        # PNG to JPG converter
├── jpg-to-png.html        # JPG to PNG converter
├── png-to-pdf.html        # PNG to PDF converter
├── jpg-to-pdf.html        # JPG to PDF converter
├── image-compressor.html  # Image compression tool
├── resize-image.html      # Image resizing tool
├── pdf-to-image.html      # PDF to image converter
├── qr-generator.html      # QR code generator
├── styles.css             # Main stylesheet
├── script.js              # JavaScript functionality
└── README.md              # Documentation
```

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript** - No framework dependencies
- **Font Awesome** - Icon library

### Libraries
- **html2pdf.js** - PDF generation from images
- **PDF.js** - PDF processing and conversion
- **QR Code Server API** - QR code generation

## 🎨 Design Features

### Color Scheme
- **Primary**: Indigo (#6366f1)
- **Secondary**: Pink (#ec4899)
- **Success**: Emerald (#10b981)
- **Warning**: Amber (#f59e0b)
- **Danger**: Red (#ef4444)

### UI Components
- Navigation bar with sticky positioning
- Hero section with gradient background
- Tool cards with hover animations
- Drag-and-drop file upload areas
- Loading spinners and progress indicators
- Error and success messages
- Responsive grid layouts

### Animations
- Smooth scroll behavior
- Fade-in animations on page load
- Hover effects on cards and buttons
- Loading spinner animation
- Drag-over visual feedback

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or setup required

### Usage

1. **Open the website** - Open `index.html` in your web browser
2. **Choose a tool** - Click on any tool from the landing page
3. **Upload file** - Drag and drop or click to upload your file
4. **Configure settings** - Adjust quality, size, or format as needed
5. **Process** - Click the conversion/processing button
6. **Download** - Download the converted file

## 📱 Responsive Design

The website is fully responsive and works on:
- Desktop computers (1920px and above)
- Tablets (768px - 1024px)
- Mobile phones (320px - 767px)

## 🔧 Customization

### Modifying Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #ec4899;
    /* ... other colors */
}
```

### Adding New Tools
1. Create a new HTML file in the project root
2. Include the navigation and footer
3. Add your tool-specific HTML
4. Link to `styles.css` and `script.js`
5. Add the tool card to `index.html`

## 🌐 Browser Support

- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

## 📝 File Specifications

### Supported Image Formats
- PNG
- JPG/JPEG
- GIF
- WebP

### Maximum File Size
- 50MB per file (configurable in HTML)

### PDF Specifications
- Input: PDF documents (any page count)
- Output: PNG or JPG images
- Page size options: A3, A4, Letter, Legal

## 🔐 Privacy & Security

- ✅ All processing happens in your browser
- ✅ No files are uploaded to any server
- ✅ No tracking or analytics
- ✅ No cookies or personal data collection
- ✅ 100% open source and transparent

## 📄 License

This project is free to use and modify.

---

**NenoTools** - Your Ultimate Online Tools Platform 🚀

Made with ❤️ for productivity and simplicity.
