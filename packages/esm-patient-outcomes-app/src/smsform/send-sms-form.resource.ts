export type SmsFormData = {
  to: string;
  guid: string;
  body: string;
  source: string;
  patientUuid: string;
};

export interface NewSmsPayload {
  to?: string;
  guid?: string;
  body: string;
  source: string;
  patientUuid?: string;
}

export type UpdateSmsPayload = NewSmsPayload & {};
