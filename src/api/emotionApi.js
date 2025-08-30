import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api';

class EmotionApi {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    // 요청 인터셉터: 인증 토큰 추가
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // 오디오 파일로 감정 분석
  async analyzeEmotion(audioBlob) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'emotion.wav');

      const response = await this.client.post('/emotion/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Emotion analysis failed:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  // 사용자 선호도 저장
  async savePreference(preferenceType, preferenceValue) {
    try {
      const response = await this.client.post('/api/user/preferences', {
        preferenceType,
        preferenceValue,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Save preference failed:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }

  // 사용자 선호도 조회
  async getPreferences() {
    try {
      const response = await this.client.get('/api/user/preferences');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get preferences failed:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
      };
    }
  }
}

export default new EmotionApi();
