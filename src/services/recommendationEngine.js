// 개인화 추천 엔진
import { userProfileService } from './userProfile.js';

export class RecommendationEngine {
  constructor() {
    this.productDatabase = this.initializeProductDatabase();
    this.userProfile = userProfileService;
  }

  // 실제 상품 데이터베이스 (실제로는 API나 DB에서 가져올 데이터)
  initializeProductDatabase() {
    return [
      {
        id: "trash_can_01",
        name: "놀더틈 강력 압축 휴지통",
        category: "생활용품",
        subCategory: "정리수납", 
        price: 33500,
        originalPrice: 45000,
        brand: "놀더틈",
        tags: ["압축", "공간절약", "원룸추천"],
        targetAge: [20, 30, 40],
        targetLiving: ["원룸", "오피스텔", "소형아파트"],
        solvedProblems: ["공간부족", "정리정돈"],
        lifestyle: ["미니멀", "실용성"],
        difficulty: "쉬움",
        mainBenefits: ["공간절약", "편리성", "깔끔함"],
        image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=800&fit=crop",
        rating: 4.5,
        reviewCount: 1250,
        realUserReviews: [
          "원룸에서 쓰기 정말 좋아요! 공간이 많이 절약됨",
          "압축 기능이 생각보다 강력해서 만족",
          "디자인도 깔끔하고 기능도 좋음"
        ]
      },
      {
        id: "air_fryer_01", 
        name: "필립스 에어프라이어 HD9200",
        category: "가전제품",
        subCategory: "주방가전",
        price: 189000,
        originalPrice: 220000,
        brand: "필립스",
        tags: ["간편요리", "건강요리", "원룸추천"],
        targetAge: [20, 30, 40],
        targetLiving: ["원룸", "오피스텔", "소형아파트"],
        solvedProblems: ["시간부족", "요리어려움"],
        lifestyle: ["편의성", "건강관리"],
        cookingSkillRequired: "초보",
        mainBenefits: ["간편함", "건강요리", "공간절약"],
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=800&fit=crop",
        rating: 4.7,
        reviewCount: 3200,
        realUserReviews: [
          "요리 못하는 저도 쉽게 맛있게 만들어요",
          "기름 없이도 바삭하게 잘 나와요",
          "원룸에서 쓰기 딱 좋은 크기"
        ]
      },
      {
        id: "desk_setup_01",
        name: "이케아 데스크 정리용품 세트",
        category: "가구/인테리어",
        subCategory: "사무용품", 
        price: 45000,
        originalPrice: 55000,
        brand: "이케아",
        tags: ["재택근무", "정리정돈", "미니멀"],
        targetAge: [20, 30, 40],
        workStyle: ["재택근무", "프리랜서", "학생"],
        solvedProblems: ["공간부족", "정리정돈"],
        lifestyle: ["미니멀", "효율성"],
        mainBenefits: ["정리정돈", "생산성향상", "깔끔함"],
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=800&fit=crop",
        rating: 4.3,
        reviewCount: 890,
        realUserReviews: [
          "재택근무 환경이 훨씬 깔끔해졌어요",
          "작은 물건들 정리하기 정말 좋음",
          "가성비 좋고 디자인도 심플해서 만족"
        ]
      },
      {
        id: "exercise_01",
        name: "홈트레이닝 매트 요가매트",
        category: "스포츠/레저", 
        subCategory: "운동용품",
        price: 25000,
        originalPrice: 35000,
        brand: "리복",
        tags: ["홈트", "요가", "운동"],
        targetAge: [20, 30, 40], 
        hobbies: ["운동", "요가", "필라테스"],
        solvedProblems: ["운동부족", "공간부족"],
        lifestyle: ["건강관리", "홈트레이닝"],
        spaceRequired: "소형",
        mainBenefits: ["건강관리", "공간효율", "경제성"],
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=800&fit=crop",
        rating: 4.4,
        reviewCount: 1650,
        realUserReviews: [
          "집에서 운동하기 딱 좋아요",
          "두께감도 적당하고 미끄럽지 않음", 
          "원룸에 딱 맞는 사이즈"
        ]
      },
      {
        id: "skincare_01",
        name: "세타필 순한 세안제",
        category: "뷰티/개인케어",
        subCategory: "세안제품",
        price: 15000,
        originalPrice: 18000, 
        brand: "세타필",
        tags: ["민감성", "순한성분", "데일리"],
        targetAge: [20, 30],
        skinType: ["민감성", "건성", "복합성"],
        solvedProblems: ["피부고민", "시간부족"],
        lifestyle: ["간편케어", "안전성"],
        mainBenefits: ["순한성분", "간편함", "효과적"],
        image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&h=800&fit=crop",
        rating: 4.6,
        reviewCount: 2100,
        realUserReviews: [
          "민감한 피부도 트러블 없이 사용 가능",
          "거품도 잘 나고 촉촉해요",
          "가격대비 정말 좋은 제품"
        ]
      }
    ];
  }

