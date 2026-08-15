# Estratégia de Expansão da Base de Estabelecimentos — Noite DF

Este documento estabelece as diretrizes para o crescimento ordenado e a manutenção da qualidade e veracidade dos dados do **Noite DF**, garantindo uma experiência confiável, sem dados fictícios ou placeholders.

---

## 1. Metas Graduais de Cobertura

* **Etapa Inicial (Foco Atual):** 300 a 500 estabelecimentos com cadastro completo e verificado manualmente ou via parcerias diretas.
* **Segunda Etapa (Escala Regional):** 1.000 ou mais estabelecimentos com integração a painéis de parceiros e verificação automatizada periódica.

---

## 2. Cobertura Geográfica Equilibrada

A curadoria do Noite DF não se limita ao Plano Piloto. A base deve manter distribuição proporcional em todas as Regiões Administrativas e Entorno:

1. **Plano Piloto:** Asa Norte, Asa Sul, Setor Comercial, Vila Planalto, Setor de Clubes, Granja do Torto, Noroeste, Sudoeste.
2. **Eixo Oeste / Sul:** Ceilândia, Taguatinga, Samambaia, Águas Claras, Guará, Vicente Pires, Riacho Fundo, Núcleo Bandeirante, Gama, Santa Maria.
3. **Eixo Norte / Leste:** Sobradinho I e II, Planaltina, Paranoá, Itapoã, São Sebastião, Jardim Botânico, Lago Norte e Lago Sul.
4. **Entorno do DF:** Valparaíso de Goiás, Cidade Ocidental, Luziânia / Jardim Ingá, Planaltina de Goiás (Brasilinha), Santo Antônio do Descoberto, Águas Lindas.

---

## 3. Critérios de Verificação e Deduplicação

Para evitar cadastros duplicados e inconsistências cadastrais:

* **Nome Normalizado:** Remoção de acentuação, pontuação e sufixos repetitivos para comparação estrita de unicidade.
* **Endereço e Coordenadas:** Validação de logradouro, número, setor/quadra e geolocalização exata no Google Maps.
* **Links Oficiais:** Presença obrigatória de link oficial verificado (Instagram oficial ativo, Google Maps Business, WhatsApp comercial ou website).
* **Sem Placeholders:** Nenhum registro é promovido a público sem atributos básicos reais (nome, região, tipo, descrição concisa e link de rota).

---

## 4. Revisão Periódica e Ciclo de Atualização

* **Data de Última Verificação (`lastUpdated` / `verifiedAt`):** Todo estabelecimento exibe a data de sua última checagem.
* **Ciclo de Revalidação:**
  * Estabelecimentos parceiros (gerenciados): revalidação semanal via painel ou webhook.
  * Estabelecimentos da curadoria geral: checagem periódica a cada 30 a 60 dias (links ativos, funcionamento e programação).
  * Estabelecimentos com dados inconsistentes ou fechados são suspensos imediatamente (`publicationStatus: 'suspended'`).

---

## 5. Flywheel de Crescimento e Parcerias

1. **Curadoria Inicial Confiável:** Usuários encontram informações verdadeiras e usam rotas/links.
2. **Tráfego Qualificado:** Estabelecimentos recebem cliques para mapa, Instagram e WhatsApp.
3. **Conversão para Parceiro:** Donos de estabelecimentos assumem seus perfis através dos planos do Noite DF para atualizar eventos, promoções e horários em tempo real.
4. **Ciclo Positivo de Dados:** Mais estabelecimentos parceiros geram atualizações mais frequentes, dispensando intervenção manual e eliminando defasagens.
