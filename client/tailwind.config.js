/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Premium fast-paced business feel (Slate/Indigo/Rose)
                primary: {
                    DEFAULT: '#4F46E5', // Indigo 600
                    foreground: '#FFFFFF',
                },
                secondary: {
                    DEFAULT: '#F1F5F9', // Slate 100
                    foreground: '#0F172A', // Slate 900
                },
                accent: {
                    DEFAULT: '#E11D48', // Rose 600
                    foreground: '#FFFFFF',
                },
                background: '#F8FAFC', // Slate 50
                surface: '#FFFFFF',
                muted: '#64748B', // Slate 500
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}

