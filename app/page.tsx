import { ExperienceHub } from '@/components/ExperienceHub';
import { establishmentService } from '@/modules/establishments/service';

export const revalidate = 60;

export default async function HomePage() {
  const places = await establishmentService.search({});
  return <ExperienceHub initialPlaces={places} />;
}
