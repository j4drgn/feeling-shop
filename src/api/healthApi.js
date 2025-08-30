// API 기본 URL: Vite 환경변수 VITE_API_BASE_URL 사용 (예: http://localhost:8090/api)
// 빌드/개발 환경에서 .env 파일에 VITE_API_BASE_URL을 설정하세요.
const API_HOST = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:8090/api';
const API_BASE_URL = API_HOST.replace(/\/+$/, '');

// 건강 체크 관련 API 함수들
const healthApi = {
  // 서버 상태 확인
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        const text = await response.text().catch(() => null);
        let parsed = null;
        try { parsed = text ? JSON.parse(text) : null; } catch (e) { parsed = null; }
        console.error('checkHealth failed', { status: response.status, statusText: response.statusText, bodyText: text, bodyJson: parsed });
        return { success: false, message: (parsed && (parsed.message || parsed.error)) || text || '서버 상태 확인에 실패했습니다.' };
      }
      const result = await response.json().catch(() => ({ success: true }));
      return { success: true, data: result };
    } catch (error) {
      // 네트워크/타임아웃 등은 false 상태로 반환하여 호출자가 안전하게 처리하도록 함
      console.error('checkHealth exception', error);
      return { success: false, message: error.message || String(error) };
    }
  },
};

export default healthApi;
