import { apiClient } from './client';
import { Screenshot } from '../types';
import { authService } from '../services/auth.service';
import { API_CONFIG } from '../config/api.config';

export interface UploadScreenshotsParams {
  tradeId?: string;
  mt5TradeId?: string;
  files: File[];
}

export interface UploadScreenshotsResponse {
  screenshots: Screenshot[];
  message: string;
}

export interface GetScreenshotsResponse {
  screenshots: Screenshot[];
}

export interface DeleteScreenshotResponse {
  message: string;
}

/**
 * Screenshot API methods
 */
export const screenshotsApi = {
  /**
   * Upload screenshots for a trade with progress tracking
   */
  async uploadScreenshots(
    params: UploadScreenshotsParams,
    onProgress?: (progress: number) => void
  ): Promise<UploadScreenshotsResponse> {
    const { tradeId, mt5TradeId, files } = params;

    const formData = new FormData();

    // Add all files (backend expects 'files' field name)
    files.forEach((file) => {
      formData.append('files', file);
    });

    // Build URL - use tradeId in URL path, mt5TradeId as query param
    const baseUrl = tradeId || 'null'; // Use 'null' if only mt5TradeId is provided
    const url = new URL(`${API_CONFIG.baseURL}/api/screenshots/upload/${baseUrl}`);

    if (mt5TradeId) {
      url.searchParams.append('mt5TradeId', mt5TradeId);
    }

    // Get auth token
    const token = authService.getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }

      // Load event (success)
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || error.error || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      // Error event
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      // Abort event
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Timeout
      xhr.timeout = API_CONFIG.timeout;
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      // Open and send request
      xhr.open('POST', url.toString());

      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(formData);
    });
  },

  /**
   * Get screenshots for a specific trade
   */
  async getTradeScreenshots(tradeId?: string, mt5TradeId?: string): Promise<GetScreenshotsResponse> {
    // Use tradeId in URL path, mt5TradeId as query param
    const pathTradeId = tradeId || 'null'; // Use 'null' if only mt5TradeId is provided
    const params: Record<string, string> = {};

    if (mt5TradeId) {
      params.mt5TradeId = mt5TradeId;
    }

    return apiClient.get<GetScreenshotsResponse>(`/api/screenshots/trade/${pathTradeId}`, { params });
  },

  /**
   * Delete a specific screenshot
   */
  async deleteScreenshot(screenshotId: string): Promise<DeleteScreenshotResponse> {
    return apiClient.delete<DeleteScreenshotResponse>(`/api/screenshots/${screenshotId}`);
  },
};
