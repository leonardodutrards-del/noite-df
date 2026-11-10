import { describe, expect, it } from 'vitest';
import { normalizeGeocodingText, scoreNominatimCandidate } from '@/modules/establishments/geocoding';

describe('geocodificação OpenStreetMap', () => {
  it('normaliza acentos e pontuação para comparação', () => {
    expect(normalizeGeocodingText('Ām.bar — Asa Sul')).toBe('am bar asa sul');
  });

  it('aceita correspondência de nome e região com coordenadas válidas', () => {
    const result = scoreNominatimCandidate(
      { name: 'Bar Godofredo', region: 'Asa Norte', address: 'CLN 408, Bloco B, Loja 12 — Asa Norte, Brasília, DF' },
      {
        lat: '-15.765',
        lon: '-47.882',
        display_name: 'Bar Godofredo, CLN 408, Asa Norte, Brasília, Distrito Federal, Brasil',
        type: 'bar',
        class: 'amenity',
      }
    );
    expect(result.accepted).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0.78);
  });

  it('rejeita centroide de região mesmo quando o nome aparece na consulta', () => {
    const result = scoreNominatimCandidate(
      { name: 'Bar Godofredo', region: 'Asa Norte', address: 'CLN 408, Bloco B, Loja 12 — Asa Norte, Brasília, DF' },
      {
        lat: '-15.765',
        lon: '-47.882',
        display_name: 'Asa Norte, Brasília, Distrito Federal, Brasil',
        type: 'suburb',
        class: 'place',
      }
    );
    expect(result.accepted).toBe(false);
  });

  it('não confunde Planaltina-GO com Planaltina-DF', () => {
    const result = scoreNominatimCandidate(
      { name: 'Circuito de Comitivas', region: 'Brasilinha · Entorno', address: 'Planaltina de Goiás — GO' },
      { lat: '-15.62', lon: '-47.65', display_name: 'Circuito de Comitivas, Planaltina, Distrito Federal, Brasil', type: 'event_venue', class: 'leisure' }
    );
    expect(result.accepted).toBe(false);
  });

  it('rejeita coordenadas fora da área operacional do DF e Entorno', () => {
    const result = scoreNominatimCandidate(
      { name: 'Bar Godofredo', region: 'Asa Norte', address: 'CLN 408, Asa Norte, Brasília, DF' },
      { lat: '-23.55', lon: '-46.63', display_name: 'Bar Godofredo, Asa Norte, Brasília, Distrito Federal, Brasil', type: 'bar', class: 'amenity' }
    );
    expect(result.accepted).toBe(false);
  });

  it('mantém resultados ambíguos para revisão em vez de gravar coordenadas', () => {
    const result = scoreNominatimCandidate(
      { name: 'Manzuá — Pontão', region: 'Lago Sul', address: 'Pontão do Lago Sul — SHIS QL 10, Lago Sul, Brasília, DF' },
      {
        lat: '-15.83',
        lon: '-47.87',
        display_name: 'Pontão do Lago Sul, Lago Sul, Brasília, Distrito Federal, Brasil',
        type: 'restaurant',
        class: 'leisure',
      }
    );
    expect(result.accepted).toBe(false);
  });
});
