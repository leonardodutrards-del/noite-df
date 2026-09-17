'use client';

import { useState } from 'react';
import type { SignUpVisitorInput } from '@/modules/auth/types';

interface ConsentFormProps {
  onSubmit: (data: SignUpVisitorInput) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export function ConsentForm({ onSubmit, isLoading = false, error }: ConsentFormProps) {
  const [formData, setFormData] = useState<SignUpVisitorInput>({
    email: '',
    phone: '',
    name: '',
    consentEmail: false,
    consentWhatsapp: false,
    consentPromotions: false,
    consentTickets: false,
    consentCourtesy: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const hasConsent = formData.consentEmail || formData.consentWhatsapp;

  return (
    <form onSubmit={handleSubmit} className="account-form visitor-form">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="seu@email.com"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Telefone/WhatsApp *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="(61) 99999-9999"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Nome (opcional)
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Seu nome"
          disabled={isLoading}
        />
      </div>

      {/* LGPD Consent Checkboxes */}
      <fieldset className="border border-gray-300 rounded-md p-4">
        <legend className="text-sm font-semibold mb-3">
          Como deseja receber novidades?
        </legend>

        <div className="space-y-3">
          <div className="check-row">
            <input
              type="checkbox"
              id="consentEmail"
              name="consentEmail"
              checked={formData.consentEmail}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 mr-3"
            />
            <label htmlFor="consentEmail" className="text-sm">
              <strong>Email:</strong> Promoções, eventos especiais e cortesias
            </label>
          </div>

          <div className="check-row">
            <input
              type="checkbox"
              id="consentWhatsapp"
              name="consentWhatsapp"
              checked={formData.consentWhatsapp}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1 mr-3"
            />
            <label htmlFor="consentWhatsapp" className="text-sm">
              <strong>WhatsApp:</strong> Mensagens rápidas e alertas de eventos
            </label>
          </div>

          {hasConsent && (
            <>
              <hr className="my-2" />

              <div className="ml-6 space-y-2">
                <label className="text-xs font-semibold">
                  Que tipo de conteúdo você gostaria de receber?
                </label>

                <div className="check-row">
                  <input
                    type="checkbox"
                    id="consentPromotions"
                    name="consentPromotions"
                    checked={formData.consentPromotions}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="mr-2"
                  />
                  <label htmlFor="consentPromotions" className="text-xs">
                    Promoções e descontos
                  </label>
                </div>

                <div className="check-row">
                  <input
                    type="checkbox"
                    id="consentTickets"
                    name="consentTickets"
                    checked={formData.consentTickets}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="mr-2"
                  />
                  <label htmlFor="consentTickets" className="text-xs">
                    Ingressos para eventos
                  </label>
                </div>

                <div className="check-row">
                  <input
                    type="checkbox"
                    id="consentCourtesy"
                    name="consentCourtesy"
                    checked={formData.consentCourtesy}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="mr-2"
                  />
                  <label htmlFor="consentCourtesy" className="text-xs">
                    Convites e cortesias especiais
                  </label>
                </div>
              </div>
            </>
          )}

          {!hasConsent && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
              <p className="text-xs text-yellow-800">
                Para receber novidades, escolha E-mail ou WhatsApp. Você também pode explorar o guia sem criar conta.
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-600 mt-4">
          Você poderá revogar este consentimento a qualquer momento em suas configurações de privacidade.
          Para mais informações, veja nossa <a href="/privacidade" className="underline">Política de Privacidade</a>.
        </p>
      </fieldset>

      {error && (
        <div className="notice error" role="alert">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !hasConsent}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? 'Criando conta...' : 'Criar conta com estas preferências'}
      </button>
    </form>
  );
}
