// AI 감정 분석 엔진
// KoBERT 대신 규칙 기반 + 머신러닝 시뮬레이션으로 구현

export class EmotionAnalysisEngine {
  constructor() {
    // 감정 키워드 사전 (한국어 특화)
    this.emotionKeywords = {
      불안: {
        keywords: ['불안', '걱정', '초조', '떨려', '두려워', '무서워', '긴장', '스트레스', '압박감', '부담'],
        weight: -2,
        intensity: {
          high: ['너무', '정말', '진짜', '완전', '매우', '심하게'],
          medium: ['조금', '약간', '살짝'],
          low: ['괜찮', '그럭저럭']
        }
      },
      우울: {
        keywords: ['우울', '슬퍼', '외로워', '힘들어', '지쳐', '무기력', '의욕', '눈물', '공허', '허무'],
        weight: -3,
        intensity: {
          high: ['너무', '정말', '진짜', '완전', '매우', '심하게'],
          medium: ['조금', '약간', '살짝'],
          low: ['괜찮', '그럭저럭']
        }
      },
      분노: {
        keywords: ['화나', '짜증', '열받아', '빡쳐', '싫어', '미워', '답답', '억울', '분해', '열불'],
        weight: -2.5,
        intensity: {
          high: ['너무', '정말', '진짜', '완전', '매우', '심하게'],
          medium: ['조금', '약간', '살짝'],
          low: ['괜찮', '그럭저럭']
        }
      },
      행복: {
        keywords: ['행복', '기뻐', '좋아', '즐거워', '신나', '설레', '뿌듯', '만족', '웃음', '재밌'],
        weight: 3,
        intensity: {
          high: ['너무', '정말', '진짜', '완전', '매우', '엄청'],
          medium: ['조금', '약간', '살짝'],
          low: ['괜찮', '그럭저럭']
        }
      },
      평온: {
        keywords: ['편안', '괜찮', '평온', '차분', '안정', '여유', '평화', '고요', '포근', '따뜻'],
        weight: 1,
        intensity: {
          high: ['너무', '정말', '진짜', '완전', '매우'],
          medium: ['조금', '약간', '살짝'],
          low: ['그냥', '그럭저럭']
        }
      },
      피곤: {
        keywords: ['피곤', '졸려', '지쳐', '힘들어', '노곤', '나른', '무기력', '축 처진', '기운없'],
        weight: -1,
        intensity: {
          high: ['너무', '정말', '진짜', '완전', '매우'],
          medium: ['조금', '약간', '살짝'],
          low: ['괜찮', '그럭저럭']
        }
      }
    };

    // 문맥 패턴 (더 정교한 분석)
    this.contextPatterns = [
      { pattern: /요즘|최근|며칠|계속/, context: 'continuous', weight: 1.5 },
      { pattern: /오늘|지금|방금/, context: 'current', weight: 1.0 },
      { pattern: /어제|그제|예전/, context: 'past', weight: 0.8 },
      { pattern: /매일|항상|늘/, context: 'chronic', weight: 2.0 },
      { pattern: /가끔|때때로|이따금/, context: 'occasional', weight: 0.5 }
    ];

    // 위기 감지 패턴
    this.crisisPatterns = [
      { pattern: /죽고\s?싶|자살|자해|끝내고\s?싶/, level: 'critical', action: 'immediate' },
      { pattern: /사라지고\s?싶|없어지고\s?싶/, level: 'high', action: 'alert' },
      { pattern: /포기하고\s?싶|그만두고\s?싶/, level: 'medium', action: 'monitor' }
    ];

    // 감정 이력 (세션 기반)
    this.emotionHistory = [];
    
    // 학습 데이터 시뮬레이션
    this.modelAccuracy = 0.85; // 85% 정확도 (시연용)
    this.totalAnalyzed = 0;
    this.correctPredictions = 0;
  }

  // 메인 감정 분석 함수
  analyzeEmotion(text) {
    const startTime = Date.now();
    
    // 1. 전처리
    const processedText = this.preprocessText(text);
    
    // 2. 감정 점수 계산
    const emotionScores = this.calculateEmotionScores(processedText);
    
    // 3. 문맥 분석
    const contextWeight = this.analyzeContext(processedText);
    
    // 4. 위기 감지
    const crisisCheck = this.checkCrisis(processedText);
    
    // 5. 최종 감정 결정
    const dominantEmotion = this.determineDominantEmotion(emotionScores, contextWeight);
    
    // 6. 신뢰도 계산
    const confidence = this.calculateConfidence(emotionScores, dominantEmotion);
    
    // 7. 이력 저장
    const analysis = {
      text: text,
      timestamp: new Date().toISOString(),
      emotions: emotionScores,
      dominant: dominantEmotion,
      confidence: confidence,
      context: contextWeight,
      crisis: crisisCheck,
      processingTime: Date.now() - startTime,
      modelVersion: 'v2.0-korean'
    };
    
    this.emotionHistory.push(analysis);
    this.totalAnalyzed++;
    
    return analysis;
  }

