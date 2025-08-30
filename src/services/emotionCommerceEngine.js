// AI 감정 커머스 엔진 - 감정 기반 상품 추천의 핵심
import { emotionAnalysisEngine } from './emotionAnalysis.js';
import { userProfileService } from './userProfile.js';

export class EmotionCommerceEngine {
  constructor() {
    this.emotionEngine = emotionAnalysisEngine;
    this.userProfile = userProfileService;
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
    
    // 기본 추천 상품
    const recommendations = [
      {
        id: `emotion_${dominantEmotion}_${Date.now()}`,
        name: `${dominantEmotion} 관련 상품`,
        category: '추천',
        matchScore: 50,
        emotionMatch: dominantEmotion,
        price: 50000,
        reason: `${dominantEmotion} 상태에 도움이 되는 상품`,
        tags: [dominantEmotion],
        image: `https://via.placeholder.com/300x300?text=${encodeURIComponent(dominantEmotion)}`
      }
    ];
    
    return recommendations;
  }

  // 하이브리드 추천 (감정 + 협업 필터링)
  hybridRecommendation(emotionAnalysis, userProfile, context) {
    // 감정 기반 추천
    const emotionRecs = this.emotionBasedRecommendation(emotionAnalysis, userProfile, context);
    
    // 컨텐츠 기반 추천
    const contentRecs = this.contentBasedRecommendation(userProfile);
    
    // 병합
    const merged = new Map();
    
    emotionRecs.forEach(rec => {
      rec.weight = 0.7;
      merged.set(rec.id, rec);
    });
    
    contentRecs.forEach(rec => {
      if (merged.has(rec.id)) {
        merged.get(rec.id).weight += 0.3;
      } else {
        rec.weight = 0.3;
        merged.set(rec.id, rec);
      }
    });
    
    return Array.from(merged.values()).sort((a, b) => b.weight - a.weight);
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
    // 기본 그룹 반환
    return { algorithm: 'emotion' };
  }



  // 감정 강도 계산
  calculateEmotionIntensity(emotionAnalysis) {
    return emotionAnalysis.confidence || 50;
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
    // 메트릭 업데이트 로직 제거
  }

  // 성과 메트릭 가져오기
  getPerformanceMetrics() {
    return {
      totalRecommendations: 0,
      clickThroughRate: 0,
      conversionRate: 0
    };
  }


}

// 싱글톤 인스턴스
export const emotionCommerceEngine = new EmotionCommerceEngine();