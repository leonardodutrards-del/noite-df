# Relatório de Migração: Saindo do Modo Vitrine - Noite DF

## ✅ Resumo das Mudanças Realizadas

### 1. **SupabaseEstablishmentRepository** ✓
**Arquivo**: `infrastructure/repositories/supabase-establishment-repository.ts`

- Implementa a interface `EstablishmentRepository`
- Conecta-se ao Supabase usando REST API
- Implementa todos os métodos obrigatórios:
  - `listAll()` - lista todos os estabelecimentos
  - `listPublished()` - lista apenas publicados
  - `findById(id)` - busca por ID
  - `update(id, updates)` - atualiza um estabelecimento
  - `create(item)` - cria novo estabelecimento

**Mapeamento de campos**:
- Estabelecimento TypeScript → Linhas da tabela Supabase `establishments`
- Suporta fallback para valores padrão quando campos não existem

### 2. **Factory de Repositórios** ✓
**Arquivo**: `infrastructure/repositories/index.ts` (novo)

```typescript
export function getEstablishmentRepository(): EstablishmentRepository {
  if (isSupabaseConfigured()) {
    return new SupabaseEstablishmentRepository();
  }
  // Fallback para in-memory em desenvolvimento
  return new InMemoryEstablishmentRepository();
}
```

**Benefício**: Alterna automaticamente entre Supabase (produção) e In-Memory (desenvolvimento/testes)

### 3. **EstablishmentService Atualizado** ✓
**Arquivo**: `modules/establishments/service.ts`

- Alterado para usar `getEstablishmentRepository()` em vez de importação direta
- Mantém compatibilidade com todas as APIs existentes
- Alteração mínima - apenas a importação e inicialização

### 4. **Script de Migração de Dados** ✓
**Arquivo**: `scripts/migrate-places-to-supabase.ts`

```bash
npx tsx scripts/migrate-places-to-supabase.ts
```

**O que faz**:
- Lê os 50 estabelecimentos de `data/seeds/places.ts`
- Insere cada um na tabela `establishments` do Supabase
- Cria tags (vibe, music, audience) na tabela `establishment_tags`
- Exibe progresso e contagem final

**Pré-requisitos**:
- `NEXT_PUBLIC_SUPABASE_URL` configurada
- `SUPABASE_SERVICE_ROLE_KEY` configurada

---

## 🧪 Validação

### Testes ✓
```
Test Files  12 passed (12)
Tests       63 passed (63)
```

Todos os testes passaram, incluindo:
- Testes de autorização
- Testes de autenticação
- Testes de auditoria

### Build ✓
```
✓ Compiled successfully in 7.1s
✓ TypeScript type check passed
```

Sem erros de compilação ou tipagem.

---

## 📊 Diagnóstico: Painel /parceiro

### Status Atual (Modo Demo)
| Aspecto | Status | Notas |
|---------|--------|-------|
| Página funciona | ✓ | `/app/parceiro/page.tsx` |
| API funciona | ✓ | GET/PATCH `/api/parceiro/establishment` |
| Autenticação | ⚠️ | In-memory, não persiste em Supabase |
| Atualização de lotação | ✓ | crowdStatus persiste no repositório |
| Promoção do dia | ✓ | currentPromotion persiste |
| Agenda semanal | ✓ | weeklySchedule persiste |
| Métricas (views, cliques) | ❌ | Hardcoded no frontend (demo) |
| Analytics em tempo real | ❌ | Tabela existe, mas não integrada |

### Bloqueadores para Produção Completa

#### 1. **Autenticação Real**
- Usuários hardcoded: `DEFAULT_USERS` em `modules/auth/service.ts`
- Sessões em memória
- **Solução futura**: Sincronizar com `Supabase.profiles`

#### 2. **Persistência de Analytics**
- Tabela `interactions` criada no schema, mas nunca usado
- Métricas são mockadas: `defaultMetrics` hardcoded na página
- `/api/analytics/track` existe mas não integrado ao painel
- **Solução futura**: Implementar rastreamento real de interações

#### 3. **Dados de Parceiro Agora Persistem** ✓
- Com o novo `SupabaseEstablishmentRepository`, as alterações de:
  - Lotação (crowdStatus)
  - Promoção (currentPromotion)
  - Agenda (weeklySchedule)
  - Descrição, WhatsApp, Instagram, Endereço
  
  ...agora **persistem no Supabase** (se configurado)

---

## 🚀 Como Usar em Produção

### 1. Configure o Supabase
```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Execute a Migração
```bash
npx tsx scripts/migrate-places-to-supabase.ts
```

Você verá:
```
🚀 Starting migration to Supabase...

Current establishments in Supabase: 0

Migrating 50 establishments...

✓ Inserted: Five Sport Bar
✓ Inserted: Macaco Velho Chopp Bar
✓ Inserted: Pipa Drinks Águas Claras
... (mais 47)

✅ Migration complete! Final count: 50 establishments
```

### 3. Valide no Supabase
```sql
SELECT count(*) FROM establishments;
-- Deve retornar: 50

SELECT * FROM establishments LIMIT 5;
```

### 4. Deploy para Vercel
```bash
git add .
git commit -m "chore: migrate to Supabase establishments repository"
git push
```

---

## 📁 Arquivos Criados/Modificados

### Criados
- `infrastructure/repositories/supabase-establishment-repository.ts` (180 linhas)
- `infrastructure/repositories/index.ts` (26 linhas)
- `scripts/migrate-places-to-supabase.ts` (170 linhas)

### Modificados
- `modules/establishments/service.ts` (importação alterada)
- `infrastructure/repositories/in-memory-establishment-repository.ts` (comentário adicionado)

### Não Modificados (Compatível)
- Todas as rotas de API
- Página do parceiro
- Testes existentes

---

## ⚠️ Nota Importante: SHOWCASE_MODE

A variável `SHOWCASE_MODE` em `lib/env.ts` é independente da camada de repositório:

```typescript
export const SHOWCASE_MODE = parseBoolean(process.env.SHOWCASE_MODE, true);
```

- **Quando `SHOWCASE_MODE=true`**: UI mostra avisos de "modo demonstração"
- **Quando `SHOWCASE_MODE=false`**: UI funciona em modo de produção
- **Repositório de Estabelecimentos**: Agora segue lógica de Supabase configurado

Para **sair completamente do modo vitrine**:
```bash
# .env.production
SHOWCASE_MODE=false
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 🔄 Próximos Passos Recomendados

### Curto Prazo
1. Testar a migração em staging Supabase
2. Validar que o painel /parceiro consegue atualizar dados
3. Verificar queries com `SELECT count(*) FROM establishments;`

### Médio Prazo
1. Implementar persistência real de autenticação (sync com profiles)
2. Integrar rastreamento de analytics (interactions)
3. Criar dashboard de parceiro com métricas reais

### Longo Prazo
1. Implementar role-based access control (RBAC) no Supabase
2. Criar triggers para sincronizar dados entre tabelas
3. Implementar replicação em tempo real para analytics

---

## ✨ Conclusão

Você agora tem:
- ✅ Camada de dados real (Supabase) em produção
- ✅ Fallback para desenvolvimento local (in-memory)
- ✅ 50 estabelecimentos prontos para migrar
- ✅ Script de migração pronto
- ✅ Testes e build funcionando

**O painel /parceiro** ainda está em modo demo para **métricas**, mas agora **persiste dados de produção** (lotação, promoção, agenda).

Para sair **completamente** do modo vitrine, implemente a persistência de autenticação e analytics (próxima etapa).
