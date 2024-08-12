import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSet, Form, InlineLoading, InlineNotification, Row, Stack } from '@carbon/react';
import { v4 as uuid } from 'uuid';
import { FormProvider, useForm } from 'react-hook-form';
import { first } from 'rxjs/operators';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExtensionSlot, showSnackbar, useConnectivity, useLayoutType, usePatient } from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { type NewSmsPayload, type SmsFormData } from './send-sms-form.resource';
import styles from './send-sms-form.scss';
import { saveQuestionnaire } from './utils/send-sms-utils';
import SendSmsField from './send-sms-input.componet';

interface SendSmsFormProps extends DefaultPatientWorkspaceProps {
  showPatientHeader?: boolean;
}

const SendSmsForm: React.FC<SendSmsFormProps> = ({
  closeWorkspace,
  promptBeforeClosing,
  showPatientHeader = false,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const isOnline = useConnectivity();
  const { patientUuid, patient } = usePatient();
  const visitHeaderSlotState = useMemo(() => ({ patientUuid }), [patientUuid]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorFetchingResources] = useState<{
    blockSavingForm: boolean;
  }>(null);

  const smsFormSchema = useMemo(() => {
    const phoneValidation = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return z.object({
      to: z.string().regex(phoneValidation, { message: 'Invalid phone number' }),
    });
  }, []);

  const methods = useForm<SmsFormData>({
    mode: 'all',
    resolver: zodResolver(smsFormSchema),
  });

  const {
    handleSubmit,
    formState: { isDirty },
  } = methods;

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const onSubmit = useCallback(
    (data: SmsFormData, event) => {
      if (!patientUuid) {
        return;
      }

      setIsSubmitting(true);

      const { to } = data;
      const guid = uuid();
      const body = window.location.host.concat(`/outcomes?pid=${guid}`);
      const source = window.location.host;

      let payload: NewSmsPayload = {
        to: to,
        guid: guid,
        body: body,
        source: source,
        patientUuid: patientUuid,
      };

      const abortController = new AbortController();

      if (isOnline) {
        saveQuestionnaire(payload, abortController)
          .pipe(first())
          .subscribe({
            next: (response) => {
              if (response.status === 200) {
                showSnackbar({
                  kind: 'success',
                  title: t('smsSent', 'SMS Delivered'),
                  subtitle: t('sendSmsSuccessful', `PRO Questionnaire url (SMS) sent to Patient successfully!`),
                });
                setIsSubmitting(false);
              } else {
                closeWorkspace({ ignoreChanges: true });
                showSnackbar({
                  title: t('smsError', 'SMS Failed'),
                  kind: 'error',
                  isLowContrast: false,
                  subtitle: t('sendSmsError', 'Error sending PRO Questionnaire url (SMS)!!'),
                });
              }
            },
          });
      } else {
        showSnackbar({
          title: t('smsError', 'SMS Failed'),
          kind: 'error',
          isLowContrast: false,
          subtitle: t('sendSmsError', 'Cannot send SMS without Intenet connection!!'),
        });
      }
    },
    [closeWorkspace, isOnline, patientUuid, t],
  );

  return (
    <FormProvider {...methods}>
      <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
        {showPatientHeader && patient && (
          <ExtensionSlot
            name="patient-header-slot"
            state={{
              patient,
              patientUuid: patientUuid,
              hideActionsOverflow: true,
            }}
          />
        )}
        {errorFetchingResources && (
          <InlineNotification
            kind={errorFetchingResources?.blockSavingForm ? 'error' : 'warning'}
            lowContrast
            className={styles.inlineNotification}
            title={t('partOfFormDidntLoad', 'Part of the form did not load')}
            subtitle={t('refreshToTryAgain', 'Please refresh to try again')}
          />
        )}
        <div>
          {isTablet && (
            <Row className={styles.headerGridRow}>
              <ExtensionSlot
                name="visit-form-header-slot"
                className={styles.dataGridRow}
                state={visitHeaderSlotState}
              />
            </Row>
          )}
          <Stack gap={1} className={styles.container}>
            <SendSmsField
              inputFieldId="to"
              inputFieldLabel={t('smsReceiver', 'Phone number')}
              inputFieldName="to"
              inputFieldType="text"
              inputFieldPlaceholder={t('smsReceiver', 'SMS receipient phone number')}
            />
          </Stack>
        </div>
        <ButtonSet
          className={classNames({
            [styles.tablet]: isTablet,
            [styles.desktop]: !isTablet,
            [styles.buttonSet]: true,
          })}>
          <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
            {t('discard', 'Discard')}
          </Button>
          <Button
            className={styles.button}
            disabled={isSubmitting || errorFetchingResources?.blockSavingForm}
            kind="primary"
            type="submit">
            {isSubmitting ? (
              <InlineLoading className={styles.spinner} description={t('sendingSms', 'Sending sms') + '...'} />
            ) : (
              'Send SMS'
            )}
          </Button>
        </ButtonSet>
      </Form>
    </FormProvider>
  );
};

export default SendSmsForm;
