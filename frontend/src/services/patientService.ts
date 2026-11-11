import apiClient from './api';
import { Patient, PatientInput, PatientListItem } from '../types';

export const patientService = {
  async createPatient(data: PatientInput): Promise<Patient> {
    const response = await apiClient.post<Patient>('/patients', data);
    return response.data;
  },

  async getMyProfile(): Promise<Patient> {
    const response = await apiClient.get<Patient>('/patients/me');
    return response.data;
  },

  async updateMyProfile(data: Partial<PatientInput>): Promise<Patient> {
    const response = await apiClient.patch<Patient>('/patients/me', data);
    return response.data;
  },

  async getPatientById(id: string): Promise<Patient> {
    const response = await apiClient.get<Patient>(`/patients/${id}`);
    return response.data;
  },

  async listPatients(params?: {
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ items: PatientListItem[]; total: number; page: number }> {
    const response = await apiClient.get('/patients', { params });
    return response.data;
  },

  async deletePatient(id: string): Promise<void> {
    await apiClient.delete(`/patients/${id}`);
  },
};
