// API 기본 URL
const API_BASE_URL = 'http://localhost:8090/api';

// 상품 관련 API 함수들
const productApi = {
  // 모든 상품 목록 가져오기
  getAllProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        if (response.status === 404) {
          // 백엔드 서버가 실행되지 않는 경우, 개발 모드에서 모킹 데이터 사용
          console.warn("백엔드 서버가 실행되지 않아 상품 목록 모킹 데이터를 사용합니다.");
          return {
            success: true,
            message: "상품 목록을 성공적으로 가져왔습니다.",
            data: [],
          };
        }
        const errorData = await response.json();
        throw new Error(errorData.message || '상품 목록을 가져오는데 실패했습니다.');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('상품 목록 가져오기 오류:', error);
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
      console.error('상품 상세 정보 가져오기 오류:', error);
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
      console.error('카테고리별 상품 목록 가져오기 오류:', error);
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
      console.error('상품 검색 오류:', error);
      throw error;
    }
  },
};

export default productApi;
