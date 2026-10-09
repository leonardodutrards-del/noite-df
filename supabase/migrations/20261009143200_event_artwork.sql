-- Optional editorial media. Existing events remain valid and RLS policies are unchanged.
alter table public.events add column if not exists artwork jsonb;
alter table public.events add constraint events_artwork_shape check (
  artwork is null or (
    jsonb_typeof(artwork) = 'object'
    and artwork ?& array['url', 'alt', 'credit', 'sourceUrl', 'authorized']
    and jsonb_typeof(artwork->'url') = 'string'
    and jsonb_typeof(artwork->'alt') = 'string'
    and jsonb_typeof(artwork->'credit') = 'string'
    and jsonb_typeof(artwork->'sourceUrl') = 'string'
    and jsonb_typeof(artwork->'authorized') = 'boolean'
    and length(artwork->>'url') between 1 and 2000
    and length(artwork->>'alt') between 1 and 300
    and length(artwork->>'credit') between 1 and 200
    and length(artwork->>'sourceUrl') between 1 and 2000
    and artwork->>'url' like 'https://%'
    and artwork->>'sourceUrl' like 'https://%'
    and (publication_status <> 'published' or artwork->>'authorized' = 'true')
  )
);
