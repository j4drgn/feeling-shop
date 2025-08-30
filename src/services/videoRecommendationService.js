class VideoRecommendationService {
  constructor() {
    this.STORAGE_KEY = 'videoRecommendationData';
    this.initializeStorage();
  }

  initializeStorage() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      const initialData = {
        watchHistory: [], // { videoId, title, watchedAt, rating, emotion }
        preferences: {}, // { genre: score, emotion: preference }
        lastRecommendation: null,
        totalWatched: 0
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialData));
    }
  }

  getData() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    } catch (error) {
      console.error('Failed to parse video recommendation data:', error);
      this.initializeStorage();
      return this.getData();
    }
  }

  saveData(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  // 시청 이력 추가
  addWatchHistory(videoData, userRating = null, emotion = null) {
    const data = this.getData();
    
    const watchEntry = {
      videoId: videoData.id,
      title: videoData.title,
      filename: videoData.filename,
      watchedAt: new Date().toISOString(),
      rating: userRating, // 1-5 점수 또는 'good'/'bad'
      emotion: emotion, // 시청 당시 감정
      chatContext: videoData.chatContext || null
    };

    // 중복 제거 (같은 비디오를 다시 본 경우 최신 기록으로 업데이트)
    data.watchHistory = data.watchHistory.filter(item => item.videoId !== videoData.id);
    data.watchHistory.push(watchEntry);
    data.totalWatched = data.watchHistory.length;

    // 선호도 업데이트
    this.updatePreferences(data, watchEntry);
    
    this.saveData(data);
    return watchEntry;
  }

  // 선호도 업데이트
  updatePreferences(data, watchEntry) {
    if (!data.preferences.emotions) {
      data.preferences.emotions = {};
    }
    if (!data.preferences.ratings) {
      data.preferences.ratings = {};
    }

    // 감정별 선호도 업데이트
    if (watchEntry.emotion && watchEntry.rating) {
      const emotion = watchEntry.emotion;
      if (!data.preferences.emotions[emotion]) {
        data.preferences.emotions[emotion] = { total: 0, positive: 0 };
      }
      
      data.preferences.emotions[emotion].total++;
      if (this.isPositiveRating(watchEntry.rating)) {
        data.preferences.emotions[emotion].positive++;
      }
    }

    // 전반적인 평가 패턴 저장
    if (watchEntry.rating) {
      const ratingKey = this.normalizeRating(watchEntry.rating);
      data.preferences.ratings[ratingKey] = (data.preferences.ratings[ratingKey] || 0) + 1;
    }
  }

  // 평가가 긍정적인지 판단
  isPositiveRating(rating) {
    if (typeof rating === 'string') {
      return ['good', 'great', 'excellent', '좋았어', '재미있었어', '마음에 들어'].some(positive => 
        rating.toLowerCase().includes(positive.toLowerCase())
      );
    }
    if (typeof rating === 'number') {
      return rating >= 3;
    }
    return false;
  }

  // 평가 정규화
  normalizeRating(rating) {
    if (this.isPositiveRating(rating)) {
      return 'positive';
    }
    return 'negative';
  }

  // 이미 본 동영상 목록 가져오기
  getWatchedVideoIds() {
    const data = this.getData();
    return data.watchHistory.map(item => item.videoId);
  }

  // 추천 점수 계산
  calculateRecommendationScore(videoData, currentEmotion, chatContext) {
    const data = this.getData();
    let score = 0.5; // 기본 점수

    // 1. 감정 기반 점수
    if (currentEmotion && data.preferences.emotions[currentEmotion]) {
      const emotionPref = data.preferences.emotions[currentEmotion];
      const successRate = emotionPref.positive / emotionPref.total;
      score += successRate * 0.3; // 30% 가중치
    }

    // 2. 최근 시청 패턴 분석
    const recentHistory = data.watchHistory.slice(-5); // 최근 5개
    const recentPositiveRate = recentHistory.filter(item => 
      this.isPositiveRating(item.rating)
    ).length / Math.max(recentHistory.length, 1);
    
    score += recentPositiveRate * 0.2; // 20% 가중치

    // 3. 제목 유사도 (간단한 키워드 매칭)
    if (chatContext) {
      const contextWords = chatContext.toLowerCase().split(' ');
      const titleWords = videoData.title.toLowerCase().split(' ');
      const matchCount = contextWords.filter(word => 
        titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))
      ).length;
      
      score += (matchCount / Math.max(contextWords.length, 1)) * 0.2; // 20% 가중치
    }

    // 4. 다양성 보정 (같은 패턴 반복 방지)
    const similarVideos = data.watchHistory.filter(item => 
      this.calculateTitleSimilarity(item.title, videoData.title) > 0.7
    );
    
    if (similarVideos.length > 2) {
      score -= 0.3; // 유사한 영상 많이 본 경우 점수 감소
    }

    return Math.max(0, Math.min(1, score)); // 0-1 범위로 제한
  }

  // 제목 유사도 계산 (간단한 Jaccard 유사도)
  calculateTitleSimilarity(title1, title2) {
    const words1 = new Set(title1.toLowerCase().split(' '));
    const words2 = new Set(title2.toLowerCase().split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  // 사용자 피드백 처리
  processFeedback(feedback, lastWatchedVideos) {
    const data = this.getData();
    
    // 피드백 텍스트 분석
    const isPositiveFeedback = this.isPositiveRating(feedback);
    const rating = isPositiveFeedback ? 'positive' : 'negative';

    // 최근 시청한 동영상들에 평가 적용
    lastWatchedVideos.forEach(video => {
      const existingEntry = data.watchHistory.find(item => item.videoId === video.id);
      if (existingEntry && !existingEntry.rating) {
        existingEntry.rating = rating;
        existingEntry.feedback = feedback;
        existingEntry.feedbackTime = new Date().toISOString();
      }
    });

    this.saveData(data);
    return { processed: lastWatchedVideos.length, rating };
  }

  // 통계 정보 가져오기
  getStats() {
    const data = this.getData();
    const totalWatched = data.watchHistory.length;
    const positiveCount = data.watchHistory.filter(item => 
      this.isPositiveRating(item.rating)
    ).length;
    
    return {
      totalWatched,
      positiveRate: totalWatched > 0 ? positiveCount / totalWatched : 0,
      favoriteEmotions: Object.entries(data.preferences.emotions || {})
        .map(([emotion, data]) => ({
          emotion,
          successRate: data.positive / data.total,
          count: data.total
        }))
        .sort((a, b) => b.successRate - a.successRate)
    };
  }

  // 데이터 초기화 (테스트용)
  resetData() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializeStorage();
  }
}

// 싱글톤 인스턴스
const videoRecommendationService = new VideoRecommendationService();
export default videoRecommendationService;