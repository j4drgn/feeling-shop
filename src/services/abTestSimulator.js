// A/B 테스트 시뮬레이션 데이터 생성기
export class ABTestSimulator {
  constructor() {
    this.testGroups = ['control', 'emotionBased', 'hybrid'];
    this.emotions = ['불안', '우울', '피곤', '행복', '분노', '평온'];
    this.simulationData = [];
  }

  // 대규모 시뮬레이션 데이터 생성
  generateSimulationData(numUsers = 1000, daysToSimulate = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToSimulate);
    
    const data = {
      users: [],
      sessions: [],
      interactions: [],
      purchases: [],
      feedbacks: [],
      metrics: {
        byGroup: {},
        byEmotion: {},
        byTime: {},
        overall: {}
      }
    };

    // 각 테스트 그룹별 사용자 생성
    for (let i = 0; i < numUsers; i++) {
      const user = this.generateUser(i);
      data.users.push(user);
      
      // 사용자별 세션 생성
      const numSessions = Math.floor(Math.random() * 10) + 1;
      for (let j = 0; j < numSessions; j++) {
        const session = this.generateSession(user, startDate, daysToSimulate);
        data.sessions.push(session);
        
        // 세션별 상호작용 생성
        const interactions = this.generateInteractions(session);
        data.interactions.push(...interactions);
        
        // 구매 데이터 생성 (확률적)
        if (Math.random() < this.getConversionProbability(user.testGroup)) {
          const purchase = this.generatePurchase(session, interactions);
          data.purchases.push(purchase);
          
          // 피드백 생성 (구매 후 50% 확률)
          if (Math.random() < 0.5) {
            const feedback = this.generateFeedback(purchase, session);
            data.feedbacks.push(feedback);
          }
        }
      }
    }
    
    // 메트릭 계산
    data.metrics = this.calculateMetrics(data);
    
