/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,jsx}",
		"./components/**/*.{js,jsx}",
		"./app/**/*.{js,jsx}",
		"./src/**/*.{js,jsx}",
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
				// Professional 3-Layer Design System
				'layer-background': '#FFE4A1', // Warm yellow background
				'layer-surface': '#FFFFFF',    // White cards/containers
				'layer-content': '#1F2937',    // Dark text content
				'layer-muted': '#6B7280',      // Secondary text
				'layer-border': '#E5E7EB',     // Subtle borders
				'accent-ducky': '#FFD43B',     // Duck yellow (minimal use)
				
				// Shadcn colors (keeping compatibility)
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
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
				chat: {
					user: 'hsl(var(--chat-user))',
					'user-foreground': 'hsl(var(--chat-user-foreground))',
					assistant: 'hsl(var(--chat-assistant))',
					'assistant-foreground': 'hsl(var(--chat-assistant-foreground))'
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
			fontFamily: {
				'pretendard': ['PretendardVariable', 'Pretendard', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				'title': ['20px', { lineHeight: '1.4', fontWeight: '700' }], // Duck messages
				'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],   // User input/general text  
				'caption': ['14px', { lineHeight: '1.4', fontWeight: '500' }], // Secondary info
			},
			spacing: {
				'4.5': '18px', // 18px for 8px grid system
				'18': '72px',  // 72px
				'22': '88px',  // 88px
			},
			boxShadow: {
				'surface': '0 6px 24px rgba(0, 0, 0, 0.06)',
				'glow': '0 0 24px rgba(255, 212, 59, 0.15)',
			},
			borderRadius: {
				'surface': '12px',
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}
