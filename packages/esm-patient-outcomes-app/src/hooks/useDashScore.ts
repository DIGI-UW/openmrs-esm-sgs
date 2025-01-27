import { useMemo } from 'react';
import useSWR from 'swr';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { restBaseUrl } from '@openmrs/esm-framework';

export function useDashScore(patientUuid: string) {
  const url = patientUuid ? `${restBaseUrl}/outcomes/score/${patientUuid}` : null;
  const { data, isLoading } = useSWR<FetchResponse<any>, Error>(url, openmrsFetch);

  const score = data?.data;

  return useMemo(() => ({ score, isLoading }), [isLoading, score]);
}
