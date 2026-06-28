// Повертає правильний шлях до файлу в public/ з урахуванням astro.config.mjs -> base.
// Потрібно, бо сайт публікується в підпапці (buyacat.github.io/eddy-1vision/),
// а не в корені домену. Без цього /assets/... вело б на buyacat.github.io/assets/...
// (тобто на 404), а не на .../eddy-1vision/assets/...
//
// Використання: asset('assets/photo.jpg')  або  asset('app.js')
export function asset(path) {
  const base = import.meta.env.BASE_URL; // напр. "/eddy-1vision/" (зі слешем на кінці)
  const cleanBase = base.endsWith('/') ? base : base + '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return cleanBase + cleanPath;
}
