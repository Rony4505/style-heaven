# Style Heaven

Luxury silk e-commerce boutique for [Rony4505/style-heaven](https://github.com/Rony4505/style-heaven).

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

Admin: `admin@styleheaven.com` / `admin123`

## Railway

Live: [https://style-heaven-production.up.railway.app](https://style-heaven-production.up.railway.app)

Project `capable-integrity`, service `style-heaven`. This repo includes a `Dockerfile` and `Caddyfile` so Railway can build the Vite app and serve it as a static site (React Router fallback included).

The service is connected to GitHub branch `cursor/style-heaven-ecommerce-e958` until that work is on `main`. After merge, switch the Railway source branch to `main`.
