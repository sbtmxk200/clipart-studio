// Design Ref: §9.4 Application layer — TanStack Query wrapper

import { useQuery } from '@tanstack/react-query';

import type { SchoolProfile } from '@/types/domain';

async function fetchSchoolProfile(): Promise<SchoolProfile | null> {
  const res = await fetch('/api/school-profile');
  if (!res.ok) throw new Error('Failed to fetch school profile');
  const json = (await res.json()) as { data: SchoolProfile | null };
  return json.data;
}

export function useSchoolProfile() {
  return useQuery({
    queryKey: ['school-profile'],
    queryFn: fetchSchoolProfile,
  });
}
