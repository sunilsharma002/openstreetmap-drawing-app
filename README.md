# 🗺️ OpenStreetMap Drawing Application

🌐 **Live Demo:** https://sunilsharma002.github.io/openstreetmap-drawing-app/

A modern interactive web application for drawing and managing geometric shapes on OpenStreetMap. Built with React + TypeScript + Leaflet, supporting polygons, rectangles, circles, and line strings with non-overlap validation and GeoJSON export.

## ✨ Core Features

### 🎨 Drawing Tools
- Polygon, Rectangle, Circle, Line String
- Click-to-draw interaction
- Real-time previews
- Cancel drawing anytime (ESC)

### 🚫 Smart Polygon Rules
- Polygon, Rectangle & Circle cannot overlap
- Auto-trim overlapping areas using Turf.js
- Fully enclosed polygons are blocked with error
- Line strings are not restricted—can cross anything

### 📊 Feature Management
- Sidebar list showing all shapes
- Delete individual shapes
- Shape type counters
- Auto-assigned timestamps & names

### 💾 Export
- One-click export to GeoJSON
- Standard structure—ready for GIS tools

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
git clone https://github.com/sunilsharma002/openstreetmap-drawing-app.git
cd openstreetmap-drawing-app
npm install
npm run dev
```

### Open:
```
http://localhost:3000
```

### Build (Optional)
```bash
npm run build
```

## 🛠️ Technology Stack
- React + TypeScript
- Leaflet & React-Leaflet
- Turf.js — geometry operations
- Zustand — global state
- Vite — build & dev

## � Project Structure
```
src/
├── components/          # UI & map tools
├── store/               # Zustand state
├── utils/               # Turf + GeoJSON helpers
├── types/               # TS interfaces
└── main.tsx / App.tsx  # Entry & root UI
```

## 🎮 How to Use
1. Select a tool from the side panel
2. Click on the map to draw
3. View & manage shapes in the sidebar
4. Export to GeoJSON anytime

## ⚙️ Shape Limits
Editable in `src/store/useAppStore.ts`:
```typescript
const DEFAULT_SHAPE_LIMITS = {
  polygon: 10,
  rectangle: 8,
  circle: 5,
  linestring: 15
};
```

## � GeoJSON Example
```json
{
  "type": "FeatureCollection",
  "features": [...]
}
```

## 📝 Assignment Requirements Covered
✔ OpenStreetMap rendering  
✔ Polygon, rectangle, circle, line support  
✔ Non-overlapping logic (auto-trim + block)  
✔ GeoJSON export  
✔ Adjustable shape limits  
✔ Clean code with modular structure  
✔ Public repo + deploy ready  

## 🌍 Developer Contact

👨‍💻 **Sunil Sharma**  
📧 Email: sunil703354@gmail.com  
📱 Phone: +91 7033541232  
🔗 GitHub: https://github.com/sunilsharma002  
🔗 LinkedIn: https://www.linkedin.com/in/sunilsharma002/ 

🇮🇳 India
