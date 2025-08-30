// AI 감정 커머스 엔진 - 감정 기반 상품 추천의 핵심
import { emotionAnalysisEngine } from './emotionAnalysis.js';
import { userProfileService } from './userProfile.js';

export class EmotionCommerceEngine {
  constructor() {
    this.emotionEngine = emotionAnalysisEngine;
    this.userProfile = userProfileService;
    
    // 감정-상품 매칭 매트릭스
    this.emotionProductMatrix = {
      불안: {
        categories: ['건강관리', '수면용품', '릴렉스', '아로마', '명상'],
        products: {
          high: ['수면유도기', '아로마디퓨저', '명상앱구독', '안대와귀마개'],
          medium: ['허브차세트', '입욕제', '요가매트', '스트레스볼'],
          low: ['향초', '컬러링북', '퍼즐', '식물']
        },
        keywords: ['안정', '릴렉스', '수면', '진정', '편안함'],
        priceRange: { min: 10000, max: 100000 }
      },
      우울: {
        categories: ['취미용품', '운동기구', '펫용품', '조명', '음악'],
        products: {
          high: ['운동기구', 'LED무드등', '반려식물세트', '취미키트'],
          medium: ['블루투스스피커', '아트클래스', '일기장', '보드게임'],
          low: ['컬러테라피북', '입욕제', '간식세트', '향초']
        },
        keywords: ['기분전환', '활력', '위로', '동기부여', '즐거움'],
        priceRange: { min: 15000, max: 150000 }
      },
      피곤: {
        categories: ['영양제', '수면용품', '마사지기', '커피머신', '건강식품'],
        products: {
          high: ['안마의자', '수면매트리스', '공기청정기', '비타민세트'],
          medium: ['마사지건', '수면안대', '허브차', '영양제'],
          low: ['아이마스크', '목베개', '입욕제', '에너지바']
        },
        keywords: ['회복', '에너지', '휴식', '영양', '수면'],
        priceRange: { min: 20000, max: 200000 }
      },
      행복: {
        categories: ['선물', '파티용품', '여행', '미용', '패션'],
        products: {
          high: ['여행패키지', '명품소품', '체험권', '주얼리'],
          medium: ['향수', '화장품세트', '패션아이템', '와인'],
          low: ['꽃다발', '초콜릿', '카드', '케이크']
        },
        keywords: ['축하', '선물', '공유', '기념', '특별함'],
        priceRange: { min: 30000, max: 300000 }
      },
      분노: {
        categories: ['운동용품', '게임', '스트레스해소', '음악', '취미'],
        products: {
          high: ['복싱글러브세트', '게임콘솔', '드럼세트', '러닝머신'],
          medium: ['스트레스해소용품', '다트', '노래방기기', '펀칭백'],
          low: ['스트레스볼', '버블랩', '슬라임', '피젯토이']
        },
        keywords: ['해소', '발산', '운동', '게임', '취미'],
        priceRange: { min: 10000, max: 200000 }
      }
    };

    // 협업 필터링 시뮬레이션 데이터
    this.collaborativeData = {
      userSimilarity: new Map(),
      itemSimilarity: new Map(),
      userClusters: []
    };

    // A/B 테스트 그룹
    this.abTestGroups = {
      control: { algorithm: 'random', users: [] },
      emotionBased: { algorithm: 'emotion', users: [] },
      hybrid: { algorithm: 'hybrid', users: [] }
    };

    // 성과 메트릭
    this.metrics = {
      totalRecommendations: 0,
      clickThroughRate: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      userSatisfaction: 0,
      returnRate: 0
    };
  }

