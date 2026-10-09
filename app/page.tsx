import { ExperienceHub } from '@/components/ExperienceHub';
import { establishmentService } from '@/modules/establishments/service';

import { getPublicAgenda } from '@/modules/events/public-agenda';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [places, events] = await Promise.all([establishmentService.search({}), getPublicAgenda()]);
  return <ExperienceHub initialPlaces={places} initialEvents={events} />;
}
