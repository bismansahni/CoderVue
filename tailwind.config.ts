//
// import type { Config } from "tailwindcss";
//
// const config: Config = {
// 	darkMode: ["class"], // This keeps dark mode based on class usage
// 	content: [
// 		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
// 		"./components/**/*.{js,ts,jsx,tsx,mdx}",
// 		"./app/**/*.{js,ts,jsx,tsx,mdx}",
// 	],
// 	theme: {
// 		extend: {
// 			colors: {
// 				// Light Theme Colors (Gradients and Base Colors)
// 				background: "hsl(var(--background))",
// 				foreground: "hsl(var(--foreground))",
//
// 				// Define light primary colors
// 				primary: {
// 					DEFAULT: "hsl(var(--primary))", // Purple-ish gradient
// 					foreground: "hsl(var(--primary-foreground))", // Light foreground color
// 				},
// 				secondary: {
// 					DEFAULT: "hsl(var(--secondary))", // Greenish
// 					foreground: "hsl(var(--secondary-foreground))", // Lighter green
// 				},
// 				card: {
// 					DEFAULT: "hsl(var(--card))", // Card background
// 					foreground: "hsl(var(--card-foreground))", // Card foreground (text)
// 				},
// 				popover: {
// 					DEFAULT: "hsl(var(--popover))",
// 					foreground: "hsl(var(--popover-foreground))",
// 				},
// 				accent: {
// 					DEFAULT: "hsl(var(--accent))", // Accent color for buttons and highlights
// 					foreground: "hsl(var(--accent-foreground))",
// 				},
// 				border: "hsl(var(--border))", // Border color
// 				input: "hsl(var(--input))", // Input field color
// 				ring: "hsl(var(--ring))", // Ring color for focus states
//
// 				// Chart colors (for visualizations or UI elements)
// 				chart: {
// 					"1": "hsl(var(--chart-1))",
// 					"2": "hsl(var(--chart-2))",
// 					"3": "hsl(var(--chart-3))",
// 					"4": "hsl(var(--chart-4))",
// 					"5": "hsl(var(--chart-5))",
// 				},
// 			},
// 			backgroundImage: {
// 				// Define Gradient Backgrounds
// 				lightGradient: "linear-gradient(135deg, #6C63FF, #1EAE98)", // Light gradient (Purple to Green)
// 				darkGradient: "linear-gradient(135deg, #2C3E50, #34495E)", // Dark gradient (Blue to Dark)
// 			},
// 			// Border radius customization
// 			borderRadius: {
// 				lg: "var(--radius)", // Large rounded corners
// 				md: "calc(var(--radius) - 2px)", // Medium rounded corners
// 				sm: "calc(var(--radius) - 4px)", // Small rounded corners
// 			},
// 		},
// 	},
// 	plugins: [require("tailwindcss-animate")],
// };
//
// export default config;


import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"], // Enables dark mode based on class usage
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))", // Purple gradient
					foreground: "hsl(var(--primary-foreground))", // Light text color
					light: "hsl(var(--primary-light))", // Light shade
					dark: "hsl(var(--primary-dark))", // Darker shade
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))", // Greenish
					foreground: "hsl(var(--secondary-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))", // Accent for highlights
					foreground: "hsl(var(--accent-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",

				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
			},
			backgroundImage: {
				lightGradient: "linear-gradient(135deg, #6C63FF, #1EAE98)",
				darkGradient: "linear-gradient(135deg, #2C3E50, #34495E)",
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;