  // 메인 추천 함수
  async getRecommendations(userInput, options = {}) {
    const startTime = Date.now();
    
    // 1. 감정 분석
    const emotionAnalysis = this.emotionEngine.analyzeEmotion(userInput);
    
    // 2. 사용자 프로필 가져오기
    const userProfile = this.userProfile.getUserProfile();
    
    // 3. 컨텍스트 수집
    const context = this.collectContext();
    
    // 4. 추천 알고리즘 실행
    let recommendations;
    const testGroup = this.determineABTestGroup(userProfile);
    
    switch(testGroup.algorithm) {
      case 'emotion':
        recommendations = this.emotionBasedRecommendation(emotionAnalysis, userProfile, context);
        break;
      case 'hybrid':
        recommendations = this.hybridRecommendation(emotionAnalysis, userProfile, context);
        break;
      default:
        recommendations = this.randomRecommendation();
    }
    
    // 5. 개인화 필터링
    recommendations = this.personalizeRecommendations(recommendations, userProfile);
    
    // 6. 점수 계산 및 정렬
    recommendations = this.scoreAndRank(recommendations, emotionAnalysis, userProfile);
    
    // 7. 결과 후처리
    const finalRecommendations = this.postProcess(recommendations, options);
    
    // 8. 메트릭 업데이트
    this.updateMetrics({
      emotion: emotionAnalysis.dominant,
      recommendations: finalRecommendations,
      processingTime: Date.now() - startTime,
      testGroup: testGroup.algorithm
    });
    
    return {
      emotion: emotionAnalysis,
      recommendations: finalRecommendations,
      metadata: {
        algorithm: testGroup.algorithm,
        processingTime: Date.now() - startTime,
        confidence: this.calculateConfidence(emotionAnalysis, finalRecommendations),
        personalizedScore: this.calculatePersonalizationScore(finalRecommendations, userProfile)
      }
    };
  }

  // 감정 기반 추천
  emotionBasedRecommendation(emotionAnalysis, userProfile, context) {
    const dominantEmotion = emotionAnalysis.dominant;
    const emotionConfig = this.emotionProductMatrix[dominantEmotion];
    
    if (!emotionConfig) {
      return this.getFallbackRecommendations();
    }
    
    const recommendations = [];
    const intensity = this.calculateEmotionIntensity(emotionAnalysis);
    
    // 강도에 따른 상품 선택
    const productLevel = intensity > 70 ? 'high' : intensity > 40 ? 'medium' : 'low';
    const products = emotionConfig.products[productLevel];
    
    // 상품 데이터 생성
    products.forEach((productName, index) => {
      recommendations.push({
        id: `emotion_${dominantEmotion}_${index}`,
        name: productName,
        category: emotionConfig.categories[Math.floor(Math.random() * emotionConfig.categories.length)],
        matchScore: 85 + Math.random() * 15,
        emotionMatch: dominantEmotion,
        price: this.generatePrice(emotionConfig.priceRange),
        reason: `${dominantEmotion} 상태에 도움이 되는 상품`,
        tags: emotionConfig.keywords,
        image: this.generateProductImage(productName)
      });
    });
    
    return recommendations;
  }

  // 하이브리드 추천 (감정 + 협업 필터링)
  hybridRecommendation(emotionAnalysis, userProfile, context) {
    // 감정 기반 추천 (50%)
    const emotionRecs = this.emotionBasedRecommendation(emotionAnalysis, userProfile, context);
    
    // 협업 필터링 추천 (30%)
    const collaborativeRecs = this.collaborativeFilteringRecommendation(userProfile);
    
    // 컨텐츠 기반 추천 (20%)
    const contentRecs = this.contentBasedRecommendation(userProfile);
    
    // 병합 및 가중치 적용
    const merged = new Map();
    
    emotionRecs.forEach(rec => {
      rec.weight = 0.5;
      merged.set(rec.id, rec);
    });
    
    collaborativeRecs.forEach(rec => {
      if (merged.has(rec.id)) {
        merged.get(rec.id).weight += 0.3;
      } else {
        rec.weight = 0.3;
        merged.set(rec.id, rec);
      }
    });
    
    contentRecs.forEach(rec => {
      if (merged.has(rec.id)) {
        merged.get(rec.id).weight += 0.2;
      } else {
        rec.weight = 0.2;
        merged.set(rec.id, rec);
      }
    });
    
    return Array.from(merged.values()).sort((a, b) => b.weight - a.weight);
  }

