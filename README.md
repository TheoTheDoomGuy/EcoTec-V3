# EcoTec Heating & Solar — Website v2

Static site (no build step). Open `index.html` in a browser, or serve the folder:

```bash
cd v2
python3 -m http.server 8000
```

## Structure
- `index.html` — single-page site: hero, services, heat pumps, solar & battery, EV charging, air con, thermal imaging & wall insulation, about, contact (common questions sit inside each service section)
- `styles.css` — all styles (colour tokens at the top)
- `script.js` — mobile menu, active nav, quote form
- `img/` — web-optimised images (WebP, 800px + 1600px) made from `../assets`, plus `logo-mark.svg`

## Notes
- The quote form emails enquiries to info.greenecotec@gmail.com through FormSubmit (formsubmit.co, free, no account). It only works from the live site, not from a local file. The first enquiry sent from the live site triggers a one-off "Activate Form" email to that inbox; click it, then send a second test enquiry to confirm delivery. If FormSubmit can't be reached, the form falls back to opening the visitor's email app. To change the address, edit `ENQUIRY_EMAIL` in `script.js` and the form `action` in `index.html`, then activate again.
- Hosting: deploy the `v2/` folder as-is to any static host (Netlify, Vercel, GitHub Pages, Render static site).
