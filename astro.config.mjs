import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import compress from "astro-compress";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://docs.vigilguard.com",
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    icon({
      include: {
        lucide: ["*"],
      },
    }),
    sitemap(),
    compress({
      html: true,
      css: true,
      js: true,
      img: true,
      svg: true,
    }),
  ],
});
