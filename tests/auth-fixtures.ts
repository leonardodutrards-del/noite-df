import { authService } from '@/modules/auth/service';

export const TEST_USERS = {
  admin: {
    id: 'test-admin',
    email: 'admin@test.noitedf.local',
    name: 'Admin Teste',
    role: 'admin' as const,
    password: 'Admin-Teste-123456',
  },
  five: {
    id: 'test-partner-five',
    email: 'five@test.noitedf.local',
    name: 'Parceiro Five Teste',
    role: 'partner' as const,
    password: 'Five-Teste-123456',
    establishmentId: 'five-sport-bar',
    establishmentName: 'Five Sport Bar',
  },
  pinella: {
    id: 'test-partner-pinella',
    email: 'pinella@test.noitedf.local',
    name: 'Parceiro Pinella Teste',
    role: 'partner' as const,
    password: 'Pinella-Teste-123456',
    establishmentId: 'pinella',
    establishmentName: 'Pinella',
  },
};

export function seedAuthTestUsers(): void {
  authService.resetToDefaults();
  authService.seedTestUser(TEST_USERS.admin);
  authService.seedTestUser(TEST_USERS.five);
  authService.seedTestUser(TEST_USERS.pinella);
}
