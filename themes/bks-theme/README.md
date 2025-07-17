# Modern CV 2025

A cutting-edge, professional CV theme built with Hugo, optimized for the 2025 job market.

## Features

✨ **Modern Design**: Clean, contemporary aesthetic following 2025 design trends
📱 **Fully Responsive**: Perfect display on all devices and screen sizes
🎨 **Customizable**: Easy theming with CSS variables and flexible configuration
📄 **PDF Export**: High-quality PDF generation optimized for ATS systems
🌍 **Multilingual**: Built-in support for multiple languages
⚡ **Performance**: Optimized for speed and SEO
🎯 **ATS Friendly**: Structured for modern recruiting tools
🔧 **Easy Setup**: Simple configuration and deployment

## Quick Start

1. **Install Hugo** (Extended version required)
2. **Clone or download** this theme
3. **Configure** your CV data in the config files
4. **Build** your site with `hugo`
5. **Export** to PDF with the included script

## Configuration

### Basic Setup

```toml
# config.toml
baseURL = "https://yourdomain.com"
languageCode = "en-us"
title = "Your Name - CV"
theme = "modern-cv-2025"

[params]
  author = "Your Name"
  description = "Professional CV"
  
  [params.profile]
    name = "Your Name"
    tagline = "Your Professional Title"
    avatar = "profile.jpg"
```

### Skills Configuration

```toml
[[params.skills.list]]
skill = "Python"
level = "95%"

[[params.skills.list]]
skill = "JavaScript"
level = "90%"
```

### Experience Configuration

```toml
[[params.experience.list]]
position = "Senior Developer"
company = "Tech Company"
dates = "2022 - Present"
details = "Led development of modern web applications..."
```

## PDF Export

Generate professional PDFs with the included script:

```bash
./scripts/generate_cv.sh config.toml output.pdf
```

## Customization

### Color Themes

The theme uses CSS variables for easy customization:

```css
:root {
  --primary-600: #your-color;
  --accent-color: #your-accent;
}
```

### Layout Options

- Single column layout
- Two column layout
- Timeline view for experience
- Grid view for skills

## Multilingual Support

Create separate configurations for different languages:

```
config/
├── languages/
│   ├── en.toml
│   └── de.toml
```

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Lighthouse Score: 100/100
- Core Web Vitals: Excellent
- Optimized images and fonts
- Minimal JavaScript

## License

MIT License - Feel free to use for personal and commercial projects.

## Author

Created by **Michael Boiman**
- GitHub: [@mboiman](https://github.com/mboiman)
- Email: mboiman@gmail.com

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

*Built with ❤️ for the modern job market*