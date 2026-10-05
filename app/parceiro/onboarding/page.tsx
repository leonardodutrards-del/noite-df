'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateEstablishmentInput } from '@/modules/establishments/types';

const ESTABLISHMENT_TYPES = [
  'Bar',
  'Restaurante',
  'Boate',
  'Casa de show',
  'Evento agro',
  'Gastrobar',
  'Pub',
  'Complexo gastronômico',
  'Clube / espaço de eventos',
] as const;

const REGIONS = [
  'Asa Norte',
  'Asa Sul',
  'Águas Claras',
  'Gama',
  'Ceilândia',
  'Samambaia',
  'Santa Maria',
  'Sobradinho',
  'Planaltina',
  'Brasília',
  'Outro',
];

export default function BecomePartnerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [step, setStep] = useState<'info' | 'confirm' | 'success'>('info');

  const [formData, setFormData] = useState<CreateEstablishmentInput>({
    name: '',
    type: 'Bar',
    description: '',
    region: '',
    address: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    website: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setError(undefined);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'info') {
      if (!formData.name.trim() || !formData.region || !formData.address.trim()) {
        setError('Preencha nome do estabelecimento, região e endereço para continuar.');
        return;
      }
      setError(undefined);
      setStep('confirm');
      return;
    }

    if (step === 'confirm') {
      setIsLoading(true);
      setError(undefined);

      try {
        const response = await fetch('/api/parceiro/claim-establishment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.status === 401) {
          router.push('/login?redirect=/parceiro/onboarding');
          return;
        }

        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          throw new Error(errorData.error || 'Erro ao criar estabelecimento');
        }

        await response.json();
        setStep('success');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao criar estabelecimento');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <main className="container partner-onboarding-page">
      <header className="topbar sales-topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav>
          <Link href="/parceiros/sobradinho">Conhecer proposta</Link>
          <Link href="/planos">Ver planos</Link>
          <Link href="/login?redirect=/parceiro">Já tenho conta</Link>
        </nav>
      </header>

      <section className="partner-onboarding-shell">
        <div className="partner-onboarding-heading">
          <span className="badge">Área do parceiro</span>
          <h1>Seja um Parceiro Noite DF</h1>
          <p>
            Cadastre os dados do estabelecimento para solicitar o vínculo e começar a gerenciar
            sua presença, agenda e promoções na plataforma.
          </p>

          <div className="partner-stepper" aria-label="Etapas do cadastro">
            <span className={step === 'info' ? 'active' : 'done'}>1 · Dados</span>
            <span className={step === 'confirm' ? 'active' : step === 'success' ? 'done' : ''}>2 · Revisão</span>
            <span className={step === 'success' ? 'active' : ''}>3 · Solicitação</span>
          </div>
        </div>

        <div className="panel partner-onboarding-card">
          {step === 'info' && (
            <form onSubmit={handleSubmit} className="partner-onboarding-form" noValidate>
              <div className="partner-form-grid">
                <label className="partner-field">
                  <span>Nome do estabelecimento *</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Ex: Meu Bar Legal"
                    autoComplete="organization"
                  />
                </label>

                <label className="partner-field">
                  <span>Tipo *</span>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    {ESTABLISHMENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>

                <label className="partner-field">
                  <span>Região *</span>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <option value="">Selecione uma região</option>
                    {REGIONS.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </label>

                <label className="partner-field">
                  <span>Endereço *</span>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Quadra, conjunto, lote, loja..."
                    autoComplete="street-address"
                  />
                </label>

                <label className="partner-field">
                  <span>Telefone</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="(61) 3333-3333"
                    autoComplete="tel"
                  />
                </label>

                <label className="partner-field">
                  <span>WhatsApp</span>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="(61) 99999-9999"
                  />
                </label>

                <label className="partner-field">
                  <span>Instagram</span>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="@seu_estabelecimento"
                  />
                </label>

                <label className="partner-field">
                  <span>Website</span>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="https://..."
                    autoComplete="url"
                  />
                </label>

                <label className="partner-field partner-field-full">
                  <span>Descrição</span>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isLoading}
                    rows={5}
                    placeholder="Conte um pouco sobre o estabelecimento, público, música e proposta da casa..."
                  />
                </label>
              </div>

              {error ? <div className="notice danger partner-form-error">{error}</div> : null}

              <div className="partner-form-footer">
                <small>
                  * Campos obrigatórios. Você poderá revisar tudo antes de enviar a solicitação.
                </small>
                <button type="submit" disabled={isLoading}>
                  Prosseguir para revisão
                </button>
              </div>
            </form>
          )}

          {step === 'confirm' && (
            <form onSubmit={handleSubmit} className="partner-onboarding-form">
              <div className="partner-review-header">
                <span className="badge">Revisão</span>
                <h2>Confira os dados antes de enviar</h2>
                <p>Se algo estiver incorreto, volte e edite. Nenhuma cobrança acontece nesta etapa.</p>
              </div>

              <div className="partner-review-grid">
                <div><span>Nome</span><strong>{formData.name}</strong></div>
                <div><span>Tipo</span><strong>{formData.type}</strong></div>
                <div><span>Região</span><strong>{formData.region}</strong></div>
                <div><span>Endereço</span><strong>{formData.address}</strong></div>
                {formData.whatsapp ? <div><span>WhatsApp</span><strong>{formData.whatsapp}</strong></div> : null}
                {formData.instagram ? <div><span>Instagram</span><strong>{formData.instagram}</strong></div> : null}
                {formData.website ? <div><span>Website</span><strong>{formData.website}</strong></div> : null}
                {formData.description ? (
                  <div className="partner-review-full">
                    <span>Descrição</span>
                    <strong>{formData.description}</strong>
                  </div>
                ) : null}
              </div>

              {error ? <div className="notice danger partner-form-error">{error}</div> : null}

              <div className="partner-confirm-actions">
                <button
                  type="button"
                  className="button ghost"
                  onClick={() => {
                    setStep('info');
                    setError(undefined);
                  }}
                  disabled={isLoading}
                >
                  ← Voltar e editar
                </button>
                <button type="submit" className="button" disabled={isLoading}>
                  {isLoading ? 'Enviando…' : 'Confirmar solicitação'}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="partner-success">
              <span className="badge">Solicitação enviada</span>
              <h2>Cadastro recebido ✓</h2>
              <p>
                O Master Admin pode aprovar o vínculo com o estabelecimento. Depois da aprovação,
                o painel do parceiro fica disponível para escolher o plano e gerenciar a página.
              </p>
              <div className="partner-confirm-actions">
                <Link className="button" href="/parceiro">Abrir painel do parceiro</Link>
                <Link className="button ghost" href="/planos">Conhecer os planos</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