  // 개인화된 상품 추천 메인 함수
  async getPersonalizedRecommendations(context = {}) {
    const userProfile = this.userProfile.getProfile();
    const interactions = this.userProfile.getInteractions();
    
    // 각 상품에 대한 개인화 점수 계산
    const scoredProducts = this.productDatabase.map(product => ({
      ...product,
      personalizedScore: this.calculatePersonalizedScore(product, userProfile, interactions, context)
    }));

    // 점수 기준으로 정렬하고 상위 추천 반환
    const recommendations = scoredProducts
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
      .slice(0, 10)
      .map(product => ({
        ...product,
        recommendationReason: this.generateRecommendationReason(product, userProfile, context)
      }));

    return recommendations;
  }

  // 개인화 점수 계산 알고리즘
  calculatePersonalizedScore(product, userProfile, interactions, context) {
    let score = 0;
    
    // 1. 기본 인기도 점수 (20점)
    score += (product.rating / 5) * 20;

    // 2. 나이 맞춤 점수 (15점)
    if (userProfile.demographics.age && product.targetAge) {
      if (product.targetAge.includes(Math.floor(userProfile.demographics.age / 10) * 10)) {
        score += 15;
      }
    }

    // 3. 거주 형태 맞춤 점수 (15점)
    if (userProfile.demographics.livingType && product.targetLiving) {
      if (product.targetLiving.includes(userProfile.demographics.livingType)) {
        score += 15;
      }
    }

    // 4. 라이프스타일 맞춤 점수 (20점)
    if (userProfile.lifestyle.hobbies && product.hobbies) {
      const matchingHobbies = userProfile.lifestyle.hobbies.filter(hobby => 
        product.hobbies.includes(hobby)
      ).length;
      score += (matchingHobbies / Math.max(product.hobbies.length, 1)) * 20;
    }

    // 5. 문제 해결 점수 (15점)  
    if (userProfile.context.problems && product.solvedProblems) {
      const solvedProblems = userProfile.context.problems.filter(problem =>
        product.solvedProblems.includes(problem)
      ).length;
      score += (solvedProblems / userProfile.context.problems.length) * 15;
    }

    // 6. 예산 맞춤 점수 (10점)
    if (userProfile.preferences.budget.preferred) {
      const budgetMatch = Math.max(0, 1 - Math.abs(product.price - userProfile.preferences.budget.preferred) / userProfile.preferences.budget.preferred);
      score += budgetMatch * 10;
    }

    // 7. 과거 상호작용 기반 점수 (15점)
    const categoryInteractionScore = this.getCategoryInteractionScore(product.category, interactions);
    score += categoryInteractionScore;

    // 8. 컨텍스트 기반 보너스 점수 (10점)
    if (context.mood === 'excited' && product.tags.includes('신제품')) {
      score += 5;
    }
    if (context.mood === 'stressed' && product.tags.includes('간편')) {
      score += 5; 
    }

    return Math.min(100, score); // 최대 100점으로 제한
  }

  // 카테고리별 상호작용 점수 계산
  getCategoryInteractionScore(category, interactions) {
    let score = 0;
    
    // 좋아요한 제품들의 카테고리 
    const likedCategories = interactions.likes.map(like => like.product.category);
    const categoryLikes = likedCategories.filter(cat => cat === category).length;
    score += categoryLikes * 3;

    // 조회한 제품들의 카테고리
    const viewedCategories = interactions.productViews.map(view => view.product.category);
    const categoryViews = viewedCategories.filter(cat => cat === category).length;
    score += categoryViews * 1;

    return Math.min(15, score);
  }

