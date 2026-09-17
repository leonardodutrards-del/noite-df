# Inclusão de estabelecimentos — 16/09/2026

Seis inclusões no catálogo estático, mantendo os 50 registros anteriores.
Nenhuma migração ou escrita em Supabase foi executada.

| Local | Região | Fonte de identidade e endereço |
| --- | --- | --- |
| Meatz Burger | Sudoeste | https://deliverydireto.com.br/meatzburger/sudoeste/pages/sobre-nos |
| Figueiredo Cozinha e Bar | Planaltina DF | https://linktr.ee/figueiredocozinhaebar |
| Xique Xique | Asa Norte | https://www.restaurantexiquexique.com.br/ |
| Xique Xique | Asa Sul | https://www.restaurantexiquexique.com.br/ |
| Alfredo’s Pizzaria | Asa Norte | https://www.alfredospizzaria.com.br/ |
| Alfredo’s Pizzaria | Asa Sul | https://www.alfredospizzaria.com.br/ |

As unidades da mesma marca são distintas por região e endereço. Figueiredo
Valparaíso já existia e foi preservado. Alfredo’s Asa Sul fica dentro do Infinu,
mas é uma operação identificada separadamente pelo site da pizzaria.

Preço tornou-se opcional no tipo TypeScript; a interface já oculta valores ausentes.
Não foram inferidos preços, avaliações, músicas, lotação ou vínculo de parceria.
Os horários do Xique Xique são os publicados pelo site consultado; não representam
confirmação em tempo real. Meatz confirma entrega e retirada, não atendimento no salão.
Links de mapa continuam sendo buscas com nome e endereço, conforme a implementação
existente; não são fichas do Google Maps verificadas. Fotos não foram copiadas.

Comparação de duplicatas limitada ao catálogo versionado. Não houve acesso à base
privada de parceiros. Não se trata de importação de banco do Google ou do ChatGPT.
