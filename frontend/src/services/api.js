import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Health check
export const checkHealth = () => apiClient.get('/health');

// Model info
export const getModelsInfo = () => apiClient.get('/models/info');

// Predictions
export const predictStage1 = (data) => apiClient.post('/predict/stage1', data);
export const predictStage2 = (data) => apiClient.post('/predict/stage2', data);
export const predictStage3 = (data) => apiClient.post('/predict/stage3', data);
export const predictFullPipeline = (data) => apiClient.post('/predict/full-pipeline', data);
export const checkStage4Eligibility = (data) => apiClient.post('/predict/stage4/eligibility', data);

export default apiClient;
