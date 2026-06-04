/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // 儿童护眼色彩系统
        kid: {
          bg: '#f9fbf8',
          text: '#3a4b39',
          primary: '#64c270',
          secondary: '#8bd88f',
          border: '#e8f5e9',
          card: '#ffffff',
          dark: {
            bg: '#1a261b',
            card: '#2c3b2d',
            text: '#e8f0e7',
            border: '#3d4f3e',
          }
        }
      },
      fontFamily: {
        'title': ['"Ma Shan Zheng"', 'cursive'],
        'body': ['"Alibaba PuHuiTi"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      fontSize: {
        'kid-xl': ['48px', { lineHeight: '1.3', fontWeight: '400' }],
        'kid-lg': ['36px', { lineHeight: '1.4', fontWeight: '400' }],
        'kid-md': ['28px', { lineHeight: '1.4', fontWeight: '500' }],
        'kid-body': ['20px', { lineHeight: '1.6', fontWeight: '500' }],
        'kid-sm': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'kid-xs': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        'kid-xl': '48px',
        'kid-lg': '40px',
        'kid-md': '24px',
        'kid-sm': '16px',
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        'kid': '0 4px 20px rgba(100, 194, 112, 0.15)',
        'kid-lg': '0 8px 32px rgba(100, 194, 112, 0.2)',
        'kid-btn': '0 4px 16px rgba(100, 194, 112, 0.3)',
      },
      spacing: {
        'kid-xs': '12px',
        'kid-sm': '16px',
        'kid-md': '20px',
        'kid-lg': '24px',
        'kid-xl': '32px',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-x": {
          "0%, 100%": { transform: "translateX(-20px)" },
          "50%": { transform: "translateX(20px)" },
        },
        "pulse-soft": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "slide-out-left": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(-20px)", opacity: "0" },
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(20px)", opacity: "0" },
        },
        "fade-in-scale": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "70%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "float": "float 6s ease-in-out infinite",
        "float-x": "float-x 20s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "slide-in-up": "slide-in-up 0.5s ease-out forwards",
        "bounce-soft": "bounce-soft 1s ease-in-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "slide-out-left": "slide-out-left 0.2s ease-in forwards",
        "slide-out-right": "slide-out-right 0.2s ease-in forwards",
        "fade-in-scale": "fade-in-scale 0.3s ease-out forwards",
        "bounce-in": "bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
      transitionDuration: {
        'kid': '400ms',
        'kid-slow': '600ms',
      },
      transitionTimingFunction: {
        'kid-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'kid-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'kid-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
