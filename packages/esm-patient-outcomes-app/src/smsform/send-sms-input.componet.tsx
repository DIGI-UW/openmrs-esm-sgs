import React from 'react';
import styles from './send-sms-form.scss';
import { Controller, useFormContext } from 'react-hook-form';
import classNames from 'classnames';
import { ResponsiveWrapper } from '@openmrs/esm-framework';
import { type SmsFormData } from './send-sms-form.resource';
import { TextInput } from '@carbon/react';

interface SendSmsFieldProps {
  inputFieldId: string;
  inputFieldLabel: string;
  inputFieldName: 'to' | 'guid' | 'body' | 'source' | 'patientUuid';
  inputFieldType: 'number' | 'text';
  inputFieldPlaceholder: string;
}

const SendSmsField: React.FC<SendSmsFieldProps> = ({
  inputFieldId,
  inputFieldLabel,
  inputFieldName,
  inputFieldType,
  inputFieldPlaceholder,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<SmsFormData>();

  return (
    <section>
      <div className={styles.sectionTitle}>{inputFieldLabel}</div>
      <div className={classNames(styles.dateTimeSection, styles.sectionField)}>
        <Controller
          name={inputFieldName}
          control={control}
          render={({ field: { onBlur, onChange, value } }) => (
            <ResponsiveWrapper>
              <TextInput
                id={inputFieldId}
                onChange={(event) => onChange(event.target.value)}
                onBlur={onBlur}
                placeholder={inputFieldPlaceholder}
                type={inputFieldType}
                style={{ width: '100%' }}
                value={value}
                invalid={errors[inputFieldName]?.message}
                invalidText={errors[inputFieldName]?.message}></TextInput>
            </ResponsiveWrapper>
          )}
        />
      </div>
    </section>
  );
};

export default SendSmsField;
