-- Use the canonical host to avoid the connector rejecting the apex-to-www redirect.
UPDATE public.data_sources
SET url = 'https://www.quintaldatiasandra.com.br/'
WHERE entity_type = 'establishment'
  AND entity_id = 'quintal-tia-sandra'
  AND source_kind = 'official'
  AND url = 'https://quintaldatiasandra.com.br/';
