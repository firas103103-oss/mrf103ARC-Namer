# Mr.F 103 - Sovereign Intelligence Protocol

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

نظام التحكم الرقمي الشخصي - مجموعة متكاملة من الأدوات الذكية المدعومة بالذكاء الاصطناعي.

## 🚀 Features

- ✨ **Modern UI/UX** - تصميم glassmorphic متطور مع تأثيرات ثلاثية الأبعاد
- 🎨 **3D Background** - خلفية neural network تفاعلية باستخدام Three.js
- 🎭 **Smooth Animations** - رسوم متحركة احترافية باستخدام GSAP
- 🎯 **Custom Cursor** - نظام مؤشر مخصص دقيق وأنيق
- 📱 **Fully Responsive** - متوافق تماماً مع جميع الأجهزة
- ⚡ **Lightning Fast** - مُحسّن للأداء العالي باستخدام Vite
- 🔒 **Environment Variables** - إدارة آمنة للتكوينات
- 🌍 **RTL Support** - دعم كامل للغة العربية

## 📦 Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Build Tool**: Vite 5.0
- **3D Graphics**: Three.js r160
- **Animations**: GSAP 3.12.5
- **Styling**: CSS3 with variables
- **Fonts**: Google Fonts (Tajawal, Orbitron, Space Grotesk)

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/firas103103-oss/MrF_.git
cd MrF_

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
MrF_/
├── src/
│   ├── index.html                 # Main HTML file
│   ├── styles/
│   │   ├── variables.css          # CSS variables
│   │   ├── cursor.css             # Custom cursor styles
│   │   ├── components.css         # Component styles
│   │   └── responsive.css         # Media queries
│   └── scripts/
│       ├── main.js                # Entry point
│       ├── config.js              # Configuration
│       ├── loader.js              # Loading system
│       ├── cursor.js              # Cursor logic
│       ├── three-background.js    # Three.js background
│       └── animations.js          # GSAP animations
├── public/                        # Static assets
├── api/                           # API endpoints (future)
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── vite.config.js                 # Vite configuration
├── package.json                   # Dependencies
└── README.md                      # Documentation
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
VITE_APP_URL=https://app.mrf103.com
VITE_AUTHOR_URL=https://author.mrf103.com
VITE_API_URL=http://localhost:3000
VITE_CONTACT_PHONE=+966591652030
VITE_CONTACT_EMAIL=mr.f@mrf103.com
VITE_ENABLE_THREEJS=true
VITE_ENABLE_ANIMATIONS=true
```

## 🚀 Deployment

### Railway (Recommended)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

See [RAILWAY.md](RAILWAY.md) for detailed Railway deployment guide.

### Vercel / Netlify

```bash
# Build the project
npm run build

# The dist/ folder is ready for deployment
```

### Environment Variables (Production)

Set these in your hosting platform's dashboard:

- `NODE_ENV=production`
- `VITE_APP_URL`
- `VITE_AUTHOR_URL`
- `VITE_CONTACT_PHONE`
- `VITE_CONTACT_EMAIL`
- `PORT` (Railway auto-assigns)

**Railway**: Set in project settings → Variables
**Vercel/Netlify**: Set in project settings → Environment Variables

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ⚠️ IE11 (limited support)

## 🎯 Performance

- **Lighthouse Score**: 95+
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 500KB (gzipped)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👤 Author

**Mr.F 103**

- Email: <mr.f@mrf103.com>
- Phone: +966 59 165 2030
- Location: 🇸🇦 Kingdom of Saudi Arabia

## 🌟 Acknowledgments

- Three.js community
- GSAP team
- Vite contributors
- Google Fonts

---

**© 2026 Mr.F 103 - Engineering the Invisible**