  // 협업 필터링 추천
  collaborativeFilteringRecommendation(userProfile) {
    // 유사 사용자 찾기 (시뮬레이션)
    const similarUsers = this.findSimilarUsers(userProfile);
    const recommendations = [];
    
    // 유사 사용자들이 구매한 상품 추천
    similarUsers.forEach(userId => {
      const userPurchases = this.getSimulatedUserPurchases(userId);
      userPurchases.forEach(product => {
        recommendations.push({
          ...product,
          reason: '비슷한 사용자들이 구매한 상품',
          matchScore: 70 + Math.random() * 20
        });
      });
    });
    
    return recommendations.slice(0, 5);
  }

  // 컨텐츠 기반 추천
  contentBasedRecommendation(userProfile) {
    const recommendations = [];
    const preferredCategories = Object.keys(userProfile.preferences.categories || {});
    
    preferredCategories.forEach(category => {
      recommendations.push({
        id: `content_${category}_${Date.now()}`,
        name: `${category} 추천 상품`,
        category: category,
        matchScore: 60 + Math.random() * 30,
        reason: '관심 카테고리 기반 추천'
      });
    });
    
    return recommendations;
  }

  // 개인화 필터링
  personalizeRecommendations(recommendations, userProfile) {
    return recommendations.map(rec => {
      let personalScore = rec.matchScore || 50;
      
      // 예산 맞춤
      if (userProfile.preferences.budget) {
        const budget = userProfile.preferences.budget;
        if (rec.price >= budget.min && rec.price <= budget.max) {
          personalScore += 10;
        }
      }
      
      // 선호 브랜드
      if (userProfile.preferences.brands && userProfile.preferences.brands[rec.brand]) {
        personalScore += userProfile.preferences.brands[rec.brand] * 10;
      }
      
      // 라이프스타일 매칭
      if (userProfile.lifestyle && rec.lifestyle) {
        const matchCount = rec.lifestyle.filter(l => 
          userProfile.lifestyle.hobbies?.includes(l)
        ).length;
        personalScore += matchCount * 5;
      }
      
      return {
        ...rec,
        personalScore: Math.min(100, personalScore)
      };
    });
  }

