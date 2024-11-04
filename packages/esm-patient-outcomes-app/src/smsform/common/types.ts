export type SmsFormData = {
  to: string;
  guid: string;
  body: string;
  source: string;
  patientUuid: string;
  locale: string;
};

export type UpdateSmsPayload = SmsFormData & {};
