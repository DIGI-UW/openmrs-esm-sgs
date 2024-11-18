import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSet,
  Form,
  InlineLoading,
  InlineNotification,
  Row,
  Stack,
  Select,
  SelectItem,
} from '@carbon/react';
import { v4 as uuid } from 'uuid';
import { FormProvider, useForm } from 'react-hook-form';
import { first } from 'rxjs/operators';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ExtensionSlot,
  showSnackbar,
  useConnectivity,
  useLayoutType,
  usePatient,
  useSession,
} from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { type SmsFormData } from './common/types';
import { saveQuestionnaire } from './common';
import SendSmsField from './send-sms-input.component';
import styles from './send-sms-form.scss';

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
  const { locale, allowedLocales } = useSession();
  const visitHeaderSlotState = useMemo(() => ({ patientUuid }), [patientUuid]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const languageNames = useMemo(
    () =>
      Object.fromEntries(
        allowedLocales.map((locale) => [locale, new Intl.DisplayNames([locale], { type: 'language' }).of(locale)]),
      ),
    [allowedLocales],
  );

  const [errorFetchingResources] = useState<{
    blockSavingForm: boolean;
  }>(null);

  const smsFormSchema = useMemo(() => {
    const phoneValidation = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return z.object({
      to: z.string().regex(phoneValidation, { message: 'Invalid phone number' }),
      locale: z.string().min(1, { message: 'Language selection is required' }),
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
    if (patient?.telecom && patient.telecom[0]?.value) {
      methods.setValue('to', patient.telecom[0].value);
    }
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing, patient]);

  useEffect(() => {
    methods.setValue('locale', selectedLocale);
  }, [selectedLocale, methods]);

  const onSubmit = useCallback(
    (data: SmsFormData, event: any) => {
      if (!patientUuid) {
        return;
      }

      setIsSubmitting(true);
      const { to } = data;

      const guid = uuid();
      const url = new URL(window.location.origin);
      const params = new URLSearchParams({ pid: guid, locale: selectedLocale });
      url.pathname = '/outcomes';
      url.search = params.toString();
      const body = url.toString();

      const source = window.location.host;

      let payload: SmsFormData = {
        to: to,
        guid: guid,
        body: body,
        source: source,
        patientUuid: patientUuid,
        locale: selectedLocale,
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
                  title: t('smsSent', 'SMS sent'),
                  subtitle: t('proQuestionnaireUrlSent', 'PRO Questionnaire url (SMS) sent to Patient successfully!'),
                });
                setIsSubmitting(false);
              } else {
                closeWorkspace({ ignoreChanges: true });
                showSnackbar({
                  title: t('smsError', 'Sending SMS failed'),
                  kind: 'error',
                  isLowContrast: false,
                  subtitle: t('sendSmsError', 'Error sending PRO Questionnaire url (SMS)!!'),
                });
              }
            },
          });
        console.error('Save questionnaire method called.....');
      } else {
        showSnackbar({
          title: t('smsError', 'SMS seding failed'),
          kind: 'error',
          isLowContrast: false,
          subtitle: t('sendSmsInternetError', 'Cannot send SMS without Intenet connection!!'),
        });
      }
    },
    [closeWorkspace, isOnline, patientUuid, selectedLocale, t],
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
              inputFieldLabel={t('smsReceiver', 'SMS Recipient phone number')}
              inputFieldName="to"
              inputFieldType="text"
              inputFieldPlaceholder={t('smsReceiver', 'SMS Recipient phone number')}
            />
            <div>
              <Select
                id="language-select"
                labelText={t('selectLanguage', 'Select Language')}
                value={selectedLocale}
                onChange={(event) => setSelectedLocale(event.target.value)}>
                {allowedLocales?.map((locale, i) => (
                  <SelectItem key={`locale-option-${locale}-${i}`} value={locale} text={languageNames[locale]} />
                ))}
              </Select>
            </div>
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
              <InlineLoading className={styles.spinner} description={t('sendingSms', 'Sending SMS') + '...'} />
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
