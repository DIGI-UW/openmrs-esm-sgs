import { getSyncLifecycle } from '@openmrs/esm-framework';
import * as PatientCommonLib from '@openmrs/esm-patient-common-lib';
import { moduleName } from './constants';
import sendSmsFormComponent from './smsform/send-sms-form.component';
import sendSmsActionButtonComponent from './actions/send-sms-action.component';

window['_openmrs_esm_patient_common_lib'] = PatientCommonLib;

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {}

export const sendSmsForm = getSyncLifecycle(sendSmsFormComponent, {
  featureName: 'send-outcomes-form',
  moduleName,
});

export const sendSmsActionButton = getSyncLifecycle(sendSmsActionButtonComponent, {
  featureName: 'send-outcomes-button',
  moduleName,
});
