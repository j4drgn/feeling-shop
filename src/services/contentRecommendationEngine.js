// 감성 기반 문화 콘텐츠 추천 엔진
import { userProfileService } from "./userProfile.js";

export class ContentRecommendationEngine {
  constructor() {
    this.contentDatabase = this.initializeContentDatabase();
    this.userProfile = userProfileService;
  }

  // 문화 콘텐츠 데이터베이스 초기화
  initializeContentDatabase() {
    return [];
  }

  // 개인화된 콘텐츠 추천 메인 함수
  async getPersonalizedContentRecommendations(context = {}) {
    const userProfile = this.userProfile.getProfile();
    const interactions = this.userProfile.getInteractions();

    // 각 콘텐츠에 대한 개인화 점수 계산
    const scoredContents = this.contentDatabase.map((content) => ({
      ...content,
      personalizedScore: this.calculatePersonalizedScore(
        content,
        userProfile,
        interactions,
        context
      ),
    }));

    // 점수 기준으로 정렬하고 상위 추천 반환
    const recommendations = scoredContents
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
      .slice(0, 5)
      .map((content) => ({
        ...content,
        recommendationReason: this.generateRecommendationReason(
          content,
          userProfile,
          context
        ),
      }));

    return recommendations;
  }

  // 개인화 점수 계산 알고리즘
  calculatePersonalizedScore(content, userProfile, interactions, context) {
    let score = 0;

    // 1. 기본 인기도 점수 (20점)
    score += (content.rating / 5) * 20;

    // 2. 감정 기반 점수 (30점)
    if (context.mood && content.emotionTags) {
      const moodScore = this.calculateMoodScore(
        context.mood,
        content.emotionTags
      );
      score += moodScore * 30;
    }

    // 3. 장르 선호도 점수 (25점)
    if (userProfile.preferences.genres && content.genre) {
      const matchingGenres = userProfile.preferences.genres.filter((genre) =>
        content.genre.includes(genre)
      ).length;
      score += (matchingGenres / Math.max(content.genre.length, 1)) * 25;
    }

    // 4. 콘텐츠 유형 선호도 (15점)
    if (userProfile.preferences.contentTypes && content.type) {
      if (userProfile.preferences.contentTypes.includes(content.type)) {
        score += 15;
      }
    }

    // 5. 과거 상호작용 기반 점수 (10점)
    const typeInteractionScore = this.getTypeInteractionScore(
      content.type,
      interactions
    );
    score += typeInteractionScore;

    return Math.min(100, score); // 최대 100점으로 제한
  }

  // 감정 기반 점수 계산
  calculateMoodScore(mood, emotionTags) {
    // 감정 매핑 테이블
    const moodMap = {
      happy: ["행복", "신나는", "활력", "설렘", "로맨틱", "청량함"],
      sad: ["우울", "감성", "위로", "치유", "따뜻함", "공감"],
      angry: ["에너지", "강렬함", "긴장감"],
      neutral: ["편안함", "차분함", "지적호기심", "일상"],
      excited: ["신나는", "활력", "에너지", "경이로움"],
      relaxed: ["편안함", "차분함", "몽환적", "따뜻함"],
      stressed: ["집중", "차분함", "위로"],
      anxious: ["위로", "치유", "공감", "따뜻함"],
    };

    // 현재 감정에 맞는 태그 목록
    const relevantTags = moodMap[mood] || [];

    // 콘텐츠의 감정 태그와 현재 감정 관련 태그의 일치도 계산
    const matchingTags = emotionTags.filter(
      (tag) =>
        relevantTags.includes(tag) ||
        relevantTags.some((rt) => tag.includes(rt)) ||
        relevantTags.some((rt) => rt.includes(tag))
    ).length;

    return matchingTags / Math.max(emotionTags.length, 1);
  }

  // 콘텐츠 유형별 상호작용 점수 계산
  getTypeInteractionScore(type, interactions) {
    let score = 0;

    // 좋아요한 콘텐츠 유형
    const likedTypes =
      interactions.contentLikes?.map((like) => like.content.type) || [];
    const typeLikes = likedTypes.filter((t) => t === type).length;
    score += typeLikes * 3;

    // 조회한 콘텐츠 유형
    const viewedTypes =
      interactions.contentViews?.map((view) => view.content.type) || [];
    const typeViews = viewedTypes.filter((t) => t === type).length;
    score += typeViews * 1;

    return Math.min(10, score);
  }

