// ============================================================================
// JAVASCRIPT PATIENT WITNESS GENERATOR & EXTRACTOR
// ES Module utility for formatting confidential health parameters.
// ============================================================================

import crypto from 'node:crypto';

export function createPatientWitness({ age, conditionCode, medicationCode, secretSeed }) {
  const seed = secretSeed || crypto.randomBytes(32).toString('hex');

  const witness = {
    patientAge: Number(age),
    conditionCode: Number(conditionCode),
    medicationCode: Number(medicationCode),
    secretSeed: seed,
    witnessHash: crypto
      .createHash('sha256')
      .update(`${age}:${conditionCode}:${medicationCode}:${seed}`)
      .digest('hex'),
  };

  return witness;
}

if (process.argv[1] && process.argv[1].endsWith('generate-witness.js')) {
  console.log('Generating sample patient witness in JavaScript...');
  const witness = createPatientWitness({
    age: 34,
    conditionCode: 101,
    medicationCode: 0,
  });
  console.log('Generated Witness:', witness);
}
