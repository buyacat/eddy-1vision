import { defineConfig } from 'astro/config';

// Сайт публікується як buyacat.github.io/eddy-1vision/ (підпапка, не корінь користувача),
// тому base ОБОВ'ЯЗКОВО має бути '/eddy-1vision' — інакше шляхи до CSS/JS/картинок зламаються.
export default defineConfig({
  site: 'https://buyacat.github.io',
  base: '/eddy-1vision',
});
