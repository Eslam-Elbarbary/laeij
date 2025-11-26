/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
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

