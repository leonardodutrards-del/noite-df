'use client';

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
  'Brasília',
  'Outro',
];

export default function BecomePartnerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [step, setStep] = useState<'info' | 'confirm' | 'success'>(
    'info'
  );

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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'info') {
      // Validar campos obrigatórios
      if (!formData.name || !formData.region || !formData.address) {
        setError('Nome, região e endereço são obrigatórios.');
        return;
      }
      setStep('confirm');
      return;
    }

    if (step === 'confirm') {
      setIsLoading(true);
      setError(undefined);

      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('Autenticação necessária.');
        }

        const response = await fetch('/api/parceiro/claim-establishment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json() as { error?: string };
          throw new Error(errorData.error || 'Erro ao criar estabelecimento');
        }

        const data = await response.json() as { token?: string };

        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }

        setStep('success');
        setTimeout(() => {
          router.push('/parceiro');
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao criar estabelecimento');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Seja um Parceiro Noite DF
          </h1>
          <p className="text-gray-600 mb-8">
            Gerencie seu estabelecimento e aumente sua visibilidade
          </p>

          {step === 'info' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Nome do Estabelecimento *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ex: Meu Bar Legal"
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium mb-1">
                    Tipo *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {ESTABLISHMENT_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm font-medium mb-1">
                    Região *
                  </label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Selecione uma região</option>
                    {REGIONS.map(region => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-1">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Rua, nº, complemento"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="(61) 3333-3333"
                  />
                </div>

                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="(61) 99999-9999"
                  />
                </div>

                <div>
                  <label htmlFor="instagram" className="block text-sm font-medium mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="@seu_estabelecimento"
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Descrição
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Conte um pouco sobre seu estabelecimento..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                Prosseguir para Revisão
              </button>
            </form>
          )}

          {step === 'confirm' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="font-semibold text-blue-900 mb-4">
                  Confirme os dados do seu estabelecimento
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome:</span>
                    <strong>{formData.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <strong>{formData.type}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Região:</span>
                    <strong>{formData.region}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Endereço:</span>
                    <strong>{formData.address}</strong>
                  </div>
                  {formData.whatsapp && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">WhatsApp:</span>
                      <strong>{formData.whatsapp}</strong>
                    </div>
                  )}
                  {formData.instagram && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Instagram:</span>
                      <strong>{formData.instagram}</strong>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('info');
                    setError(undefined);
                  }}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 font-medium"
                >
                  ← Voltar e Editar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? 'Processando...' : 'Confirmar e Começar'}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h2 className="text-2xl font-semibold text-green-900 mb-2">
                ✓ Bem-vindo ao Noite DF!
              </h2>
              <p className="text-green-800 mb-4">
                Seu estabelecimento foi cadastrado com sucesso. Você será redirecionado para o dashboard.
              </p>
              <p className="text-sm text-gray-600">
                Redirecionando em 2 segundos...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
