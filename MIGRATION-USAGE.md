# Guia: Usar o Script de Migração

## Como Migrar os 50 Estabelecimentos para Supabase

### Pré-requisitos
- [ ] Projeto Supabase criado
- [ ] Schema SQL executado: `database/schema.sql`
- [ ] Variáveis de ambiente configuradas

### Configurar Environment

1. Obtenha as credenciais do Supabase:
   - URL: Settings → API → Project URL
   - Service Role Key: Settings → API → Service Role (secret)

2. Crie ou atualize `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key_aqui
   ```

3. Teste a conectividade:
   ```bash
   node -e "
   const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
   const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
   if (url && key) console.log('✓ Credenciais configuradas');
   else console.log('✗ Faltam credenciais');
   "
   ```

### Executar Migração

```bash
# Opção 1: Usar tsx (recomendado)
npx tsx scripts/migrate-places-to-supabase.ts

# Opção 2: Compilar e rodar com Node
npm run build
node .next/server/scripts/migrate-places-to-supabase.js
```

### Acompanhar Progresso

Você verá output como:
```
🚀 Starting migration to Supabase...

Current establishments in Supabase: 0

Migrating 50 establishments...

✓ Inserted: Five Sport Bar
✓ Inserted: Macaco Velho Chopp Bar
✓ Inserted: Pipa Drinks Águas Claras
...
Progress: 10/50

Progress: 20/50

Progress: 30/50

Progress: 40/50

Progress: 50/50

✅ Migration complete! Final count: 50 establishments

Verify with: SELECT COUNT(*) FROM establishments;
```

### Validar Resultado

#### No Supabase Console

1. Abra o SQL Editor
2. Execute:
   ```sql
   SELECT COUNT(*) as total FROM establishments;
   ```
   Deve retornar: `50`

3. Verifique alguns registros:
   ```sql
   SELECT id, name, region, type FROM establishments LIMIT 5;
   ```

4. Verifique as tags:
   ```sql
   SELECT COUNT(DISTINCT establishment_id) as est_com_tags 
   FROM establishment_tags;
   ```

#### Localmente (em Desenvolvimento)

Se `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão configurados:

```typescript
// Em qualquer arquivo com acesso ao repositório
import { getEstablishmentRepository } from '@/infrastructure/repositories';

const repo = getEstablishmentRepository();
const all = await repo.listAll();
console.log(`Total: ${all.length}`); // Deve ser 50
```

### Troubleshooting

#### "Missing Supabase configuration"
```bash
# Verificar variáveis
echo "URL: $NEXT_PUBLIC_SUPABASE_URL"
echo "Key: $SUPABASE_SERVICE_ROLE_KEY"

# Se vazias, configurar:
export NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key
```

#### "Failed to insert: 409 - Duplicate key"
- A tabela já tem dados
- Limpe com: `DELETE FROM establishments WHERE true;`
- Depois execute novamente

#### "Failed to insert: 403 - Permission denied"
- A chave não é `Service Role`
- Use Settings → API → Service Role (secret), não a `anon` key

#### "Connection refused"
- URL está incorreta
- Remova trailing slash: `https://seu-projeto.supabase.co` (não `.../`)

### Reverter Migração

Se precisar recomeçar:

```sql
-- Limpar dados
DELETE FROM establishment_tags WHERE true;
DELETE FROM establishments WHERE true;

-- Resetar sequências (se houver)
ALTER SEQUENCE establishments_id_seq RESTART WITH 1;
```

Depois execute o script novamente.

---

## Próximas Etapas

Após a migração bem-sucedida:

1. **Teste em staging**:
   ```bash
   npm run dev
   # Acesse http://localhost:3000
   # Verifique se estabelecimentos carregam
   ```

2. **Deploy para produção**:
   ```bash
   git add .
   git commit -m "chore: migrate 50 establishments to Supabase"
   git push
   ```

3. **Monitorar em produção**:
   - Verifique logs do Vercel
   - Teste GET `/api/establishments` na API
   - Teste `/lugares/[region]` na home

---

## Performance

- **Tempo esperado**: ~2-5 segundos para 50 estabelecimentos
- **Largura de banda**: ~500KB total
- **Limite de Supabase**: Verificar quotas do plano

---

## Segurança

⚠️ **Importante**:
- Use `SUPABASE_SERVICE_ROLE_KEY` apenas em ambiente seguro
- Nunca committe `.env` com secrets no Git
- Configure `.env.local` localmente ou via Vercel Secrets

---

## Resumo

```bash
# 3 passos para migrar:
1. Configurar env
2. Rodar: npx tsx scripts/migrate-places-to-supabase.ts
3. Validar: SELECT count(*) FROM establishments;
```

**Fim!** 🎉
