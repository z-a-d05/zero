// ─── Core User & Auth Types ───────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high';
export type DiabetesType = 'T1DM' | 'T2DM' | 'GDM' | 'MODY';
export type UserRole = 'patient' | 'clinician' | 'admin';
export type ActivityLevel = 'low' | 'medium' | 'high';
export type Gender = 'male' | 'female' | 'other';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// ─── Patient Types ────────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  bmi: number;
  hba1c: number;
  fastingGlucose: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  familyHistory: boolean;
  physicalActivityLevel: ActivityLevel;
  smokingStatus: boolean;
  createdAt: string;
}

export interface PatientInput {
  age: number;
  gender: Gender;
  weightKg: number;
  heightCm: number;
  bmi?: number;
  hba1c: number;
  fastingGlucose: number;
  familyHistory: boolean;
  physicalActivityLevel: ActivityLevel;
  smokingStatus?: boolean;
}

export interface PatientListItem {
  id: string;
  name: string;
  age: number;
  latestRiskScore: number;
  riskLevel: RiskLevel;
  lastVisit: string;
}

// ─── Prediction & SHAP Types ──────────────────────────────────────────────────

export interface SHAPFeature {
  name: string;
  value: number | string | boolean;
  contribution: number;
  displayName: string;
}

export interface SHAPExplanation {
  features: SHAPFeature[];
  baseValue: number;
  topFactors: string[];
  limeRule: string;
}

export interface PredictionResult {
  id: string;
  patientId: string;
  predictionType: DiabetesType;
  riskScore: number;
  riskLevel: RiskLevel;
  riskPercentage: number;
  explanation: SHAPExplanation;
  modelVersion: string;
  createdAt: string;
  recommendations: string[];
}

export interface WhatIfInput {
  bmiDelta?: number;
  activityLevel?: ActivityLevel;
  hba1cDelta?: number;
  fastingGlucoseDelta?: number;
}

export interface WhatIfResult {
  original: PredictionResult;
  modified: PredictionResult;
  delta: number;
  improvement: string;
}

// ─── API Response Wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// ─── Chatbot Types ────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
