// API 기본 URL
const API_BASE_URL = 'http://localhost:8090/api';

// 콘텐츠 관련 API 함수들
const contentApi = {
  // 모든 콘텐츠 목록 가져오기
  getAllContents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contents`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '콘텐츠 목록을 가져오는데 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 특정 콘텐츠 상세 정보 가져오기
  getContentById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contents/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '콘텐츠 상세 정보를 가져오는데 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 유형별 콘텐츠 목록 가져오기
  getContentsByType: async (type) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contents/type/${type}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '유형별 콘텐츠 목록을 가져오는데 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 장르별 콘텐츠 목록 가져오기
  getContentsByGenre: async (genre) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contents/genre/${genre}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '장르별 콘텐츠 목록을 가져오는데 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 크리에이터별 콘텐츠 목록 가져오기
  getContentsByCreator: async (creator) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contents/creator/${creator}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '크리에이터별 콘텐츠 목록을 가져오는데 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 콘텐츠 검색
  searchContents: async (keyword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contents/search?keyword=${encodeURIComponent(keyword)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '콘텐츠 검색에 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 감정 태그별 콘텐츠 가져오기
  getContentsByEmotion: async (emotionTag) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contents/emotion/${emotionTag}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '감정 태그별 콘텐츠를 가져오는데 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 유형별 인기 콘텐츠 가져오기
  getTopRatedContents: async (type) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contents/top-rated/${type}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '인기 콘텐츠를 가져오는데 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 콘텐츠 추천
  recommendContents: async (emotion, genre = null) => {
    try {
      let url = `${API_BASE_URL}/contents/recommend?emotion=${emotion}`;
      if (genre) url += `&genre=${genre}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '콘텐츠 추천에 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 최신 콘텐츠 목록 가져오기
  getLatestContents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contents/latest`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '최신 콘텐츠 목록을 가져오는데 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 로컬 동영상 목록 가져오기
  getLocalVideos: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/list`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '로컬 동영상 목록을 가져오는데 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 감정에 따른 로컬 동영상 추천
  getLocalVideoRecommendations: async (emotion) => {
    try {
      const response = await fetch(`${API_BASE_URL}/videos/recommend/${emotion}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '로컬 동영상 추천에 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },
};

export default contentApi;
