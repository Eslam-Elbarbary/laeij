/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontSize: {
                // Fluid typography using clamp() - safe for Tailwind REM scaling
                'fluid-xs': 'clamp(0.75rem, 0.5vw + 0.5rem, 0.875rem)',
                'fluid-sm': 'clamp(0.875rem, 0.5vw + 0.625rem, 1rem)',
                'fluid-base': 'clamp(1rem, 0.5vw + 0.75rem, 1.125rem)',
                'fluid-lg': 'clamp(1.125rem, 1vw + 0.75rem, 1.375rem)',
                'fluid-xl': 'clamp(1.25rem, 1.5vw + 0.75rem, 1.75rem)',
                'fluid-2xl': 'clamp(1.5rem, 2vw + 1rem, 2.25rem)',
                'fluid-3xl': 'clamp(1.875rem, 3vw + 1.25rem, 3rem)',
                'fluid-4xl': 'clamp(2.25rem, 4vw + 1.5rem, 3.75rem)',
                'fluid-5xl': 'clamp(3rem, 5vw + 2rem, 4.5rem)',
                'fluid-6xl': 'clamp(3.75rem, 6vw + 2.5rem, 5.5rem)',
                'fluid-7xl': 'clamp(4.5rem, 8vw + 3rem, 7rem)',
            },
            fontFamily: {
                'arabic': ['Cairo', 'Tajawal', 'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
                'cairo': ['Cairo', 'sans-serif'],
                'tajawal': ['Tajawal', 'sans-serif'],
            },
            colors: {
                luxury: {
                    gold: '#a9a084',
                    'gold-light': '#E5C158',
                    'gold-dark': '#A68A47',
                    'cream': '#F5F1ED',
                    'cream-light': '#F5F1ED',
                    'cream-dark': '#E8DCC8',
                    'brown-dark': '#231F1F',
                    'brown-darker': '#0F0B08',
                    'brown-text': '#1A1410',
                    'brown-light': '#D1CCC6',
                },
            },
            keyframes: {
                'shimmer-gold': {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' }
                },
                'pulse-gold': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '1' }
                },
                'pulse-slow': {
                    '0%, 100%': { opacity: '0.3' },
                    '50%': { opacity: '0.5' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                'slide-in-right': {
                    'from': { opacity: '0', transform: 'translateX(20px)' },
                    'to': { opacity: '1', transform: 'translateX(0)' }
                }
            },
            animation: {
                'shimmer-gold': 'shimmer-gold 2s infinite',
                'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
                'slide-in-right': 'slide-in-right 0.3s ease-out'
            }
        },
    },
    plugins: [],
}

