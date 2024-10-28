export const spaRoot = window['getOpenmrsSpaBase']();
export const basePath = '/patient/:patientUuid/chart';
export const dashboardPath = `${basePath}/:view/*`;
export const spaBasePath = `${window.spaBase}${basePath}`;
export const moduleName = '@i-tech-uw/esm-patient-outcomes-app';
export const patientReportedOutcomesSlot = 'patient-reported-outcomes-slot';
