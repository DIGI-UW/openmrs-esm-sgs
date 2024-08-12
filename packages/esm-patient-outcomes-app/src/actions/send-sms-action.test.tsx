import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePatient, useVisit, type VisitReturnType } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { mockPatient } from 'tools';
import SendSmsActionOverflowMenuItem from './send-sms-action.component';

const mockUsePatient = jest.mocked(usePatient);
const mockUseVisit = jest.mocked(useVisit);

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  createGlobalStore: jest.fn(),
  createUseStore: jest.fn(),
  getGlobalStore: jest.fn(),
}));

mockUseVisit.mockReturnValue({
  currentVisit: null,
} as VisitReturnType);

jest.mock('@openmrs/esm-patient-common-lib', () => {
  const originalModule = jest.requireActual('@openmrs/esm-patient-common-lib');
  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

describe('SendSmsActionOverflowMenuItem', () => {
  it('should launch send outcomes form', async () => {
    const user = userEvent.setup();

    mockUsePatient.mockReturnValue({
      error: null,
      isLoading: false,
      patient: mockPatient,
      patientUuid: mockPatient.id,
    });

    render(<SendSmsActionOverflowMenuItem patientUuid={mockPatient.id} />);

    const sendOutcomesFormButton = screen.getByRole('menuitem', { name: /Send PRO SMS/i });
    expect(sendOutcomesFormButton).toBeInTheDocument();

    await user.click(sendOutcomesFormButton);
    expect(launchPatientWorkspace).toHaveBeenCalledTimes(1);
    expect(launchPatientWorkspace).toHaveBeenCalledWith('send-outcomes-form');
  });

  it('should not show send outcomes button for deceased patient', () => {
    mockUsePatient.mockReturnValue({
      error: null,
      isLoading: false,
      patientUuid: mockPatient.id,
      patient: {
        ...mockPatient,
        deceasedDateTime: '2023-05-07T10:20:30Z',
      },
    });

    render(<SendSmsActionOverflowMenuItem patientUuid={mockPatient.id} />);

    const sendOutcomesFormButton = screen.queryByRole('menuitem', { name: /Send PRO SMS/i });
    expect(sendOutcomesFormButton).not.toBeInTheDocument();
  });
});
