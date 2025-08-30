// API 기본 URL
const API_BASE_URL = 'http://localhost:8090/api';

// 상품 관련 API 함수들
const productApi = {
  // 모든 상품 목록 가져오기
  getAllProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
  // 서버가 에러를 반환하면 그대로 예외로 처리
        const errorData = await response.json();
        throw new Error(errorData.message || '상품 목록을 가져오는데 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 특정 상품 상세 정보 가져오기
  getProductById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '상품 상세 정보를 가져오는데 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 카테고리별 상품 목록 가져오기
  getProductsByCategory: async (category) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/category/${category}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '카테고리별 상품 목록을 가져오는데 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },

  // 상품 검색
  searchProducts: async (keyword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/search?keyword=${encodeURIComponent(keyword)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '상품 검색에 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  },
};

export default productApi;
