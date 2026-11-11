import { useState, useCallback } from 'react';
import { usePatientStore } from '../store/patientStore';
import { PatientInput, WhatIfInput } from '../types';

export function usePrediction() {
  const store = usePatientStore();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const submitData = useCallback(
    async (input: PatientInput) => {
      const result = await store.submitMyData(input);
      setHasSubmitted(true);
      return result;
    },
    [store],
  );

  const runWhatIf = useCallback(
    async (mods: WhatIfInput) => {
      if (!store.myLatestPrediction) return;
      await store.runWhatIf(store.myLatestPrediction.id, mods);
    },
    [store],
  );

  return {
    prediction: store.myLatestPrediction,
    isSubmitting: store.isSubmitting,
    error: store.error,
    hasSubmitted,
    whatIfResult: store.whatIfResult,
    isWhatIfLoading: store.isWhatIfLoading,
    submitData,
    runWhatIf,
    clearError: store.clearError,
    clearWhatIf: store.clearWhatIf,
  };
}
