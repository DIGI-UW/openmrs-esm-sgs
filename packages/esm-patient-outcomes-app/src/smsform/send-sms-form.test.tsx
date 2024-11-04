import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { v4 as uuid } from 'uuid';
import { mockPatient } from 'tools';
import saveQuestionnaireResource from './common/send-sms-resource';
import SendSmsForm from './send-sms-form.component';
import { type SmsFormData } from './common/types';

const toValue = '+5571981265131';
const guidValue = uuid();
const bodyValue = window.location.host.concat(`/outcomes?pid=${guidValue}`);
const sourceValue = window.location.host;

const payload: SmsFormData = {
  to: toValue,
  guid: guidValue,
  body: bodyValue,
  source: sourceValue,
  patientUuid: mockPatient.id,
  locale: '',
};

const testProps = {
  closeWorkspace: () => {},
  closeWorkspaceWithSavedChanges: jest.fn(),
  patientUuid: mockPatient.id,
  promptBeforeClosing: () => {},
  setTitle: jest.fn(),
  showPatientHeader: false,
};

const mockSaveQuestionnaire = jest.spyOn(saveQuestionnaireResource, 'saveQuestionnaire');

describe('SendSmsForm', () => {
  it('renders the send sms form', async () => {
    render(<SendSmsForm {...testProps} />);

    expect(screen.getByText(/Phone number/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Select Language/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send SMS/i })).toBeInTheDocument();
  });

  it('should send the pro questionnaire link via sms', async () => {
    const user = userEvent.setup();

    render(<SendSmsForm {...testProps} />);

    const toInput = screen.getByRole('textbox', { name: /Phone number/i });
    const sendSmsButton = screen.getByRole('button', { name: /Send SMS/i });

    await user.type(toInput, toValue);

    expect(toInput).toHaveValue('+5571981265131');

    saveQuestionnaireResource.saveQuestionnaire(payload, new AbortController());

    await waitFor(() => user.click(sendSmsButton));

    expect(mockSaveQuestionnaire).toHaveBeenCalledTimes(1);
    expect(mockSaveQuestionnaire).toHaveReturned();
  });
});
