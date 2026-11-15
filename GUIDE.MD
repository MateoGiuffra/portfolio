para produccion:
pnpm run build:gh
pnpm run deploy

para local:
pnpm run build:relative
pnpm dlx http-server ./dist -p 5000
# abrir http://localhost:5000