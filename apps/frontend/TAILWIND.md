# Tailwind CSS Setup

Tailwind CSS is now configured and ready to use in your Next.js frontend!

## Quick Start

### Using Utility Classes

```tsx
export function MyComponent() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900">Hello World</h1>
      <p className="text-gray-600 mt-2">This is styled with Tailwind!</p>
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-4">
        Click Me
      </button>
    </div>
  );
}
```

## Common Patterns

### Layout

```tsx
<div className="container mx-auto px-4">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{/* Grid items */}</div>
</div>
```

### Flexbox

```tsx
<div className="flex items-center justify-between">
  <span>Left</span>
  <span>Right</span>
</div>
```

### Responsive Design

```tsx
<div className="text-sm md:text-base lg:text-lg">{/* Font size changes at breakpoints */}</div>
```

### Hover States

```tsx
<button className="bg-blue-500 hover:bg-blue-600 transition-colors">Hover me</button>
```

### Dark Mode (if enabled)

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Content</div>
```

## Configuration

### Customizing Theme

Edit `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3490dc',
        secondary: '#ffed4e',
      },
      spacing: {
        128: '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
};
```

### Adding Plugins

```bash
npm install -D @tailwindcss/forms @tailwindcss/typography
```

Then in `tailwind.config.js`:

```js
module.exports = {
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
```

## Custom Styles

### Using @apply in CSS

In your CSS files:

```css
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded;
  }
}
```

### Custom Components

```css
@layer components {
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
```

## Useful Tailwind Classes

### Spacing

- `p-4` - padding 1rem
- `px-4` - padding-left/right 1rem
- `py-4` - padding-top/bottom 1rem
- `m-4` - margin 1rem
- `space-x-4` - gap between children (horizontal)

### Typography

- `text-sm/base/lg/xl/2xl/3xl` - font sizes
- `font-normal/medium/semibold/bold` - font weights
- `text-gray-500` - text color
- `text-center/left/right` - text alignment

### Layout

- `flex` - display flex
- `grid` - display grid
- `hidden` - display none
- `block` - display block
- `w-full` - width 100%
- `h-screen` - height 100vh

### Borders & Shadows

- `border` - 1px border
- `border-2` - 2px border
- `rounded` - border radius
- `shadow-sm/md/lg/xl` - box shadow

### Colors

- `bg-blue-500` - background color
- `text-blue-500` - text color
- `border-blue-500` - border color

## Resources

- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)
- [Headless UI (Unstyled Components)](https://headlessui.com/)

## VS Code Extension

Install "Tailwind CSS IntelliSense" for:

- Autocomplete
- Linting
- Hover previews
- Syntax highlighting
