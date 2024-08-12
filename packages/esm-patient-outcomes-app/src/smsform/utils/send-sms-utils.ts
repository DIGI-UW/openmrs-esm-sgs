import { type Observable } from 'rxjs';
import { type NewSmsPayload } from '../send-sms-form.resource';
import { openmrsObservableFetch, restBaseUrl, type FetchResponse } from '@openmrs/esm-framework';

export function saveQuestionnaire(
  payload: NewSmsPayload,
  abortController: AbortController,
): Observable<FetchResponse<any>> {
  return openmrsObservableFetch(`${restBaseUrl}/outcomes/sms`, {
    signal: abortController.signal,
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: payload,
  });
}
