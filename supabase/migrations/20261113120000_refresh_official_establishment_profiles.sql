begin;

-- Dudu Bar: replace the generic profile data with details linked directly by the official site.
update public.establishments
set address = 'SCLS 303, Bloco A, Via W3 Sul, Brasília - DF',
    instagram = 'https://www.instagram.com/dudubaroficial/',
    website = 'https://dudubar.com.br/',
    whatsapp = '61995739741',
    agenda_url = null,
    operating_hours = jsonb_build_object(
      'text', 'Segunda a quinta: 12h às 15h e 18h à meia-noite. Sexta e sábado: 12h à 1h30. Domingo: 12h às 17h.',
      'checkedAt', '2026-11-13',
      'sourceUrl', 'https://dudubar.com.br/'
    ),
    contact_source_url = 'https://dudubar.com.br/',
    contact_checked_at = date '2026-11-13',
    updated_at = now()
where id = 'dudu-bar'
  and publication_status = 'published';

-- Olinda Taguatinga: the Linktree is the official contact/menu/location hub, not a dated weekly agenda.
update public.establishments
set address = 'Taguatinga Norte CNB 2, Lote 2, Loja 1, Taguatinga, Brasília - DF, 72115-025',
    website = 'https://linktr.ee/olindaoficial1',
    agenda_url = null,
    contact_source_url = 'https://linktr.ee/olindaoficial1',
    contact_checked_at = date '2026-11-13',
    updated_at = now()
where id = 'olinda-bar-e-restaurante'
  and publication_status = 'published';

-- Revalidate the two already-published Xique Xique branches against the current official site.
update public.establishments
set operating_hours = jsonb_build_object(
      'text', 'Todos os dias: 11h às 23h.',
      'checkedAt', '2026-11-13',
      'sourceUrl', 'https://www.restaurantexiquexique.com.br/'
    ),
    updated_at = now()
where id in ('xique-xique-asa-norte', 'xique-xique-asa-sul')
  and publication_status = 'published';

-- Preserve official source provenance for the profile corrections.
insert into public.data_sources (entity_type, entity_id, source_kind, label, url, captured_at, verified_at, verified_by)
select 'establishment', s.entity_id, 'official', s.label, s.url, now(), now(), null
from (values
  ('dudu-bar', 'Site oficial — endereço, horários, contatos e perfil social', 'https://dudubar.com.br/'),
  ('dudu-bar', 'Instagram oficial vinculado pelo site do estabelecimento', 'https://www.instagram.com/dudubaroficial/'),
  ('dudu-bar', 'Página Eventos — locação/eventos privados; não é agenda semanal datada', 'https://dudubar.com.br/?page_id=184'),
  ('olinda-bar-e-restaurante', 'Linktree oficial — contatos, cardápios e localizações das unidades Taguatinga e Asa Sul', 'https://linktr.ee/olindaoficial1'),
  ('xique-xique-asa-norte', 'Site oficial — unidades e horários revisados em 13/11/2026', 'https://www.restaurantexiquexique.com.br/'),
  ('xique-xique-asa-sul', 'Site oficial — unidades e horários revisados em 13/11/2026', 'https://www.restaurantexiquexique.com.br/')
) as s(entity_id, label, url)
where not exists (
  select 1 from public.data_sources d
  where d.entity_type = 'establishment'
    and d.entity_id = s.entity_id
    and d.url = s.url
);

commit;
