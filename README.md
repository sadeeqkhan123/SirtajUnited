# Sartaj United Trading Company website

Multilingual (English, Dari, Pashto) website for Sartaj United Trading Company, a Kabul supplier of DAP and Urea fertilizer and food commodities.

It is a plain static site with no framework, no build step and no dependencies to install.

## Run it locally

Open `index.html` directly in a browser, or serve the folder (recommended, closer to real hosting):

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Project structure

```
index.html            All page markup (English text lives here)
css/style.css         Design tokens, layout, components, light and dark themes
js/i18n.js            Dari and Pashto translations, JS-built strings, province names
js/globe.js           Real-map hero globe (canvas + d3-geo)
js/app.js             Router, language switching, WhatsApp/email links, quote form, UI
js/vendor/            d3-array and d3-geo (ISC license, see LICENSES.txt)
assets/img/           Logo mark (blue and gradient), full logo (blue and white), favicon
dist/                 The same site as one self-contained HTML file (the published version)
```

## How it works

### Pages and routing

Every page is a `<section class="page" data-page="/path">` inside `<main>` in `index.html`. `app.js` shows one page at a time based on the URL hash:

| Hash | Page |
|---|---|
| `#/` | Home |
| `#/about` | About us |
| `#/products` | Products overview |
| `#/products/dap` | DAP fertilizer |
| `#/products/urea` | Urea fertilizer |
| `#/products/food` | Food items |
| `#/ngos` | For NGOs |
| `#/process` | How we work |
| `#/quote` | Quote form (`#/quote?p=dap` preselects a product) |
| `#/contact` | Contact |

To add a page:

1. Add a new `<section class="page" data-page="/new" data-title="t.new">` in `index.html`.
2. Add `"t.new"` (the browser tab title) to `JSD.en`, `JSD.fa` and `JSD.ps` in `js/i18n.js`.
3. Link to it with `href="#/new"`. Add `data-route-link="/new"` to a nav link so it highlights when active.

### Translations

- English text is written directly in `index.html`. Any element with `data-i18n="key"` is translatable.
- Dari and Pashto versions of each key are in `I18N.fa` and `I18N.ps` in `js/i18n.js`. Values may contain simple HTML such as `<small>`.
- Attributes are translated with `data-i18n-attr="placeholder:key;aria-label:key2"`.
- Strings built in JavaScript (page titles, WhatsApp message text, calendar labels, province names) are in `JSD` and `PROV`.
- The grain directory on the Food items page is data-driven: `GRAINS` in `js/i18n.js` holds each grain's category (`cereal | pulse | oilseed`) with its name and note in all three languages. `app.js` renders, searches and filters it; the search matches names in every language at once. To add a grain, add one object to `GRAINS` (and update the `data-count="18"` stat on the About page).
- When you add a new `data-i18n` key, add it to both `fa` and `ps`, or that text will stay in English.
- The chosen language is saved in `localStorage` (`sutc-lang`). A link can force a language with `?lang=fa` or `?lang=ps`.

### WhatsApp and email links

- Numbers and email address are constants at the top of `js/app.js` (`WA1`, `EMAIL`). The visible numbers and fallback `href`s in `index.html` must be changed too.
- WhatsApp is +93 711 66 66 64 (`WA1="93711666664"`). The office phone lines +93 766 22 20 20 and +93 766 28 28 85 are `tel:` links only.
- `data-wa="generic|dap|urea|food"` on a link makes `app.js` write a prefilled WhatsApp message in the current language. Add `data-num="2"` to use the second line.
- `data-mail="generic|rfq|dap|urea|food"` does the same for email links.
- The floating button in the corner opens a panel with both WhatsApp lines.
- The WhatsApp buttons use a generic chat icon, not WhatsApp's logo.

### Reusable blocks

- `<div data-cta></div>` inserts the blue "Need a quotation" band, from `<template id="tplCta">`.
- `<aside data-quickquote="dap|urea|food"></aside>` inserts the sticky quick-quote card used on product pages, from `<template id="tplQuick">`.

### Hero globe

- World geometry is loaded at runtime from `https://cdn.jsdelivr.net/npm/echarts@4.9.0/map/js/world.js`. A small stub in `<head>` captures the data, and `globe.js` decodes it. echarts itself is not loaded.
- If the CDN is unreachable, the globe still draws the ocean, routes and Kabul, without continents.
- Country borders are intentionally not drawn. Afghanistan is filled gold.
- Supply origins (`ORIG`) and province destinations (`DEST`) are `[longitude, latitude]` arrays near the top of `globe.js`. Colours are set in its `draw()` function.
- Visitors can drag the globe to rotate it. It eases back to Afghanistan after a few seconds.

### Design system

- Light theme only. Colours and shadows are CSS variables on `:root` in `css/style.css`.
- One continuous warm ivory canvas (`--bg:#F2F0EA`) with ink text and warm hairline borders — no dark panels. Brand red `#D2382B` is sampled from the company logo (`--brand`) and is the only accent; the CTA band and the NGO hero panel are the only solid-red blocks (`--panel`).
- Logo files: `assets/img/logo-red.png` (header, about), `assets/img/logo-white.png` (footer), `assets/img/favicon.png` — all generated from the red master logo with a transparent background.
- Fonts are Space Grotesk (headings), Archivo (text), Vazirmatn (Dari) and Noto Sans Arabic (Pashto and the logo name), from Google Fonts.
- The company name from the logo, `شرکة تجارتی سرتاج یونائیٹڈ`, uses the `.motto` class.
- Scroll animations: add `class="rv"` to an element and `style="--i:2"` to stagger it.