  // 텍스트 전처리
  preprocessText(text) {
    return text
      .toLowerCase()
      .replace(/[.,!?]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 감정 점수 계산
  calculateEmotionScores(text) {
    const scores = {};
    
    for (const [emotion, data] of Object.entries(this.emotionKeywords)) {
      let score = 0;
      let matchCount = 0;
      
      // 키워드 매칭
      for (const keyword of data.keywords) {
        const regex = new RegExp(keyword, 'gi');
        const matches = text.match(regex);
        if (matches) {
          matchCount += matches.length;
          
          // 강도 체크
          let intensity = 1;
          for (const [level, intensifiers] of Object.entries(data.intensity)) {
            for (const intensifier of intensifiers) {
              if (text.includes(intensifier + ' ' + keyword)) {
                intensity = level === 'high' ? 2 : level === 'medium' ? 1.5 : 0.5;
                break;
              }
            }
          }
          
          score += data.weight * intensity * matches.length;
        }
      }
      
      scores[emotion] = {
        score: Math.abs(score),
        matchCount: matchCount,
        normalized: 0 // 나중에 정규화
      };
    }
    
    // 점수 정규화 (0-100)
    const maxScore = Math.max(...Object.values(scores).map(s => s.score));
    if (maxScore > 0) {
      for (const emotion in scores) {
        scores[emotion].normalized = (scores[emotion].score / maxScore) * 100;
      }
    }
    
    return scores;
  }

  // 문맥 분석
  analyzeContext(text) {
    let contextWeight = 1.0;
    
    for (const pattern of this.contextPatterns) {
      if (pattern.pattern.test(text)) {
        contextWeight *= pattern.weight;
      }
    }
    
    return contextWeight;
  }

  // 위기 감지
  checkCrisis(text) {
    for (const pattern of this.crisisPatterns) {
      if (pattern.pattern.test(text)) {
        // 문맥 기반 필터링 (오탐 방지)
        const falsePositives = [
          /배고파서\s?죽/,
          /웃겨\s?죽/,
          /귀여워\s?죽/,
          /좋아\s?죽/
        ];
        
        let isFalsePositive = false;
        for (const fp of falsePositives) {
          if (fp.test(text)) {
            isFalsePositive = true;
            break;
          }
        }
        
        if (!isFalsePositive) {
          return {
            detected: true,
            level: pattern.level,
            action: pattern.action,
            timestamp: new Date().toISOString()
          };
        }
      }
    }
    
    return { detected: false };
  }

  // 주도적 감정 결정
  determineDominantEmotion(scores, contextWeight) {
    let maxEmotion = null;
    let maxScore = 0;
    
    for (const [emotion, data] of Object.entries(scores)) {
      const weightedScore = data.normalized * contextWeight;
      if (weightedScore > maxScore) {
        maxScore = weightedScore;
        maxEmotion = emotion;
      }
    }
    
    return maxEmotion || '평온';
  }

  // 신뢰도 계산
  calculateConfidence(scores, dominantEmotion) {
    if (!dominantEmotion) return 0;
    
    const dominantScore = scores[dominantEmotion]?.normalized || 0;
    const otherScores = Object.entries(scores)
      .filter(([emotion]) => emotion !== dominantEmotion)
      .map(([, data]) => data.normalized);
    
    const avgOtherScore = otherScores.length > 0 
      ? otherScores.reduce((a, b) => a + b, 0) / otherScores.length 
      : 0;
    
    // 신뢰도 = 주도 감정과 다른 감정들의 차이
    const confidence = Math.min(100, (dominantScore - avgOtherScore) * 1.5);
    
    return Math.max(0, confidence);
  }

  // 감정 추세 분석
  getEmotionTrend(days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const recentEmotions = this.emotionHistory.filter(
      h => new Date(h.timestamp) > cutoff
    );
    
    const trend = {};
    for (const emotion of Object.keys(this.emotionKeywords)) {
      trend[emotion] = {
        count: 0,
        avgScore: 0,
        percentage: 0
      };
    }
    
    for (const history of recentEmotions) {
      if (history.dominant) {
        trend[history.dominant].count++;
      }
    }
    
    const total = recentEmotions.length;
    if (total > 0) {
      for (const emotion in trend) {
        trend[emotion].percentage = (trend[emotion].count / total) * 100;
      }
    }
    
    return {
      period: `${days}일`,
      totalAnalyzed: total,
      trend: trend,
      dominantEmotion: Object.entries(trend)
        .sort((a, b) => b[1].percentage - a[1].percentage)[0]?.[0] || '평온'
    };
  }

  // 모델 성능 메트릭
  getModelMetrics() {
    return {
      modelVersion: 'v2.0-korean',
      accuracy: this.modelAccuracy,
      totalAnalyzed: this.totalAnalyzed,
      avgProcessingTime: this.emotionHistory.length > 0
        ? this.emotionHistory.reduce((sum, h) => sum + h.processingTime, 0) / this.emotionHistory.length
        : 0,
      supportedEmotions: Object.keys(this.emotionKeywords),
      lastUpdated: '2024-08-30'
    };
  }

  // 감정 기반 추천 태그 생성
  getRecommendationTags(emotion) {
    const tagMap = {
      불안: ['안정', '릴렉스', '명상', '수면', '스트레스해소'],
      우울: ['기분전환', '활력', '위로', '힐링', '동기부여'],
      분노: ['진정', '스트레스해소', '운동', '취미', '음악'],
      행복: ['축하', '선물', '공유', '기념', '즐거움'],
      평온: ['유지', '루틴', '일상', '편안함', '여유'],
      피곤: ['에너지', '휴식', '수면', '영양', '회복']
    };
    
    return tagMap[emotion] || ['일반'];
  }
}

// 싱글톤 인스턴스
export const emotionAnalysisEngine = new EmotionAnalysisEngine();