import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import compress from "astro-compress";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://docs.vigilguard.com",
  output: 'static',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
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