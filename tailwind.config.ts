import type { Config } from "tailwindcss";

const flattenColorPalette = (obj: Record<string, any>) => {
  const flattened: Record<string, string> = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (typeof val === 'string') {
      flattened[key] = val;
    } else {
      Object.entries(val as Record<string, string>).forEach(([childKey, childVal]) => {
        if (childKey === 'DEFAULT') {
          flattened[key] = childVal;
        } else {
          flattened[`${key}-${childKey}`] = childVal;
        }
      });
    }
  });
  return flattened;
};

const addVariablesForColors = ({ addBase, theme }: any) => {
  let allColors = flattenColorPalette(theme('colors'));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ':root': newVars,
  });
};

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				// Updated Health-focused teal palette
				healthBlue: {
					950: '#0f1423', // Very dark navy
					900: '#1e2846', // Deep navy blue
					700: '#0d9ddb', // Teal blue
					500: '#16c2a3', // Mint green
					200: '#e6f7ff', // Very light teal
				},
				// Add health status colors
				healthStatus: {
					normal: 'hsl(var(--health-normal))',
					caution: 'hsl(var(--health-caution))',
					warning: 'hsl(var(--health-warning))',
					alert: 'hsl(var(--health-alert))',
				},
				health: {
					50: '#f5fafd',
					100: '#eaf6fc',
					200: '#d0ebf7',
					300: '#a5d8ef',
					400: '#60b6e0',
					500: '#3498db',
					600: '#1d7ab8',
					700: '#1a6396',
					800: '#1a557d',
					900: '#1a4768',
					950: '#0f2d45',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'text-shimmer': {
					'0%': {
						backgroundPosition: '0% 50%',
					},
					'100%': {
						backgroundPosition: '100% 50%',
					},
				},
				levitate: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' },
				},
				'scale-in': {
					'0%': { transform: 'scale(0.9)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					'0%': { transform: 'scale(1.1)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'blur-in': {
					'0%': { filter: 'blur(5px)', opacity: '0' },
					'100%': { filter: 'blur(0)', opacity: '1' }
				},
				aurora: {
					from: {
						backgroundPosition: '50% 50%, 50% 50%',
					},
					to: {
						backgroundPosition: '350% 50%, 350% 50%',
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-in-out forwards',
				'fade-out': 'fade-out 0.5s ease-in-out forwards',
				'slide-up': 'slide-up 0.5s ease-out forwards',
				'slide-down': 'slide-down 0.5s ease-out forwards',
				'text-shimmer': 'text-shimmer 2s ease-in-out infinite alternate',
				'levitate': 'levitate 5s ease-in-out infinite',
				'pulse-subtle': 'pulse-subtle 4s ease-in-out infinite',
				'scale-in': 'scale-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'scale-out': 'scale-out 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'blur-in': 'blur-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'aurora': 'aurora 60s linear infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate"), addVariablesForColors],
} satisfies Config;
