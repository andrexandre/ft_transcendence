import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	plugins: [
		tailwindcss(),
	],
	server: {
		// host: "0.0.0.0",
		host: "127.0.0.1",
		port: 5500,
		// open: "http://127.0.0.1:5500/"
	},
})
