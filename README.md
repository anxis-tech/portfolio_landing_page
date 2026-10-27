This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Capturas dos projetos

Use Node.js 22.18+ (carregamento nativo de TypeScript) e Google Chrome instalado.
Os projetos e URLs são lidos de `src/data/portfolio.ts`.

```bash
npm run capture
# Recapturar apenas um projeto:
npm run capture -- riosmed
# Verificar carregamento tardio, fundo com parênteses na URL e rodapé longo:
npm run test:capture
```

A captura percorre a página até estabilizar a altura e aguarda fontes, imagens e
fundos. Falhas preservam as imagens anteriores e geram um erro no relatório.
A página completa é redimensionada sem cortes; versões menores alimentam os
cards com rolagem no hover. O modal carrega a versão maior sob demanda.

Os JPGs simplificados da primeira tela e o relatório `projects.json` ficam em
`exports/99freelas/` (fora do Git e do conteúdo público do site). As descrições
breves, sem links, ficam em `scripts/marketplace-descriptions.json`.

## Verificação do pop-up dos projetos

Com o build de produção rodando (`npm run start -- --port 3100`), execute
`npm run test:modal`. Use `PORTFOLIO_URL` para apontar para outro servidor.
O teste cobre prévia imediata, imagem completa atrasada, erro de rede, reabertura,
mobile, grid, categorias e carrossel.
