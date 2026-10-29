# 🌮 Spicy Pete's Tacos

A live, zero-build website template for **Spicy Pete's Tacos** – a taco bar run by Pete, a 3D animated taco monster with googly eyes, chili-pepper horns and a big heart.

## Features

- **3D animated mascot (Pete the Taco Monster)** – built with [Three.js](https://threejs.org/) (loaded from the jsDelivr CDN). He bobs, blinks, follows your cursor with his eyes, waves, and jumps/spins while spouting wisdom when you click (or press Enter on) him. Falls back to an animated emoji if WebGL or the CDN is unavailable.
- **Taco-Meter™** – playful counters (tacos served, hungry humans online, salsa smiles, napkins used), a "Fresh Off the Grill" order feed and a kitchen spice meter. Stats are simulated client-side from the time of day; swap in a real API/websocket in `js/main.js` when you have one.
- **Taco Patrol arcade game** – a Galaga-inspired game where players steer Pete's taco ship and fire salsa at pepper pods. Use the arrow keys or A/D to move, Space to fire, and the touch controls on smaller screens.
- **Complete (fake) menu** – Tacos, Monster Specials, Sides & Salsas, Drinks and Desserts with prices, spice levels, vegetarian tags and Pete's Picks. Edit it in `js/menu.js`.
- **Taco-bar theme** – papel picado banner, warm chili/cheese palette, `Bangers` + `Lilita One` + `Nunito` fonts from Google Fonts.
- **Lighthearted, family-friendly copy** – rotating taglines, a scrolling marquee, FAQ, clearly labeled fictional fan notes, and a "Make It Rain Tacos" button (or type `taco` anywhere on the page).
- Responsive, keyboard accessible and respects `prefers-reduced-motion`. Shows open/closed status based on the listed hours.

## Project structure

```
index.html        # page markup & content
css/styles.css    # theme, layout, animations
js/menu.js        # menu data (edit me!)
js/main.js        # menu rendering, live counters, open status, taco rain
js/taco-game.js   # keyboard and touch-controlled taco arcade game
js/mascot.js      # Pete, the Three.js taco monster
```

## Run locally

It's a static site – serve the folder with any static file server (ES modules don't load over `file://`):

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then open <http://localhost:8000>.

## Deploy

Push to GitHub and enable **Settings → Pages → Deploy from a branch** (root of `main`). Netlify, Vercel or any static host works too.
