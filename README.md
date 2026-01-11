# OpenStreetMap Drawing Application

A React + TypeScript web application that renders OpenStreetMap tiles and allows users to draw and manage geometric shapes with smart spatial rules.

## 🚀 Live Demo

[View Live Application](https://your-deployment-url.vercel.app) *(Update with your actual deployment URL)*

## ✨ Features

- **Interactive OpenStreetMap base layer**
- **Drawing tools:**
  - Polygon
  - Rectangle  
  - Circle
  - Line String
- **Non-overlapping logic for polygonal shapes**
- **Auto-trimming overlapping areas**
- **Dynamic shape limits**
- **Export all features as GeoJSON**
- **View & delete shapes from a side panel**
- **Smooth UX with instant visual feedback**

## 🎯 Assignment Requirements (Matched)

✔ **1. Map Rendering**
- OpenStreetMap tile layer
- Zoom & pan enabled

✔ **2. Drawing Geometry**
- Tools available:
  - Circle
  - Rectangle
  - Polygon
  - Line String
- (Displayed in a side toolbar)

✔ **3. Shape Constraints**
- **Polygon, Rectangle, Circle**
  - Cannot overlap
  - If overlap occurs → trim new polygon
  - Full containment → block creation
- **Line Strings**
  - Allowed to overlap/cross anything

✔ **4. GeoJSON Export**
- Single-click export button
- Includes geometry + metadata

✔ **5. Dynamic Limits**
- Configurable in code (e.g., polygon:10, circle:5, etc.)

✔ **6. Customizable UI**
- Theming allowed
- Naming flexible

## 🔧 Core Logic: Polygon Overlap Handling

Uses **Turf.js** for geometry math.

**1️⃣ Detect Overlap**
```javascript
turf.intersect(featureA, featureB)
```

**2️⃣ Auto-Trim Overlap**
```javascript
trimPolygon = turf.difference(newPolygon, existingPolygon)
```

**3️⃣ Block Full Containment**
```javascript
turf.booleanContains(existing, new) ➝ reject
```

**4️⃣ Allowed Edge Cases**
- Touching borders = OK
- Lines always exempt

### Technical Implementation

The application implements sophisticated spatial logic using [Turf.js](https://turfjs.org/):

#### Overlap Detection & Resolution
```typescript
// Check if two polygons overlap
export const checkPolygonOverlap = (feature1, feature2) => {
  const intersection = turf.intersect(feature1, feature2);
  return intersection !== null;
};

// Remove overlapping areas from new polygon
export const trimPolygonOverlaps = (newPolygon, existingPolygons) => {
  let trimmedPolygon = newPolygon;
  
  for (const existingPolygon of existingPolygons) {
    // Check for full containment (blocking condition)
    if (turf.booleanContains(existingPolygon, trimmedPolygon)) {
      return null; // Block creation
    }
    
    // Remove overlapping areas
    if (checkPolygonOverlap(trimmedPolygon, existingPolygon)) {
      trimmedPolygon = turf.difference(trimmedPolygon, existingPolygon);
    }
  }
  
  return trimmedPolygon;
};
```

#### Feature-Specific Rules
- **Polygonal Features** (polygon, rectangle, circle): Subject to non-overlap rules
- **Line Strings**: Exempt from overlap rules, can freely cross any feature

## 📦 Project Structure

```
src/
├── components/       # UI components & map
├── store/            # Zustand global state
├── utils/            # Spatial operations + GeoJSON export
├── types/            # TS interfaces
└── App.tsx
```

## 🛠️ Tech Stack

- **React 18** + Vite
- **TypeScript**
- **React Leaflet** + Leaflet
- **Turf.js**
- **Zustand** (state)

## 🚀 Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## ⚙️ Configuration

### Shape Limits

Easily adjust maximum shapes per type in `src/store/useAppStore.ts`:

```typescript
const DEFAULT_SHAPE_LIMITS: ShapeLimits = {
  polygon: 10,    // Max 10 polygons
  rectangle: 8,   // Max 8 rectangles  
  circle: 5,      // Max 5 circles
  linestring: 15  // Max 15 line strings
};
```

### Map Settings

Modify map center and zoom in `src/components/MapComponent.tsx`:

```typescript
<MapContainer
  center={[40.7128, -74.0060]} // [latitude, longitude]
  zoom={13}                     // Initial zoom level
>
```

## 📤 Sample GeoJSON Output

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "featureType": "polygon" },
      "geometry": { "type": "Polygon", "coordinates": [...] }
    }
  ]
}
```

### Complete Sample Export

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": "polygon-1641234567890-abc123",
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [-74.0060, 40.7128],
          [-74.0050, 40.7128],
          [-74.0050, 40.7138],
          [-74.0060, 40.7138],
          [-74.0060, 40.7128]
        ]]
      },
      "properties": {
        "name": "Polygon 1",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "featureType": "polygon"
      }
    },
    {
      "type": "Feature",
      "id": "circle-1641234567891-def456",
      "geometry": {
        "type": "Point",
        "coordinates": [-74.0055, 40.7133]
      },
      "properties": {
        "name": "Circle 1",
        "createdAt": "2024-01-15T10:31:00.000Z",
        "featureType": "circle",
        "radius": 150
      }
    }
  ]
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify

### GitHub Pages

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json:
   ```json
   {
     "homepage": "https://username.github.io/repository-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```
3. Deploy: `npm run deploy`

## 📝 Submission Checklist

✅ **Public GitHub repository**  
✅ **Live hosted link** (Vercel/Netlify/GitHub Pages)  
✅ **README with:**
- Setup instructions
- Polygon overlap logic explained
- Sample GeoJSON
- Shape limits configurable in code

## 📩 Submit here: https://forms.gle/LsyDzgvMk3TTuppx7

## 📬 Developer Contact

👨‍💻 **Sunil Sharma**  
📧 **Email:** sunil703354@gmail.com  
📱 **Phone:** +91 7033541232
🔗 **LinkedIn:** https://www.linkedin.com/in/sunilsharma002/

## 🎯 How to Use

1. **Select a Drawing Tool**: Click on any tool in the sidebar (Polygon, Rectangle, Circle, Line String)
2. **Draw on Map**:
   - **Polygon/Line String**: Click to add points, double-click to finish
   - **Rectangle**: Click for first corner, click again for opposite corner
   - **Circle**: Click for center, click again to set radius
3. **Manage Features**: View all drawn features in the sidebar, delete unwanted ones
4. **Export**: Click "Export GeoJSON" to download all features

## 📄 Dependencies

### Production Dependencies
- `react` & `react-dom`: UI framework
- `leaflet` & `react-leaflet`: Map functionality
- `@turf/turf`: Spatial operations
- `zustand`: State management

### Development Dependencies
- `typescript`: Type safety
- `vite`: Build tool
- `eslint`: Code linting
- Various type definitions

## 🐛 Known Issues

- Very complex polygons with many vertices may impact performance
- Mobile touch interactions could be improved
- Undo/redo functionality not yet implemented

## 🔮 Future Enhancements

- [ ] Undo/redo functionality
- [ ] Feature editing (move, resize, reshape)
- [ ] Import GeoJSON files
- [ ] Custom styling options
- [ ] Mobile-optimized touch controls
- [ ] Snap-to-grid functionality
- [ ] Measurement tools