    this.simulationData = data;
    return data;
  }

  // 사용자 생성
  generateUser(id) {
    const testGroup = this.testGroups[id % 3];
    
    return {
      userId: `user_${id}`,
      testGroup: testGroup,
      demographics: {
        age: 20 + Math.floor(Math.random() * 30),
        gender: Math.random() > 0.5 ? 'M' : 'F',
        location: this.getRandomLocation()
      },
      personality: {
        dominantEmotion: this.emotions[Math.floor(Math.random() * this.emotions.length)],
        shoppingStyle: this.getRandomShoppingStyle(),
        pricePreference: this.getRandomPricePreference()
      },
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
    };
  }

  // 세션 생성
  generateSession(user, startDate, daysRange) {
    const sessionDate = new Date(startDate);
    sessionDate.setDate(sessionDate.getDate() + Math.floor(Math.random() * daysRange));
    
    const emotion = this.getSessionEmotion(user);
    
    return {
      sessionId: `session_${user.userId}_${Date.now()}_${Math.random()}`,
      userId: user.userId,
      testGroup: user.testGroup,
      startTime: sessionDate,
      duration: Math.floor(Math.random() * 30) + 5, // 5-35분
      emotion: emotion,
      device: this.getRandomDevice(),
      source: this.getRandomSource()
    };
  }

  // 상호작용 생성
  generateInteractions(session) {
    const interactions = [];
    const numInteractions = Math.floor(Math.random() * 15) + 3;
    
    for (let i = 0; i < numInteractions; i++) {
      interactions.push({
        interactionId: `interaction_${session.sessionId}_${i}`,
        sessionId: session.sessionId,
        type: this.getRandomInteractionType(),
        timestamp: new Date(session.startTime.getTime() + i * 60000),
        productId: `product_${Math.floor(Math.random() * 100)}`,
        emotionMatch: session.emotion === this.getProductEmotion() ? 1 : 0,
        score: Math.random()
      });
    }
    
    return interactions;
  }

  // 구매 생성
  generatePurchase(session, interactions) {
    const selectedProduct = interactions[Math.floor(Math.random() * interactions.length)];
    
    return {
      purchaseId: `purchase_${session.sessionId}`,
      sessionId: session.sessionId,
      userId: session.userId,
      productId: selectedProduct.productId,
      timestamp: new Date(session.startTime.getTime() + session.duration * 60000),
      amount: this.getRandomPrice(),
      emotion: session.emotion,
      testGroup: session.testGroup,
      recommendationScore: selectedProduct.score,
      emotionMatch: selectedProduct.emotionMatch
    };
  }

  // 피드백 생성
  generateFeedback(purchase, session) {
    const emotionImprovement = session.testGroup === 'emotionBased' ? 0.7 : 
                               session.testGroup === 'hybrid' ? 0.8 : 0.5;
    
    return {
      feedbackId: `feedback_${purchase.purchaseId}`,
      purchaseId: purchase.purchaseId,
      userId: purchase.userId,
      rating: Math.floor(Math.random() * 3) + 3, // 3-5점
      emotionBefore: session.emotion,
      emotionAfter: Math.random() < emotionImprovement ? '행복' : session.emotion,
      emotionChangeScore: Math.random() * 100 - 20, // -20 to 80
      comment: this.getRandomComment(),
      timestamp: new Date(purchase.timestamp.getTime() + 24 * 60 * 60 * 1000)
    };
  }

  // 메트릭 계산
  calculateMetrics(data) {
    const metrics = {
      byGroup: {},
      byEmotion: {},
      byTime: {},
      overall: {}
    };
    
    // 그룹별 메트릭
    this.testGroups.forEach(group => {
      const groupSessions = data.sessions.filter(s => s.testGroup === group);
      const groupPurchases = data.purchases.filter(p => p.testGroup === group);
      const groupFeedbacks = data.feedbacks.filter(f => 
        groupPurchases.some(p => p.purchaseId === f.purchaseId)
      );
      
      metrics.byGroup[group] = {
        sessions: groupSessions.length,
        purchases: groupPurchases.length,
        conversionRate: groupSessions.length > 0 ? 
          (groupPurchases.length / groupSessions.length * 100).toFixed(2) : 0,
        averageOrderValue: groupPurchases.length > 0 ?
          (groupPurchases.reduce((sum, p) => sum + p.amount, 0) / groupPurchases.length).toFixed(0) : 0,
        averageRating: groupFeedbacks.length > 0 ?
          (groupFeedbacks.reduce((sum, f) => sum + f.rating, 0) / groupFeedbacks.length).toFixed(2) : 0,
        emotionImprovement: groupFeedbacks.length > 0 ?
          (groupFeedbacks.filter(f => f.emotionAfter === '행복').length / groupFeedbacks.length * 100).toFixed(2) : 0
      };
    });
    
    // 감정별 메트릭
    this.emotions.forEach(emotion => {
      const emotionSessions = data.sessions.filter(s => s.emotion === emotion);
      const emotionPurchases = data.purchases.filter(p => p.emotion === emotion);
      
      metrics.byEmotion[emotion] = {
        sessions: emotionSessions.length,
        purchases: emotionPurchases.length,
        conversionRate: emotionSessions.length > 0 ?
          (emotionPurchases.length / emotionSessions.length * 100).toFixed(2) : 0,
        averageOrderValue: emotionPurchases.length > 0 ?
          (emotionPurchases.reduce((sum, p) => sum + p.amount, 0) / emotionPurchases.length).toFixed(0) : 0
      };
    });
    
    // 시간대별 메트릭
    const hourlyMetrics = {};
    data.sessions.forEach(session => {
      const hour = session.startTime.getHours();
      if (!hourlyMetrics[hour]) {
        hourlyMetrics[hour] = { sessions: 0, purchases: 0 };
      }
      hourlyMetrics[hour].sessions++;
    });
    
    data.purchases.forEach(purchase => {
      const hour = purchase.timestamp.getHours();
      if (hourlyMetrics[hour]) {
        hourlyMetrics[hour].purchases++;
      }
    });
    
    metrics.byTime = hourlyMetrics;
    
    // 전체 메트릭
    metrics.overall = {
      totalUsers: data.users.length,
      totalSessions: data.sessions.length,
      totalPurchases: data.purchases.length,
      overallConversionRate: (data.purchases.length / data.sessions.length * 100).toFixed(2),
      totalRevenue: data.purchases.reduce((sum, p) => sum + p.amount, 0),
      averageSessionDuration: (data.sessions.reduce((sum, s) => sum + s.duration, 0) / data.sessions.length).toFixed(1),
      feedbackRate: (data.feedbacks.length / data.purchases.length * 100).toFixed(2)
    };
    
    return metrics;
  }

  // 전환 확률 (그룹별 차별화)
  getConversionProbability(testGroup) {
    switch(testGroup) {
      case 'emotionBased':
        return 0.18; // 18% 전환율
      case 'hybrid':
        return 0.22; // 22% 전환율
      default:
        return 0.12; // 12% 전환율 (control)
    }
  }

  // 세션 감정 (사용자 성향 반영)
  getSessionEmotion(user) {
    // 70% 확률로 사용자의 주요 감정, 30% 확률로 랜덤
    if (Math.random() < 0.7) {
      return user.personality.dominantEmotion;
    }
    return this.emotions[Math.floor(Math.random() * this.emotions.length)];
  }

  // 랜덤 헬퍼 함수들
  getRandomLocation() {
    const locations = ['서울', '경기', '부산', '대구', '인천', '광주', '대전'];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  getRandomShoppingStyle() {
    const styles = ['신중한편', '충동구매', '할인선호', '품질우선', '트렌드추구'];
    return styles[Math.floor(Math.random() * styles.length)];
  }

  getRandomPricePreference() {
    const preferences = ['저가', '중가', '고가', '가성비'];
    return preferences[Math.floor(Math.random() * preferences.length)];
  }

  getRandomDevice() {
    const devices = ['mobile', 'desktop', 'tablet'];
    const weights = [0.6, 0.3, 0.1];
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < devices.length; i++) {
      sum += weights[i];
      if (random < sum) return devices[i];
    }
    return devices[0];
  }

  getRandomSource() {
    const sources = ['direct', 'search', 'social', 'email', 'referral'];
    return sources[Math.floor(Math.random() * sources.length)];
  }

  getRandomInteractionType() {
    const types = ['view', 'click', 'add_to_cart', 'remove_from_cart', 'wishlist'];
    return types[Math.floor(Math.random() * types.length)];
  }

  getProductEmotion() {
    return this.emotions[Math.floor(Math.random() * this.emotions.length)];
  }

  getRandomPrice() {
    return Math.floor(Math.random() * 200000) + 10000; // 10,000 ~ 210,000원
  }

  getRandomComment() {
    const comments = [
      '기분이 많이 좋아졌어요',
      '추천 정확도가 높네요',
      '가격대비 만족합니다',
      '배송이 빨라서 좋았어요',
      '다시 구매하고 싶어요',
      '친구에게도 추천했어요',
      '감정 분석이 신기해요',
      '덕키가 귀여워요'
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  // 시각화용 데이터 포맷
  getVisualizationData() {
    if (!this.simulationData.metrics) {
      this.generateSimulationData();
    }
    
    return {
      groupComparison: this.formatGroupComparison(),
      emotionPerformance: this.formatEmotionPerformance(),
      timeSeriesData: this.formatTimeSeriesData(),
      conversionFunnel: this.formatConversionFunnel()
    };
  }

  formatGroupComparison() {
    const metrics = this.simulationData.metrics.byGroup;
    return Object.entries(metrics).map(([group, data]) => ({
      group: group === 'emotionBased' ? 'AI 감정 분석' : 
             group === 'hybrid' ? '하이브리드' : '일반 추천',
      전환율: parseFloat(data.conversionRate),
      평균주문액: parseInt(data.averageOrderValue),
      만족도: parseFloat(data.averageRating),
      감정개선율: parseFloat(data.emotionImprovement)
    }));
  }

  formatEmotionPerformance() {
    const metrics = this.simulationData.metrics.byEmotion;
    return Object.entries(metrics).map(([emotion, data]) => ({
      emotion,
      sessions: data.sessions,
      purchases: data.purchases,
      conversionRate: parseFloat(data.conversionRate)
    }));
  }

  formatTimeSeriesData() {
    const hourlyData = [];
    for (let hour = 0; hour < 24; hour++) {
      const data = this.simulationData.metrics.byTime[hour] || { sessions: 0, purchases: 0 };
      hourlyData.push({
        hour: `${hour}시`,
        sessions: data.sessions,
        purchases: data.purchases,
        conversionRate: data.sessions > 0 ? 
          ((data.purchases / data.sessions) * 100).toFixed(2) : 0
      });
    }
    return hourlyData;
  }

  formatConversionFunnel() {
    const sessions = this.simulationData.sessions.length;
    const interactions = this.simulationData.interactions.length;
    const addToCarts = this.simulationData.interactions.filter(i => i.type === 'add_to_cart').length;
    const purchases = this.simulationData.purchases.length;
    
    return [
      { stage: '세션 시작', count: sessions, rate: 100 },
      { stage: '상품 조회', count: interactions, rate: (interactions / sessions * 100).toFixed(1) },
      { stage: '장바구니', count: addToCarts, rate: (addToCarts / sessions * 100).toFixed(1) },
      { stage: '구매 완료', count: purchases, rate: (purchases / sessions * 100).toFixed(1) }
    ];
  }
}

// 싱글톤 인스턴스
export const abTestSimulator = new ABTestSimulator();