  // 점수 계산 및 정렬
  scoreAndRank(recommendations, emotionAnalysis, userProfile) {
    return recommendations
      .map(rec => {
        const emotionScore = rec.emotionMatch === emotionAnalysis.dominant ? 30 : 0;
        const personalScore = rec.personalScore || 0;
        const baseScore = rec.matchScore || 50;
        
        const totalScore = (baseScore * 0.4) + (emotionScore * 0.3) + (personalScore * 0.3);
        
        return {
          ...rec,
          totalScore: Math.round(totalScore)
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }

  // 컨텍스트 수집
  collectContext() {
    const now = new Date();
    return {
      time: now.getHours(),
      dayOfWeek: now.getDay(),
      season: this.getSeason(),
      weather: this.getWeatherContext(),
      location: this.getLocationContext()
    };
  }

  // 계절 정보
  getSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  // 날씨 컨텍스트 (시뮬레이션)
  getWeatherContext() {
    const weathers = ['sunny', 'cloudy', 'rainy', 'snowy'];
    return weathers[Math.floor(Math.random() * weathers.length)];
  }

  // 위치 컨텍스트 (시뮬레이션)
  getLocationContext() {
    return 'home'; // 실제로는 GPS나 IP 기반으로 판단
  }

  // A/B 테스트 그룹 결정
  determineABTestGroup(userProfile) {
    // 사용자 ID 기반으로 그룹 할당 (시뮬레이션)
    const userId = userProfile.id || Math.random().toString();
    const hash = this.hashCode(userId);
    const groupIndex = Math.abs(hash) % 3;
    
    const groups = ['control', 'emotionBased', 'hybrid'];
    return this.abTestGroups[groups[groupIndex]];
  }

  // 해시 함수
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  // 감정 강도 계산
  calculateEmotionIntensity(emotionAnalysis) {
    return emotionAnalysis.confidence || 50;
  }

  // 가격 생성
  generatePrice(priceRange) {
    return Math.floor(
      priceRange.min + Math.random() * (priceRange.max - priceRange.min)
    );
  }

  // 상품 이미지 생성 (시뮬레이션)
  generateProductImage(productName) {
    return `https://via.placeholder.com/300x300?text=${encodeURIComponent(productName)}`;
  }

  // 폴백 추천
  getFallbackRecommendations() {
    return [
      {
        id: 'fallback_1',
        name: '베스트셀러 상품',
        category: '인기상품',
        matchScore: 50,
        reason: '많은 사용자가 선택한 상품'
      }
    ];
  }

  // 유사 사용자 찾기 (시뮬레이션)
  findSimilarUsers(userProfile) {
    // 실제로는 코사인 유사도 등을 계산
    return ['user_sim_1', 'user_sim_2', 'user_sim_3'];
  }

  // 시뮬레이션 사용자 구매 이력
  getSimulatedUserPurchases(userId) {
    return [
      {
        id: `sim_product_${userId}_1`,
        name: '시뮬레이션 추천 상품',
        category: '추천',
        price: 50000
      }
    ];
  }

  // 신뢰도 계산
  calculateConfidence(emotionAnalysis, recommendations) {
    const emotionConfidence = emotionAnalysis.confidence || 50;
    const recCount = recommendations.length;
    const avgScore = recommendations.reduce((sum, rec) => sum + (rec.totalScore || 0), 0) / recCount;
    
    return Math.round((emotionConfidence * 0.5) + (avgScore * 0.5));
  }

  // 개인화 점수 계산
  calculatePersonalizationScore(recommendations, userProfile) {
    const profileCompleteness = this.calculateProfileCompleteness(userProfile);
    const relevantRecs = recommendations.filter(rec => 
      rec.personalScore && rec.personalScore > 70
    ).length;
    
    return Math.round(
      (profileCompleteness * 0.3) + 
      ((relevantRecs / recommendations.length) * 100 * 0.7)
    );
  }

  // 프로필 완성도 계산
  calculateProfileCompleteness(userProfile) {
    let filledFields = 0;
    let totalFields = 0;
    
    const checkObject = (obj) => {
      for (const key in obj) {
        totalFields++;
        if (obj[key] !== null && obj[key] !== undefined) {
          if (Array.isArray(obj[key]) && obj[key].length > 0) {
            filledFields++;
          } else if (typeof obj[key] === 'object') {
            checkObject(obj[key]);
          } else if (obj[key]) {
            filledFields++;
          }
        }
      }
    };
    
    checkObject(userProfile);
    return totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
  }

  // 후처리
  postProcess(recommendations, options) {
    let processed = [...recommendations];
    
    // 개수 제한
    if (options.limit) {
      processed = processed.slice(0, options.limit);
    }
    
    // 카테고리 필터
    if (options.category) {
      processed = processed.filter(rec => rec.category === options.category);
    }
    
    // 가격 필터
    if (options.priceRange) {
      processed = processed.filter(rec => 
        rec.price >= options.priceRange.min && 
        rec.price <= options.priceRange.max
      );
    }
    
    return processed;
  }

  // 메트릭 업데이트
  updateMetrics(data) {
    this.metrics.totalRecommendations++;
    
    // 실제로는 사용자 행동 추적 필요
    // 여기서는 시뮬레이션
    if (Math.random() > 0.7) {
      this.metrics.clickThroughRate = 
        (this.metrics.clickThroughRate * (this.metrics.totalRecommendations - 1) + 1) / 
        this.metrics.totalRecommendations;
    }
    
    if (Math.random() > 0.85) {
      this.metrics.conversionRate = 
        (this.metrics.conversionRate * (this.metrics.totalRecommendations - 1) + 1) / 
        this.metrics.totalRecommendations;
    }
  }

  // 성과 메트릭 가져오기
  getPerformanceMetrics() {
    return {
      ...this.metrics,
      abTestResults: this.getABTestResults()
    };
  }

  // A/B 테스트 결과
  getABTestResults() {
    const results = {};
    
    for (const [groupName, group] of Object.entries(this.abTestGroups)) {
      results[groupName] = {
        algorithm: group.algorithm,
        userCount: group.users.length,
        conversionRate: Math.random() * 0.15 + 0.05, // 5-20% 시뮬레이션
        avgOrderValue: Math.random() * 50000 + 30000,
        satisfactionScore: Math.random() * 2 + 3 // 3-5점
      };
    }
    
    return results;
  }
}

// 싱글톤 인스턴스
export const emotionCommerceEngine = new EmotionCommerceEngine();