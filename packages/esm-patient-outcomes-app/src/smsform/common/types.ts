export type SmsFormData = {
  to: string;
  guid: string;
  body: string;
  source: string;
  patientUuid: string;
};

export type UpdateSmsPayload = SmsFormData & {};