  // 추천 이유 생성
  generateRecommendationReason(content, userProfile, context) {
    const reasons = [];

    // 감정 기반 이유
    if (context.mood && content.emotionTags) {
      const moodMap = {
        happy: "즐거운 기분을 더해줄",
        sad: "위로가 될 수 있는",
        angry: "마음을 진정시켜줄",
        neutral: "평온한 시간을 위한",
        excited: "흥분된 기분에 어울리는",
        relaxed: "편안한 휴식에 좋은",
        stressed: "스트레스 해소에 도움이 될",
        anxious: "불안한 마음을 달래줄",
      };

      if (moodMap[context.mood]) {
        reasons.push(
          `${moodMap[context.mood]} ${
            content.type === "book"
              ? "책"
              : content.type === "movie"
                ? "영화"
                : content.type === "music"
                  ? "음악"
                  : "플레이리스트"
          }`
        );
      }
    }

    // 장르 기반 이유
    if (userProfile.preferences.genres && content.genre) {
      const matchingGenres = userProfile.preferences.genres.filter((genre) =>
        content.genre.includes(genre)
      );
      if (matchingGenres.length > 0) {
        reasons.push(`선호하는 ${matchingGenres[0]} 장르`);
      }
    }

    // 높은 평점 기반 이유
    if (content.rating >= 4.5) {
      reasons.push(
        `평점 ${content.rating}점의 인기 ${
          content.type === "book"
            ? "도서"
            : content.type === "movie"
              ? "영화"
              : content.type === "music"
                ? "음악"
                : "플레이리스트"
        }`
      );
    }

    // 기본 이유
    if (reasons.length === 0) {
      reasons.push(
        `당신의 취향에 맞는 ${
          content.type === "book"
            ? "책"
            : content.type === "movie"
              ? "영화"
              : content.type === "music"
                ? "음악"
                : "플레이리스트"
        }`
      );
    }

    return reasons.slice(0, 2).join(", "); // 최대 2개 이유만 표시
  }

  // 콘텐츠 유형별 추천
  getRecommendationsByType(type, limit = 3, context = {}) {
    const userProfile = this.userProfile.getProfile();
    const interactions = this.userProfile.getInteractions();

    const typeContents = this.contentDatabase.filter(
      (content) => content.type === type
    );

    return typeContents
      .map((content) => ({
        ...content,
        personalizedScore: this.calculatePersonalizedScore(
          content,
          userProfile,
          interactions,
          context
        ),
        recommendationReason: this.generateRecommendationReason(
          content,
          userProfile,
          context
        ),
      }))
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
      .slice(0, limit);
  }

  // 감정별 맞춤 추천
  getRecommendationsByMood(mood, limit = 3) {
    return this.getPersonalizedContentRecommendations({ mood });
  }

  // 사용자 프로필 완성을 위한 질문 생성
  generateProfileQuestions() {
    const profile = this.userProfile.getProfile();
    const questions = [];

    if (
      !profile.preferences.contentTypes ||
      profile.preferences.contentTypes.length === 0
    ) {
      questions.push({
        type: "contentTypes",
        question: "어떤 종류의 콘텐츠를 좋아하시나요?",
        options: ["책", "영화", "음악", "플레이리스트"],
      });
    }

    if (
      !profile.preferences.genres ||
      profile.preferences.genres.length === 0
    ) {
      questions.push({
        type: "genres",
        question: "어떤 장르를 선호하시나요?",
        options: [
          "소설",
          "판타지",
          "SF",
          "로맨스",
          "스릴러",
          "코미디",
          "드라마",
          "인디",
          "팝",
          "클래식",
        ],
      });
    }

    return questions.slice(0, 1); // 한 번에 하나씩만 질문
  }
}

// 싱글톤 인스턴스
export const contentRecommendationEngine = new ContentRecommendationEngine();
