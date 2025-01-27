import React from 'react';
import { InlineLoading } from '@carbon/react';
import { useDashScore } from '../hooks/useDashScore';
import styles from './patient-banner.scss';
import { getCoreTranslation } from '@openmrs/esm-framework';

interface DashscoreProps {
  patientUuid: string;
}

const Dashscore: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { score, isLoading } = useDashScore(patientUuid);

  return (
    <>
      <h6 style={{ marginLeft: '1rem' }} className={styles.heading}>
        Quick DASH Score
      </h6>
      {isLoading ? (
        <InlineLoading description={`${getCoreTranslation('loading', 'Loading')} ...`} role="progressbar" />
      ) : (
        <ul>{score ? <li style={{ marginLeft: '1rem' }}>{score}</li> : <li style={{ marginLeft: '1rem' }}>--</li>}</ul>
      )}
    </>
  );
};

export default function PatientBannerDashScore({ patientUuid }: DashscoreProps) {
  return (
    <div className={styles.row}>
      <div className={styles.col}>
        <Dashscore patientUuid={patientUuid} />
      </div>
    </div>
  );
}
