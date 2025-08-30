// 개인화 추천 엔진
import { userProfileService } from './userProfile.js';

export class RecommendationEngine {
  constructor() {
    this.productDatabase = this.initializeProductDatabase();
    this.userProfile = userProfileService;
  }

  // 실제 상품 데이터베이스 (실제로는 API나 DB에서 가져올 데이터)
  initializeProductDatabase() {
    return [];
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
    const likedCategories = (interactions.likes || []).map(like => like.product?.category);
    const categoryLikes = likedCategories.filter(cat => cat === category).length;
    score += categoryLikes * 3;

    // 조회한 제품들의 카테고리
    const viewedCategories = (interactions.productViews || []).map(view => view.product?.category);
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