  // 추천 이유 생성
  generateRecommendationReason(product, userProfile, context) {
    const reasons = [];

    // 나이 기반 이유
    if (userProfile.demographics.age && product.targetAge) {
      if (product.targetAge.includes(Math.floor(userProfile.demographics.age / 10) * 10)) {
        reasons.push(`${Math.floor(userProfile.demographics.age / 10) * 10}대에게 인기 많은 제품`);
      }
    }

    // 거주 형태 기반 이유
    if (userProfile.demographics.livingType && product.targetLiving) {
      if (product.targetLiving.includes(userProfile.demographics.livingType)) {
        reasons.push(`${userProfile.demographics.livingType} 거주자에게 최적화`);
      }
    }

    // 문제 해결 기반 이유
    if (userProfile.context.problems && product.solvedProblems) {
      const matchingProblems = userProfile.context.problems.filter(problem =>
        product.solvedProblems.includes(problem)
      );
      if (matchingProblems.length > 0) {
        reasons.push(`${matchingProblems[0]} 해결에 도움`);
      }
    }

    // 라이프스타일 기반 이유  
    if (userProfile.lifestyle.hobbies && product.hobbies) {
      const matchingHobbies = userProfile.lifestyle.hobbies.filter(hobby => 
        product.hobbies.includes(hobby)
      );
      if (matchingHobbies.length > 0) {
        reasons.push(`${matchingHobbies[0]} 취향에 맞춤`);
      }
    }

    // 기본 이유
    if (reasons.length === 0) {
      reasons.push(`평점 ${product.rating}점의 인기 상품`);
    }

    return reasons.slice(0, 2).join(', '); // 최대 2개 이유만 표시
  }

  // 사용자 맞춤 검색
  searchPersonalized(query, limit = 5) {
    const userProfile = this.userProfile.getProfile();
    
    // 기본 텍스트 매칭
    const matchingProducts = this.productDatabase.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );

    // 개인화 점수로 정렬
    return matchingProducts
      .map(product => ({
        ...product,
        personalizedScore: this.calculatePersonalizedScore(product, userProfile, this.userProfile.getInteractions(), {})
      }))
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
      .slice(0, limit);
  }

  // 카테고리별 맞춤 추천
  getRecommendationsByCategory(category, limit = 5) {
    const userProfile = this.userProfile.getProfile();
    const interactions = this.userProfile.getInteractions();
    
    const categoryProducts = this.productDatabase.filter(product => 
      product.category === category || product.subCategory === category
    );

    return categoryProducts
      .map(product => ({
        ...product,
        personalizedScore: this.calculatePersonalizedScore(product, userProfile, interactions, {}),
        recommendationReason: this.generateRecommendationReason(product, userProfile, {})
      }))
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
      .slice(0, limit);
  }

  // 사용자 프로필 완성을 위한 질문 생성
  generateProfileQuestions() {
    const profile = this.userProfile.getProfile();
    const questions = [];

    if (!profile.demographics.age) {
      questions.push({
        type: 'age',
        question: '나이가 어떻게 되시나요? (추천 정확도를 높이기 위해)',
        options: ['10대', '20대', '30대', '40대', '50대 이상']
      });
    }

    if (!profile.demographics.livingType) {
      questions.push({
        type: 'living',
        question: '어떤 곳에서 살고 계시나요?',
        options: ['원룸/오피스텔', '아파트', '빌라', '주택']
      });
    }

    if (profile.lifestyle.hobbies.length === 0) {
      questions.push({
        type: 'hobbies', 
        question: '평소 어떤 것에 관심이 많으신가요?',
        options: ['요리', '운동', '게임', '독서', '영화감상', '여행', '인테리어']
      });
    }

    if (!profile.preferences.budget.preferred) {
      questions.push({
        type: 'budget',
        question: '주로 얼마 정도의 상품을 구매하시나요?',
        options: ['1만원 이하', '1-5만원', '5-10만원', '10-20만원', '20만원 이상']
      });
    }

    return questions.slice(0, 1); // 한 번에 하나씩만 질문
  }
}

// 싱글톤 인스턴스
export const recommendationEngine = new RecommendationEngine();