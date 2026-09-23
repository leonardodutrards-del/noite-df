import { ListsClient } from './ListsClient';

export default async function ListsPage({
  searchParams,
}: {
  searchParams: Promise<{ place?: string }>;
}) {
  const params = await searchParams;
  return <ListsClient initialPlaceId={params.place ?? ''} />;
}
