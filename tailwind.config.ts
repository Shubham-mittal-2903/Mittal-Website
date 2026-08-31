import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			ink: '#0B0B0D',
  			charcoal: '#151518',
  			graphite: '#232328',
  			cream: '#151518',
  			soft: '#232328',
  			silver: '#C8C8CE',
  			ivory: '#E8E8EC',
  			electric: '#C9CDD6',
  			violet: '#9AA0AE',
  			gold: '#D6D8DE',
  			champagne: '#E8E8EC',
  			rosegold: '#B8BCC6',
  			bronze: '#9AA0AE',
  			background: 'hsl(var(--background) / <alpha-value>)',
  			foreground: 'hsl(var(--foreground) / <alpha-value>)',
  			card: {
  				DEFAULT: 'hsl(var(--card) / <alpha-value>)',
  				foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
  				foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
  				foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
  				foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
  				foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
  				foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
  				foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
  			},
  			border: 'hsl(var(--border) / <alpha-value>)',
  			input: 'hsl(var(--input) / <alpha-value>)',
  			ring: 'hsl(var(--ring) / <alpha-value>)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-sans)',
  				'system-ui',
  				'sans-serif'
  			],
  			display: [
  				'var(--font-display)',
  				'system-ui',
  				'sans-serif'
  			],
  			// Dashboard-only (/leads) — see app/layout.tsx
  			'leads-display': [
  				'var(--font-leads-display)',
  				'system-ui',
  				'sans-serif'
  			],
  			'leads-mono': [
  				'var(--font-leads-mono)',
  				'ui-monospace',
  				'monospace'
  			],
  			mono: [
  				'var(--font-mono, ui-monospace)',
  				'ui-monospace',
  				'monospace'
  			]
  		},
  		backgroundImage: {
  			'accent-gradient': 'linear-gradient(120deg, #FFFFFF 0%, #C8C8CE 50%, #8E8E96 100%)',
  			'accent-soft': 'linear-gradient(120deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.035) 100%)'
  		},
  		keyframes: {
  			'gradient-pan': {
  				'0%, 100%': {
  					backgroundPosition: '0% 50%'
  				},
  				'50%': {
  					backgroundPosition: '100% 50%'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-14px)'
  				}
  			},
  			'spin-slow': {
  				to: {
  					transform: 'rotate(360deg)'
  				}
  			},
  			marquee: {
  				from: {
  					transform: 'translateX(0)'
  				},
  				to: {
  					transform: 'translateX(-50%)'
  				}
  			}
  		},
  		animation: {
  			'gradient-pan': 'gradient-pan 6s ease infinite',
  			float: 'float 6s ease-in-out infinite',
  			'spin-slow': 'spin-slow 18s linear infinite',
  			marquee: 'marquee 30s linear infinite'
  		},
  		borderRadius: {
  			// Falls back to Tailwind's own default lg/md/sm scale outside [data-leads-theme],
  			// where --radius is undefined — existing marketing components rely on those defaults.
  			lg: 'var(--radius, 0.5rem)',
  			md: 'calc(var(--radius, 0.5rem) - 0.125rem)',
  			sm: 'calc(var(--radius, 0.5rem) - 0.375rem)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
