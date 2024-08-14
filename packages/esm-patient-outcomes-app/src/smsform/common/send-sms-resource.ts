import { type Observable } from 'rxjs';
import { type SmsFormData } from './types';
import { openmrsObservableFetch, restBaseUrl, type FetchResponse } from '@openmrs/esm-framework';

export function saveQuestionnaire(
  payload: SmsFormData,
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

const saveQuestionnaireResource = {
  saveQuestionnaire,
};

export default saveQuestionnaireResource;
