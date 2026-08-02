# Publicação na nuvem — Noite DF

## Caminho recomendado: Vercel + Supabase

1. Crie um projeto no Supabase e execute `database/schema.sql` no SQL Editor.
2. Crie um projeto na Vercel importando este repositório.
3. Cadastre as variáveis listadas em `.env.example`.
4. Defina `NEXT_PUBLIC_APP_URL` com o domínio de produção.
5. Faça o primeiro deploy sem credenciais de pagamento e valide o site.
6. Adicione o Access Token do Mercado Pago somente depois de configurar o webhook HTTPS.
7. Cadastre no Mercado Pago: `https://SEU-DOMINIO/api/payments/webhook`.

## Via terminal

```bash
npm install
npm run check
npm i -g vercel
vercel
vercel --prod
```

O comando `vercel` exige autenticação na conta que será proprietária do projeto.

## Checklist obrigatório antes de cobrar

- validar assinatura do webhook;
- consultar o recurso recebido diretamente na API do Mercado Pago;
- persistir eventos de forma idempotente;
- não liberar plano pelo retorno do navegador;
- publicar política de privacidade e termos revisados;
- testar assinatura, cancelamento e falha de cobrança com credenciais de teste;
- configurar domínio, e-mail de suporte e monitoramento.
