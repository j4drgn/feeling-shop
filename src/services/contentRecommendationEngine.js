// 감성 기반 문화 콘텐츠 추천 엔진
import { userProfileService } from "./userProfile.js";

export class ContentRecommendationEngine {
  constructor() {
    this.contentDatabase = this.initializeContentDatabase();
    this.userProfile = userProfileService;
  }

  // 문화 콘텐츠 데이터베이스 초기화
  initializeContentDatabase() {
    return [
      // 책 추천
      {
        id: "book_01",
        type: "book",
        title: "아몬드",
        creator: "손원평",
        genre: ["소설", "한국문학", "성장"],
        year: 2017,
        description: "감정을 느끼지 못하는 소년 윤재의 특별한 성장 이야기",
        coverImage:
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=687&auto=format&fit=crop",
        emotionTags: ["공감", "따뜻함", "위로", "성장"],
        rating: 4.5,
        reviewCount: 1250,
        duration: "약 4시간",
        reviews: [
          "마음이 아픈 사람들에게 위로가 되는 책",
          "감정을 느끼는 것의 의미를 다시 생각하게 됨",
          "담담한 문체 속에 깊은 울림이 있는 소설",
        ],
      },
      {
        id: "book_02",
        type: "book",
        title: "사피엔스",
        creator: "유발 하라리",
        genre: ["역사", "인문", "과학"],
        year: 2015,
        description:
          "인류의 역사와 문명의 발전을 통찰력 있게 분석한 베스트셀러",
        coverImage:
          "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=1476&auto=format&fit=crop",
        emotionTags: ["지적호기심", "통찰", "깨달음"],
        rating: 4.8,
        reviewCount: 3200,
        duration: "약 8시간",
        reviews: [
          "인류의 역사를 새로운 시각으로 바라볼 수 있게 해준 책",
          "지식의 폭이 넓어지는 느낌",
          "어렵지 않게 읽히면서도 깊이 있는 내용",
        ],
      },
      {
        id: "book_03",
        type: "book",
        title: "달러구트 꿈 백화점",
        creator: "이미예",
        genre: ["소설", "판타지", "힐링"],
        year: 2020,
        description:
          "잠들어야만 입장할 수 있는 꿈 백화점에서 일어나는 특별한 이야기",
        coverImage:
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1374&auto=format&fit=crop",
        emotionTags: ["위로", "판타지", "따뜻함", "치유"],
        rating: 4.6,
        reviewCount: 2800,
        duration: "약 5시간",
        reviews: [
          "지친 일상에 작은 위로가 되는 책",
          "꿈에 대한 새로운 시각을 제시해줌",
          "잠들기 전 읽기 좋은 따뜻한 이야기",
        ],
      },

      // 영화 추천
      {
        id: "movie_01",
        type: "movie",
        title: "인터스텔라",
        creator: "크리스토퍼 놀란",
        genre: ["SF", "모험", "드라마"],
        year: 2014,
        description:
          "자원 고갈로 인류의 멸망이 예고된 미래, 새로운 거주지를 찾아 우주로 떠나는 탐험",
        coverImage:
          "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1471&auto=format&fit=crop",
        emotionTags: ["경이로움", "감동", "가족애", "희망"],
        rating: 4.8,
        reviewCount: 5600,
        duration: "2시간 49분",
        reviews: [
          "우주의 경이로움과 인간의 사랑을 동시에 느낄 수 있는 영화",
          "시간이 가는 줄 모르고 몰입했다",
          "과학적 사실에 기반한 SF 영화의 걸작",
        ],
      },
      {
        id: "movie_02",
        type: "movie",
        title: "어바웃 타임",
        creator: "리차드 커티스",
        genre: ["로맨스", "판타지", "드라마"],
        year: 2013,
        description:
          "시간을 되돌릴 수 있는 능력을 가진 청년이 사랑과 일상의 소중함을 깨닫는 이야기",
        coverImage:
          "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1459&auto=format&fit=crop",
        emotionTags: ["로맨틱", "따뜻함", "감동", "일상의 소중함"],
        rating: 4.7,
        reviewCount: 4200,
        duration: "2시간 3분",
        reviews: [
          "삶의 소중한 순간들을 다시 생각하게 만드는 영화",
          "시간을 되돌릴 수 있다면 어떻게 쓸지 고민하게 됨",
          "따뜻한 감성이 오래 남는 작품",
        ],
      },
      {
        id: "movie_03",
        type: "movie",
        title: "기생충",
        creator: "봉준호",
        genre: ["드라마", "스릴러", "블랙코미디"],
        year: 2019,
        description:
          "전원백수인 기택네 가족과 IT기업 CEO 박사장네 가족 사이에서 벌어지는 예기치 못한 사건",
        coverImage:
          "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1450&auto=format&fit=crop",
        emotionTags: ["긴장감", "사회비판", "블랙코미디"],
        rating: 4.9,
        reviewCount: 6800,
        duration: "2시간 12분",
        reviews: [
          "계급 사회에 대한 날카로운 비판과 연출력",
          "끝까지 예측할 수 없는 전개에 몰입했다",
          "한국 영화의 새 역사를 쓴 작품",
        ],
      },

      // 음악 추천
      {
        id: "music_01",
        type: "music",
        title: "신호등",
        creator: "이무진",
        genre: ["K-Pop", "인디", "발라드"],
        year: 2021,
        description: "일상 속 선택의 순간들을 신호등에 비유한 공감가는 노래",
        coverImage:
          "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=1374&auto=format&fit=crop",
        emotionTags: ["공감", "위로", "일상"],
        rating: 4.7,
        reviewCount: 3500,
        duration: "3분 35초",
        reviews: [
          "일상의 고민을 담백하게 표현한 가사가 공감됨",
          "중독성 있는 멜로디가 하루종일 맴돈다",
          "운전할 때 듣기 좋은 노래",
        ],
      },
      {
        id: "music_02",
        type: "music",
        title: "Blueming",
        creator: "아이유",
        genre: ["K-Pop", "팝", "록"],
        year: 2019,
        description: "사랑에 빠진 설렘을 청량하게 표현한 밝은 분위기의 곡",
        coverImage:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1470&auto=format&fit=crop",
        emotionTags: ["설렘", "청량함", "행복"],
        rating: 4.8,
        reviewCount: 4100,
        duration: "3분 38초",
        reviews: [
          "봄에 듣기 좋은 상큼한 노래",
          "아이유 특유의 청량한 보컬이 돋보이는 곡",
          "기분 좋은 날 들으면 더 행복해지는 노래",
        ],
      },
      {
        id: "music_03",
        type: "music",
        title: "Dynamite",
        creator: "방탄소년단",
        genre: ["K-Pop", "댄스", "팝"],
        year: 2020,
        description: "디스코 팝 장르의 경쾌한 리듬으로 활력을 주는 곡",
        coverImage:
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1470&auto=format&fit=crop",
        emotionTags: ["신나는", "활력", "행복"],
        rating: 4.9,
        reviewCount: 8200,
        duration: "3분 19초",
        reviews: [
          "들으면 기분이 좋아지는 노래",
          "중독성 있는 멜로디와 가사가 인상적",
          "운동할 때 듣기 좋은 곡",
        ],
      },

      // 플레이리스트 추천
      {
        id: "playlist_01",
        type: "playlist",
        title: "비 오는 날 감성 플레이리스트",
        creator: "멜론 큐레이션",
        genre: ["발라드", "인디", "어쿠스틱"],
        year: 2023,
        description:
          "창밖으로 내리는 빗소리와 함께 듣기 좋은 감성적인 노래 모음",
        coverImage:
          "https://images.unsplash.com/photo-1501999635878-71cb5379c2d8?q=80&w=1469&auto=format&fit=crop",
        emotionTags: ["감성", "편안함", "몽환적", "우울"],
        rating: 4.6,
        reviewCount: 2300,
        duration: "약 1시간 20분",
        tracks: [
          "아이유 - 비의 랩소디",
          "헤이즈 - 비도 오고 그래서",
          "폴킴 - 비",
        ],
        reviews: [
          "비 오는 날 창가에서 듣기 좋은 플레이리스트",
          "감성이 한층 깊어지는 선곡",
          "조용한 카페에서 듣기 좋은 곡들",
        ],
      },
      {
        id: "playlist_02",
        type: "playlist",
        title: "출퇴근길 활력 충전 플레이리스트",
        creator: "스포티파이 코리아",
        genre: ["팝", "댄스", "K-Pop"],
        year: 2023,
        description:
          "아침을 활기차게 시작하거나 퇴근길 피로를 날려줄 에너지 넘치는 노래 모음",
        coverImage:
          "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1470&auto=format&fit=crop",
        emotionTags: ["활력", "신나는", "에너지"],
        rating: 4.7,
        reviewCount: 3100,
        duration: "약 50분",
        tracks: ["BTS - Dynamite", "싸이 - That That", "ITZY - WANNABE"],
        reviews: [
          "아침에 듣기 좋은 활력 충전 플레이리스트",
          "지하철에서 들으면 출퇴근이 즐거워짐",
          "운동할 때도 듣기 좋은 선곡",
        ],
      },
      {
        id: "playlist_03",
        type: "playlist",
        title: "집중력 향상 로파이 플레이리스트",
        creator: "유튜브 뮤직",
        genre: ["로파이", "인스트루멘탈", "재즈"],
        year: 2023,
        description: "공부나 업무 시 집중력을 높여주는 차분한 로파이 비트 모음",
        coverImage:
          "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1470&auto=format&fit=crop",
        emotionTags: ["차분함", "집중", "편안함"],
        rating: 4.8,
        reviewCount: 4200,
        duration: "약 2시간",
        tracks: [
          "Chillhop Music - Maple Leaf",
          "Lofi Girl - Sleepy Fish",
          "Kupla - Roots",
        ],
        reviews: [
          "공부할 때 배경음악으로 최고",
          "가사가 없어서 집중하기 좋음",
          "편안한 분위기로 장시간 들어도 질리지 않음",
        ],
      },
    ];
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
