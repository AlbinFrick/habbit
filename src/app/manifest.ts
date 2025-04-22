import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Habbits",
		short_name: "Habbits",
		description: "A app for tracking all your habits",
		start_url: "/",
		display: "standalone",
		background_color: "#eff1f5",
		theme_color: "#eff1f5",
		icons: [
			{
				src: "/rabbit.svg",
				sizes: "192x192",
				type: "image/svg",
			},
			{
				src: "/rabbit.svg",
				sizes: "512x512",
				type: "image/svg",
			},
		],
	};
}
