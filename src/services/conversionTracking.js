// 구매 전환 추적 및 피드백 시스템
export class ConversionTrackingSystem {
  constructor() {
    this.storageKey = 'feeling_shop_conversion_data';
    this.sessionKey = 'feeling_shop_session';
    this.conversionData = this.loadConversionData();
    this.currentSession = this.initializeSession();
  }

  // 세션 초기화
  initializeSession() {
    const existing = sessionStorage.getItem(this.sessionKey);
    if (existing) {
      return JSON.parse(existing);
    }
    
    const newSession = {
      id: this.generateSessionId(),
      startTime: new Date().toISOString(),
      emotionHistory: [],
      viewedProducts: [],
      recommendedProducts: [],
      interactions: [],
      purchases: [],
      feedbacks: []
    };
    
    sessionStorage.setItem(this.sessionKey, JSON.stringify(newSession));
    return newSession;
  }

  // 전환 데이터 로드
  loadConversionData() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : this.getDefaultConversionData();
    } catch (error) {
      console.error('Failed to load conversion data:', error);
      return this.getDefaultConversionData();
    }
  }

  // 기본 전환 데이터 구조
  getDefaultConversionData() {
    return {
      totalSessions: 0,
      totalRecommendations: 0,
      totalClicks: 0,
      totalPurchases: 0,
      totalRevenue: 0,
      emotionConversions: {},
      productPerformance: {},
      timeBasedMetrics: {
        hourly: {},
        daily: {},
        weekly: {}
      },
      abTestResults: {},
      feedbackScores: []
    };
  }

  // 추천 추적
  trackRecommendation(emotion, products, algorithm) {
    const event = {
      timestamp: new Date().toISOString(),
      emotion: emotion,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        score: p.totalScore
      })),
      algorithm: algorithm,
      sessionId: this.currentSession.id
    };
    
    this.currentSession.recommendedProducts.push(...products);
    this.conversionData.totalRecommendations++;
    
    // 감정별 추천 횟수 증가
    if (!this.conversionData.emotionConversions[emotion]) {
      this.conversionData.emotionConversions[emotion] = {
        recommendations: 0,
        clicks: 0,
        purchases: 0,
        revenue: 0,
        conversionRate: 0
      };
    }
    this.conversionData.emotionConversions[emotion].recommendations++;
    
    this.saveData();
    return event;
  }

  // 상품 클릭 추적
  trackProductClick(productId, source = 'recommendation') {
    const product = this.currentSession.recommendedProducts.find(p => p.id === productId);
    
    const clickEvent = {
      timestamp: new Date().toISOString(),
      productId: productId,
      productName: product?.name,
      source: source,
      sessionId: this.currentSession.id,
      emotionAtClick: this.currentSession.emotionHistory[this.currentSession.emotionHistory.length - 1]
    };
    
    this.currentSession.viewedProducts.push(clickEvent);
    this.conversionData.totalClicks++;
    
    // 감정별 클릭 추적
    if (clickEvent.emotionAtClick) {
      const emotion = clickEvent.emotionAtClick.emotion;
      if (this.conversionData.emotionConversions[emotion]) {
        this.conversionData.emotionConversions[emotion].clicks++;
      }
    }
    
    // 상품 성과 추적
    if (!this.conversionData.productPerformance[productId]) {
      this.conversionData.productPerformance[productId] = {
        impressions: 0,
        clicks: 0,
        purchases: 0,
        revenue: 0,
        conversionRate: 0
      };
    }
    this.conversionData.productPerformance[productId].clicks++;
    
    this.saveData();
    return clickEvent;
  }

  // 구매 추적
  trackPurchase(productId, price, quantity = 1) {
    const purchaseEvent = {
      timestamp: new Date().toISOString(),
      productId: productId,
      price: price,
      quantity: quantity,
      totalAmount: price * quantity,
      sessionId: this.currentSession.id,
      emotionAtPurchase: this.currentSession.emotionHistory[this.currentSession.emotionHistory.length - 1],
      recommendationToPurchaseTime: this.calculateTimeToPurchase(productId)
    };
    
    this.currentSession.purchases.push(purchaseEvent);
    this.conversionData.totalPurchases++;
    this.conversionData.totalRevenue += purchaseEvent.totalAmount;
    
    // 감정별 구매 추적
    if (purchaseEvent.emotionAtPurchase) {
      const emotion = purchaseEvent.emotionAtPurchase.emotion;
      if (this.conversionData.emotionConversions[emotion]) {
        this.conversionData.emotionConversions[emotion].purchases++;
        this.conversionData.emotionConversions[emotion].revenue += purchaseEvent.totalAmount;
        this.updateConversionRate(emotion);
      }
    }
    
    // 상품 성과 업데이트
    if (this.conversionData.productPerformance[productId]) {
      this.conversionData.productPerformance[productId].purchases++;
      this.conversionData.productPerformance[productId].revenue += purchaseEvent.totalAmount;
      this.updateProductConversionRate(productId);
    }
    
    // 시간대별 메트릭 업데이트
    this.updateTimeBasedMetrics(purchaseEvent);
    
    this.saveData();
    return purchaseEvent;
  }

  // 피드백 수집
  trackFeedback(productId, rating, emotionChange, comment = '') {
    const feedbackEvent = {
      timestamp: new Date().toISOString(),
      productId: productId,
      rating: rating, // 1-5
      emotionBefore: this.currentSession.emotionHistory[this.currentSession.emotionHistory.length - 2],
      emotionAfter: this.currentSession.emotionHistory[this.currentSession.emotionHistory.length - 1],
      emotionChangeScore: emotionChange, // -100 to +100
      comment: comment,
      sessionId: this.currentSession.id
    };
    
    this.currentSession.feedbacks.push(feedbackEvent);
    this.conversionData.feedbackScores.push({
      rating: rating,
      emotionChange: emotionChange,
      timestamp: feedbackEvent.timestamp
    });
    
    // 평균 피드백 점수 계산
    this.calculateAverageFeedback();
    
    this.saveData();
    return feedbackEvent;
  }

  // 감정 변화 추적
  trackEmotionChange(previousEmotion, currentEmotion, trigger = 'unknown') {
    const changeEvent = {
      timestamp: new Date().toISOString(),
      from: previousEmotion,
      to: currentEmotion,
      trigger: trigger, // 'product_view', 'purchase', 'recommendation' 등
      sessionId: this.currentSession.id
    };
    
    this.currentSession.emotionHistory.push({
      emotion: currentEmotion,
      timestamp: changeEvent.timestamp,
      trigger: trigger
    });
    
    return changeEvent;
  }

  // 구매까지 걸린 시간 계산
  calculateTimeToPurchase(productId) {
    const recommendation = this.currentSession.recommendedProducts.find(p => p.id === productId);
    if (!recommendation) return null;
    
    const recTime = new Date(recommendation.timestamp || Date.now());
    const purchaseTime = new Date();
    
    return (purchaseTime - recTime) / 1000 / 60; // 분 단위
  }

  // 전환율 업데이트
  updateConversionRate(emotion) {
    const data = this.conversionData.emotionConversions[emotion];
    if (data && data.recommendations > 0) {
      data.conversionRate = (data.purchases / data.recommendations) * 100;
    }
  }

  // 상품 전환율 업데이트
  updateProductConversionRate(productId) {
    const data = this.conversionData.productPerformance[productId];
    if (data && data.clicks > 0) {
      data.conversionRate = (data.purchases / data.clicks) * 100;
    }
  }

  // 시간대별 메트릭 업데이트
  updateTimeBasedMetrics(purchaseEvent) {
    const date = new Date(purchaseEvent.timestamp);
    const hour = date.getHours();
    const day = date.toISOString().split('T')[0];
    const week = this.getWeekNumber(date);
    
    // 시간별
    if (!this.conversionData.timeBasedMetrics.hourly[hour]) {
      this.conversionData.timeBasedMetrics.hourly[hour] = {
        purchases: 0,
        revenue: 0
      };
    }
    this.conversionData.timeBasedMetrics.hourly[hour].purchases++;
    this.conversionData.timeBasedMetrics.hourly[hour].revenue += purchaseEvent.totalAmount;
    
    // 일별
    if (!this.conversionData.timeBasedMetrics.daily[day]) {
      this.conversionData.timeBasedMetrics.daily[day] = {
        purchases: 0,
        revenue: 0
      };
    }
    this.conversionData.timeBasedMetrics.daily[day].purchases++;
    this.conversionData.timeBasedMetrics.daily[day].revenue += purchaseEvent.totalAmount;
    
    // 주별
    if (!this.conversionData.timeBasedMetrics.weekly[week]) {
      this.conversionData.timeBasedMetrics.weekly[week] = {
        purchases: 0,
        revenue: 0
      };
    }
    this.conversionData.timeBasedMetrics.weekly[week].purchases++;
    this.conversionData.timeBasedMetrics.weekly[week].revenue += purchaseEvent.totalAmount;
  }

  // 주 번호 계산
  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // 평균 피드백 계산
  calculateAverageFeedback() {
    if (this.conversionData.feedbackScores.length === 0) return;
    
    const avgRating = this.conversionData.feedbackScores.reduce((sum, f) => sum + f.rating, 0) / 
                      this.conversionData.feedbackScores.length;
    
    const avgEmotionChange = this.conversionData.feedbackScores.reduce((sum, f) => sum + f.emotionChange, 0) / 
                             this.conversionData.feedbackScores.length;
    
    this.conversionData.averageFeedback = {
      rating: avgRating,
      emotionChange: avgEmotionChange,
      sampleSize: this.conversionData.feedbackScores.length
    };
  }

  // A/B 테스트 결과 추적
  trackABTestResult(testGroup, metric, value) {
    if (!this.conversionData.abTestResults[testGroup]) {
      this.conversionData.abTestResults[testGroup] = {
        sessions: 0,
        conversions: 0,
        revenue: 0,
        avgSessionDuration: 0
      };
    }
    
    this.conversionData.abTestResults[testGroup][metric] = value;
    this.saveData();
  }

  // 세션 ID 생성
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 데이터 저장
  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.conversionData));
      sessionStorage.setItem(this.sessionKey, JSON.stringify(this.currentSession));
    } catch (error) {
      console.error('Failed to save conversion data:', error);
    }
  }

  // 리포트 생성
  generateReport() {
    const totalConversionRate = this.conversionData.totalRecommendations > 0 
      ? (this.conversionData.totalPurchases / this.conversionData.totalRecommendations) * 100 
      : 0;
    
    const clickThroughRate = this.conversionData.totalRecommendations > 0
      ? (this.conversionData.totalClicks / this.conversionData.totalRecommendations) * 100
      : 0;
    
    const averageOrderValue = this.conversionData.totalPurchases > 0
      ? this.conversionData.totalRevenue / this.conversionData.totalPurchases
      : 0;
    
    // 감정별 최고 성과
    let bestEmotionForConversion = null;
    let highestConversionRate = 0;
    
    for (const [emotion, data] of Object.entries(this.conversionData.emotionConversions)) {
      if (data.conversionRate > highestConversionRate) {
        highestConversionRate = data.conversionRate;
        bestEmotionForConversion = emotion;
      }
    }
    
    // 시간대별 최고 성과
    let bestHour = null;
    let maxHourRevenue = 0;
    
    for (const [hour, data] of Object.entries(this.conversionData.timeBasedMetrics.hourly)) {
      if (data.revenue > maxHourRevenue) {
        maxHourRevenue = data.revenue;
        bestHour = hour;
      }
    }
    
    return {
      summary: {
        totalSessions: this.conversionData.totalSessions,
        totalRecommendations: this.conversionData.totalRecommendations,
        totalClicks: this.conversionData.totalClicks,
        totalPurchases: this.conversionData.totalPurchases,
        totalRevenue: this.conversionData.totalRevenue,
        conversionRate: totalConversionRate.toFixed(2) + '%',
        clickThroughRate: clickThroughRate.toFixed(2) + '%',
        averageOrderValue: Math.round(averageOrderValue)
      },
      emotionPerformance: this.conversionData.emotionConversions,
      topProducts: this.getTopProducts(),
      bestPerformingEmotion: bestEmotionForConversion,
      bestPerformingHour: bestHour,
      customerSatisfaction: this.conversionData.averageFeedback,
      abTestResults: this.conversionData.abTestResults
    };
  }

  // 상위 상품 가져오기
  getTopProducts() {
    return Object.entries(this.conversionData.productPerformance)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([productId, data]) => ({
        productId,
        ...data
      }));
  }

  // 실시간 대시보드용 데이터
  getRealTimeMetrics() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 오늘의 메트릭
    const todayKey = todayStart.toISOString().split('T')[0];
    const todayData = this.conversionData.timeBasedMetrics.daily[todayKey] || {
      purchases: 0,
      revenue: 0
    };
    
    // 현재 시간대 메트릭
    const currentHour = now.getHours();
    const hourData = this.conversionData.timeBasedMetrics.hourly[currentHour] || {
      purchases: 0,
      revenue: 0
    };
    
    return {
      today: todayData,
      currentHour: hourData,
      recentPurchases: this.currentSession.purchases.slice(-5),
      activeSession: {
        duration: (Date.now() - new Date(this.currentSession.startTime)) / 1000 / 60, // 분
        viewedProducts: this.currentSession.viewedProducts.length,
        emotionChanges: this.currentSession.emotionHistory.length
      }
    };
  }
}

// 싱글톤 인스턴스
export const conversionTracking = new ConversionTrackingSystem();