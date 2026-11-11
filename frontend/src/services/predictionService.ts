import apiClient from './api';
import { PredictionResult, PatientInput, WhatIfInput, WhatIfResult } from '../types';

export const predictionService = {
  async predict(input: PatientInput): Promise<PredictionResult> {
    const response = await apiClient.post<PredictionResult>('/predictions', input);
    return response.data;
  },

  async getPredictionById(id: string): Promise<PredictionResult> {
    const response = await apiClient.get<PredictionResult>(`/predictions/${id}`);
    return response.data;
  },

  async getPatientPredictions(patientId: string): Promise<PredictionResult[]> {
    const response = await apiClient.get<PredictionResult[]>(`/predictions/patient/${patientId}`);
    return response.data;
  },

  async getMyLatestPrediction(): Promise<PredictionResult | null> {
    try {
      const response = await apiClient.get<PredictionResult>('/predictions/me/latest');
      return response.data;
    } catch {
      return null;
    }
  },

  async runWhatIf(predictionId: string, modifications: WhatIfInput): Promise<WhatIfResult> {
    const response = await apiClient.post<WhatIfResult>(
      `/predictions/${predictionId}/what-if`,
      modifications,
    );
    return response.data;
  },

  async exportPDF(patientId: string): Promise<Blob> {
    const response = await apiClient.get(`/predictions/patient/${patientId}/export`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
