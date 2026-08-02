export type PublicationStatus = 'draft' | 'pending_review' | 'published' | 'expired' | 'suspended';

export type DataSource = {
  kind: 'manual' | 'partner' | 'official' | 'community' | 'external';
  label: string;
  url?: string;
  verifiedAt?: string;
};