## Image credits

Product photos in `assets/img/products/` are free-license images from Wikimedia Commons and the WordPress photo directory. The CC BY-SA ones require the attribution line kept in the footer ("Photos: S. Dwivedi, LHcheM (CC BY-SA), U.S. Army").

| File | Source | License |
|---|---|---|
| `products/dap.jpg`, `catalog/dap.jpg` | "DAP (Diammonium Phosphate) Granules (1)" by Suyash Dwivedi, Wikimedia Commons | CC BY-SA 4.0 |
| `products/urea.jpg`, `catalog/urea.jpg` | "Sample of Urea" by LHcheM, Wikimedia Commons | CC BY-SA 3.0 |
| `products/grain.jpg`, `catalog/wheat.jpg` | Wheat grains close-up, WordPress photo directory (pd.w.org) | CC0 |
| `products/truck.jpg` | "Forward Operation Base Pasab provides fertilizer to Afghans" by Spc. Jason Nolte, U.S. Army, via Wikimedia Commons | Public domain |
| `catalog/rice.jpg` | "Mushqbudji rice grains close-up" by Zahoor Ahmad Reshi, Wikimedia Commons | CC0 |
| `catalog/barley.jpg` | "Barley grains" by 국립국어원 (National Institute of Korean Language), Wikimedia Commons | CC BY-SA 2.0 KR |
| `catalog/maize.jpg` | "Dried corn kernels", rawpixel | CC0 |
| `catalog/millet.jpg` | "Grain millet, early grain fill, Tifton" (USDA), Wikimedia Commons | Public domain |
| `catalog/sorghum.jpg` | "Milo" by C. K. Hartman, Flickr | CC BY 2.0 |
| `catalog/oats.jpg` | "Oat grains" by François Nguyen, Wikimedia Commons | CC BY 2.0 |
| `catalog/rye.jpg` | "LPCC-561-Grans de Secale cereale L." by Miquel Pujol Palol, Wikimedia Commons | CC BY-SA 3.0 |
| `catalog/chickpea.jpg` | "Chickpea" (desi/kabuli comparison), Wikimedia Commons | Public domain |
| `catalog/lentil.jpg` | "Red lentils (1)", Wikimedia Commons | CC0 |
| `catalog/mung.jpg` | "Mung beans" by 維基小霸王, Wikimedia Commons | CC BY-SA 4.0 |
| `catalog/kidney.jpg` | "Dry red kidney beans", rawpixel | CC0 |
| `catalog/pea.jpg` | "Pea protein milk with yellow split peas", Wikimedia Commons | CC0 |
| `catalog/broadbean.jpg` | "Fava Beans Dried", Wikimedia Commons | CC0 |
| `catalog/soybean.jpg` | "Whole Soybeans" by United Soybean Board, Flickr | CC BY 2.0 |
| `catalog/sesame.jpg` | "Toasted sesame seeds 1", Wikimedia Commons | CC0 |
| `catalog/flax.jpg` | "Brown Flax Seeds" by Sanjay Acharya, Wikimedia Commons | CC BY-SA 3.0 |
| `catalog/sunflower.jpg` | "Guazi (sunflower seeds)", Wikimedia Commons | CC0 |
| `catalog/flour.jpg` | "Close flour baking image", rawpixel | CC0 |
| `catalog/oil.jpg` | "Sunflower oil" by Tiia Monto, Wikimedia Commons | CC BY-SA 4.0 |
| `catalog/sugar.jpg` | "White sugar background", rawpixel | CC0 |
| `catalog/salt.jpg` | "Salt-crystals", Wikimedia Commons | CC0 |

## Deploy

Upload the folder to any static host: Netlify, Vercel, Cloudflare Pages, GitHub Pages or ordinary cPanel hosting. `index.html` is the entry point. Alternatively, `dist/sartaj-united-website.html` works on its own as a single file.

## Before going live

Please confirm these, because the page copy states them:

- [ ] Samples before award, and independent lab testing on request
- [ ] Donor or program marking on bags
- [ ] Payment by bank transfer against invoice
- [ ] Delivery quoted to any province, including remote districts
- [ ] Signing NGO supplier codes of conduct and conflict of interest declarations
- [ ] Typical specifications (for example DAP moisture 2.0% max, Urea biuret 1.0% max)
- [ ] Import entry points and the season calendar on "How we work"
- [ ] English address: Gulbahar Market, Chindawol, District 1, Kabul
- [ ] Native-speaker proofreading of all Dari and Pashto text

## Ideas for next steps

- Search engines mostly see hash-routed pages as a single page. For better SEO, split each page into its own HTML file (for example `about.html`, `products/dap.html`) and share the header and footer with a small static site generator such as Eleventy or Astro.
- Add real photos of stock, warehouses or deliveries.
- Add the business license number and tax ID once you decide to publish them.
