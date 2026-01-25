# InterVueX - Brand Identity Update

## Logo Design
- **Type**: Circular monogram logo
- **Elements**: 
  - "i" and "V" letters (representing InterVueX)
  - Microphone icon (interviews)
  - Head silhouette in speech bubble (AI conversation)
  - Calendar with checkmark (scheduling/completion)
  - "2026" branding year
- **Shape**: Perfect circle with gray border
- **Background**: White
- **Style**: Clean, professional, monochromatic

## Files Updated

### Logo Assets
- `frontend/public/logo.png` - Main circular logo
- `frontend/public/favicon.ico` - Browser tab icon

### HTML
- `frontend/index.html` - Updated favicon reference

### CSS Styling
- `frontend/src/index.css` - Added circular logo styling rules
- `frontend/src/App.css` - Updated floating brand icon to be circular

## Logo Usage Locations

1. **Browser Tab** - Favicon (circular)
2. **Landing Page Navigation** - Top left corner (circular, 28px)
3. **Landing Page Hero** - Large floating watermark (circular, 600px, 8% opacity)
4. **Dashboard Sidebar** - Brand identity (circular)
5. **README** - Documentation header (circular, 120px)

## CSS Classes Applied

```css
/* All logos are circular */
img[src="/logo.png"],
img[alt="InterVueX Logo"],
img[alt="InterVueX"] {
  border-radius: 50% !important;
  object-fit: cover !important;
  background: white;
  border: 2px solid var(--color-gray-200);
  box-shadow: var(--shadow-sm);
}
```

## Animation

The floating brand icon on the landing page includes:
- **Duration**: 8 seconds
- **Movement**: Gentle vertical float (±30px)
- **Rotation**: Subtle rotation (±2 degrees)
- **Opacity**: 8% (subtle watermark effect)
- **Shape**: Perfect circle

## Responsive Design

- **Desktop**: 600x600px floating logo
- **Mobile**: 300x300px floating logo
- **All sizes**: Maintain circular shape and proportions
