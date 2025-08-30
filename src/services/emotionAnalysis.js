// AI 감정 분석 엔진
// KoBERT 대신 규칙 기반 + 머신러닝 시뮬레이션으로 구현

export class EmotionAnalysisEngine {
  constructor() {
    // 감정 키워드 사전 (한국어 특화)
    this.emotionKeywords = {
      불안: {
        keywords: ['불안', '걱정', '초조', '떨려', '두려워', '무서워', '긴장', '스트레스', '압박감', '부담', '불안해', '걱정돼', '초조해', '떨려', '무서워', '긴장돼', '스트레스받아', '부담돼'],
        weight: -2,
        intensity: {
          high: ['너무', '정말', '진짜', '완전', '매우', '심하게', '죽을만큼', '미치게'],
          medium: ['조금', '약간', '살짝', '좀'],
          low: ['괜찮', '그럭저럭', '별로']
        }
      },
      우울: {
        keywords: ['우울', '슬퍼', '외로워', '힘들어', '지쳐', '무기력', '의욕', '눈물', '공허', '허무', '우울해', '슬퍼', '외로워', '힘들어', '지쳐', '무기력해', '눈물나', '공허해', '허무해'],
        weight: -3,
        intensity: {
          high: ['너무', '정말', '진짜', '완전', '매우', '심하게', '죽을만큼'],
          medium: ['조금', '약간', '살짝', '좀'],
          low: ['괜찮', '그럭저럭', '별로']
        }
      },
      분노: {
        keywords: ['화나', '짜증', '열받아', '빡쳐', '싫어', '미워', '답답', '억울', '분해', '열불', '아이고', '헐', '으악', '쩝쩝', '으으', '화나', '짜증나', '열받아', '빡쳐', '싫어', '미워', '답답해', '억울해', '분해', '개빡', '시발', '씨발', '개새끼', '새끼', '병신', '미친', '미치네'],
        weight: -2.5,
        intensity: {
          high: ['너무', '정말', '진짜', '완전', '매우', '심하게', '죽을만큼', '미치게'],
          medium: ['조금', '약간', '살짝', '좀'],
          low: ['괜찮', '그럭저럭', '별로']
        }
      },
      행복: {
        keywords: ['행복', '기뻐', '좋아', '즐거워', '신나', '설레', '뿌듯', '만족', '웃음', '재밌', '아이고', '헐', '와우', '으악', '쩝쩝', '꺄르르', '으으', '아아', '오오', '대박', '쩐다', '짱', '최고', '행복해', '기뻐', '좋아', '즐거워', '신나', '설레', '뿌듯해', '만족해', '웃겨', '재밌어', '좋다', '좋았어', '좋을거야'],
        weight: 3,
        intensity: {
          high: ['너무', '정말', '진짜', '완전', '매우', '엄청', '진심', '미치게', '죽을만큼'],
          medium: ['조금', '약간', '살짝', '좀'],
          low: ['괜찮', '그럭저럭', '별로']
        }
      },
      평온: {
        keywords: ['편안', '괜찮', '평온', '차분', '안정', '여유', '평화', '고요', '포근', '따뜻', '편안해', '괜찮아', '차분해', '안정돼', '여유로워', '평화로워', '고요해', '포근해', '따뜻해', '평범', '보통', '그냥'],
        weight: 1,
        intensity: {
          high: ['너무', '정말', '진짜', '완전', '매우'],
          medium: ['조금', '약간', '살짝', '좀'],
          low: ['그냥', '그럭저럭', '별로']
        }
      },
      피곤: {
        keywords: ['피곤', '졸려', '지쳐', '힘들어', '노곤', '나른', '무기력', '축 처진', '기운없', '피곤해', '졸려', '지쳐', '힘들어', '노곤해', '나른해', '무기력해', '기운없어', '피곤하다', '지쳤다'],
        weight: -1,
        intensity: {
          high: ['너무', '정말', '진짜', '완전', '매우', '죽을만큼'],
          medium: ['조금', '약간', '살짝', '좀'],
          low: ['괜찮', '그럭저럭', '별로']
        }
      },
      놀라움: {
        keywords: ['헐', '와우', '으악', '아이고', '대박', '쩐다', '짱', '최고', '놀라워', '깜짝', '깜놀', '어이없어', '황당', '놀라', '깜짝', '깜놀', '어이없어', '황당해', '충격', '놀람', '깜짝놀람'],
        weight: 1.5,
        intensity: {
          high: ['너무', '정말', '진짜', '완전', '매우', '엄청', '죽을만큼'],
          medium: ['조금', '약간', '살짝', '좀'],
          low: ['괜찮', '그럭저럭', '별로']
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
    const processed = this.preprocessText(text);
    
    // 2. 감정 점수 계산
    const emotionScores = this.calculateEmotionScores(processed.text);
    
    // 3. 문장 구조 분석 (의문문, 강조문)
    const sentenceAnalysis = this.analyzeSentenceStructure(processed);
    
    // 4. 문맥 분석
    const contextWeight = this.analyzeContext(processed.text);
    
    // 5. 위기 감지
    const crisisCheck = this.checkCrisis(processed.text);
    
    // 6. 최종 감정 결정
    const dominantEmotion = this.determineDominantEmotion(emotionScores, contextWeight, sentenceAnalysis);
    
    // 7. 신뢰도 계산
    const confidence = this.calculateConfidence(emotionScores, dominantEmotion);
    
    // 8. 디버깅 로그 (개발용) - 조건부로 실행
    if (process.env.NODE_ENV === 'development') {
      console.log('감정 분석 결과:', {
        originalText: text,
        processedText: processed.text,
        punctuation: processed.punctuation,
        sentenceAnalysis: sentenceAnalysis,
        emotionScores: emotionScores,
        dominantEmotion: dominantEmotion,
        confidence: confidence
      });
    }
    
    // 8. 이력 저장
    const analysis = {
      text: text,
      timestamp: new Date().toISOString(),
      emotions: emotionScores,
      dominant: dominantEmotion,
      confidence: confidence,
      context: contextWeight,
      sentenceAnalysis: sentenceAnalysis,
      crisis: crisisCheck,
      processingTime: Date.now() - startTime,
      modelVersion: 'v2.1-korean-enhanced'
    };
    
    this.emotionHistory.push(analysis);
    this.totalAnalyzed++;
    
    return analysis;
  }

  // 텍스트 전처리
  preprocessText(text) {
    // 구두점을 유지하면서 분석에 활용
    const punctuationInfo = {
      hasExclamation: text.includes('!'),
      hasQuestion: text.includes('?'),
      hasEllipsis: text.includes('...') || text.includes('…'),
      exclamationCount: (text.match(/!/g) || []).length,
      questionCount: (text.match(/\?/g) || []).length
    };
    
    // 전처리된 텍스트 (소문자 변환, 공백 정규화)
    const processedText = text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    
    return {
      text: processedText,
      punctuation: punctuationInfo
    };
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
          
          // 강도 체크 - 더 유연한 매칭
          let intensity = 1;
          for (const [level, intensifiers] of Object.entries(data.intensity)) {
            for (const intensifier of intensifiers) {
              // 더 유연한 매칭: 단어 앞이나 뒤에 있을 수 있음
              const intensifierRegex = new RegExp(`(${intensifier})\\s*(${keyword})|(${keyword})\\s*(${intensifier})`, 'gi');
              if (intensifierRegex.test(text)) {
                intensity = level === 'high' ? 2 : level === 'medium' ? 1.5 : 0.5;
                break;
              }
            }
            if (intensity !== 1) break; // 이미 강도가 설정되었으면 중단
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
    
    // 점수 정규화 (0-100) - 최소 점수 보장
    const maxScore = Math.max(...Object.values(scores).map(s => s.score));
    const minScore = Math.min(...Object.values(scores).map(s => s.score));
    
    if (maxScore > 0) {
      for (const emotion in scores) {
        if (maxScore === minScore) {
          // 모든 점수가 같으면 기본값 설정
          scores[emotion].normalized = 50;
        } else {
          scores[emotion].normalized = ((scores[emotion].score - minScore) / (maxScore - minScore)) * 100;
        }
      }
    } else {
      // 모든 점수가 0이면 기본값 설정
      for (const emotion in scores) {
        scores[emotion].normalized = 50;
      }
    }
    
    return scores;
  }

  // 문장 구조 분석 (의문문, 강조문)
  analyzeSentenceStructure(processed) {
    const { text, punctuation } = processed;
    
    let sentenceModifiers = {
      questionModifier: 0,
      exclamationModifier: 0,
      ellipsisModifier: 0
    };
    
    // 의문문 감지
    if (punctuation.hasQuestion || this.hasQuestionWords(text)) {
      sentenceModifiers.questionModifier = 0.3; // 의문문은 감정 강도를 약간 높임
    }
    
    // 강조문 감지
    if (punctuation.hasExclamation) {
      sentenceModifiers.exclamationModifier = punctuation.exclamationCount * 0.2; // 느낌표 수에 따라 강도 증가
    }
    
    // 생략부호 감지 (망설임, 불안)
    if (punctuation.hasEllipsis) {
      sentenceModifiers.ellipsisModifier = -0.1; // 생략부호는 불안감 증가
    }
    
    return sentenceModifiers;
  }
  
  // 의문사 감지
  hasQuestionWords(text) {
    // 기본 의문사
    const basicQuestionWords = ['왜', '어떻게', '무엇', '언제', '어디', '누구', '뭐', '어떤', '어느'];
    
    // 의문문 패턴 (문장 끝)
    const questionPatterns = [
      /\b(해|돼|돼요|인가요|나요|까|을까|ㄹ까)\b$/,
      /\b(있어|없어|할까|먹을까|갈까|볼까|들을까|읽을까)\b$/,
      /\b(좋아|싫어|괜찮아|어때|어떠니)\b$/
    ];
    
    // 기본 의문사 확인
    const hasBasicQuestion = basicQuestionWords.some(word => text.includes(word));
    
    // 의문문 패턴 확인
    const hasQuestionPattern = questionPatterns.some(pattern => pattern.test(text));
    
    return hasBasicQuestion || hasQuestionPattern;
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
  determineDominantEmotion(scores, contextWeight, sentenceAnalysis) {
    let maxEmotion = null;
    let maxScore = 0;
    
    for (const [emotion, data] of Object.entries(scores)) {
      let weightedScore = data.normalized * contextWeight;
      
      // 문장 구조에 따른 조정
      if (emotion === '불안' && sentenceAnalysis.ellipsisModifier < 0) {
        weightedScore += Math.abs(sentenceAnalysis.ellipsisModifier) * 100; // 불안 증가
      }
      
      if (emotion === '놀라움' && sentenceAnalysis.exclamationModifier > 0) {
        weightedScore += sentenceAnalysis.exclamationModifier * 100; // 놀라움 증가
      }
      
      if (sentenceAnalysis.questionModifier > 0) {
        // 의문문은 감정 강도를 높이고, 불안이나 혼란 감정을 강화
        weightedScore *= (1 + sentenceAnalysis.questionModifier);
        
        // 의문문일 때는 불안이나 혼란 감정을 더 강화
        if (emotion === '불안' || emotion === '우울') {
          weightedScore *= 1.5; // 의문문일 때 부정적 감정 강화
        }
      }
      
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
      modelVersion: 'v2.1-korean-enhanced',
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
      피곤: ['에너지', '휴식', '수면', '영양', '회복'],
      놀라움: ['놀라움', '재미', '흥미', '새로움', '경험']
    };
    
    return tagMap[emotion] || ['일반'];
  }
}

// 싱글톤 인스턴스
export const emotionAnalysisEngine = new EmotionAnalysisEngine();