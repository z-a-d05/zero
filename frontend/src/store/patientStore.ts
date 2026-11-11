import { create } from 'zustand';
import { Patient, PatientInput, PatientListItem, PredictionResult, WhatIfResult, WhatIfInput } from '../types';
import { patientService } from '../services/patientService';
import { predictionService } from '../services/predictionService';

interface PatientState {
  // Patient portal (self)
  myProfile: Patient | null;
  myLatestPrediction: PredictionResult | null;
  isSubmitting: boolean;
  error: string | null;

  // Clinician view
  patientList: PatientListItem[];
  selectedPatient: Patient | null;
  selectedPrediction: PredictionResult | null;
  isLoadingList: boolean;
  isLoadingDetail: boolean;

  // What-If
  whatIfResult: WhatIfResult | null;
  isWhatIfLoading: boolean;

  // Actions
  submitMyData: (input: PatientInput) => Promise<PredictionResult>;
  loadMyLatestPrediction: () => Promise<void>;
  loadPatientList: (params?: { search?: string; sortBy?: string; order?: 'asc' | 'desc' }) => Promise<void>;
  selectPatient: (id: string) => Promise<void>;
  runWhatIf: (predictionId: string, mods: WhatIfInput) => Promise<void>;
  clearError: () => void;
  clearWhatIf: () => void;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  myProfile: null,
  myLatestPrediction: null,
  isSubmitting: false,
  error: null,

  patientList: [],
  selectedPatient: null,
  selectedPrediction: null,
  isLoadingList: false,
  isLoadingDetail: false,

  whatIfResult: null,
  isWhatIfLoading: false,

  submitMyData: async (input) => {
    set({ isSubmitting: true, error: null });
    try {
      const prediction = await predictionService.predict(input);
      set({ myLatestPrediction: prediction, isSubmitting: false });
      return prediction;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Prediction failed. Please try again.';
      set({ error: message, isSubmitting: false });
      throw err;
    }
  },

  loadMyLatestPrediction: async () => {
    const prediction = await predictionService.getMyLatestPrediction();
    set({ myLatestPrediction: prediction });
  },

  loadPatientList: async (params) => {
    set({ isLoadingList: true });
    try {
      const result = await patientService.listPatients(params);
      set({ patientList: result.items, isLoadingList: false });
    } catch {
      set({ isLoadingList: false });
    }
  },

  selectPatient: async (id) => {
    set({ isLoadingDetail: true, selectedPatient: null, selectedPrediction: null });
    try {
      const [patient, predictions] = await Promise.all([
        patientService.getPatientById(id),
        predictionService.getPatientPredictions(id),
      ]);
      set({
        selectedPatient: patient,
        selectedPrediction: predictions[0] ?? null,
        isLoadingDetail: false,
      });
    } catch {
      set({ isLoadingDetail: false });
    }
  },

  runWhatIf: async (predictionId, mods) => {
    set({ isWhatIfLoading: true, whatIfResult: null });
    try {
      const result = await predictionService.runWhatIf(predictionId, mods);
      set({ whatIfResult: result, isWhatIfLoading: false });
    } catch {
      // Fall back to local mock calculation
      const { myLatestPrediction } = get();
      if (myLatestPrediction) {
        const bmiReduction = (mods.bmiDelta ?? 0) * -0.8;
        const activityBoost = mods.activityLevel === 'high' ? -5 : mods.activityLevel === 'medium' ? -2 : 0;
        const hba1cChange = (mods.hba1cDelta ?? 0) * -3;
        const delta = bmiReduction + activityBoost + hba1cChange;
        const newPercentage = Math.max(0, Math.min(100, myLatestPrediction.riskPercentage + delta));
        const mockModified: PredictionResult = {
          ...myLatestPrediction,
          riskPercentage: newPercentage,
          riskScore: newPercentage / 100,
          riskLevel: newPercentage < 33 ? 'low' : newPercentage < 67 ? 'medium' : 'high',
        };
        set({
          whatIfResult: {
            original: myLatestPrediction,
            modified: mockModified,
            delta,
            improvement: `${Math.abs(Math.round(delta))}% lower risk`,
          },
          isWhatIfLoading: false,
        });
      } else {
        set({ isWhatIfLoading: false });
      }
    }
  },

  clearError: () => set({ error: null }),
  clearWhatIf: () => set({ whatIfResult: null }),
}));
