// 사용자 프로파일링 및 개인화 추천 시스템

export class UserProfileService {
  constructor() {
    this.storageKey = "duck_content_user_profile";
    this.interactionsKey = "duck_content_interactions";
    this.userProfile = this.loadProfile();
    this.interactions = this.loadInteractions();
  }

  // 로컬 저장소에서 프로필 불러오기
  loadProfile() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : this.getDefaultProfile();
    } catch (error) {
      console.error("Failed to load user profile:", error);
      return this.getDefaultProfile();
    }
  }

  // 기본 프로필 구조
  getDefaultProfile() {
    return {
      // 기본 인적 정보
      demographics: {
        age: null,
        gender: null,
        location: null,
        livingType: null, // '원룸', '아파트', '빌라', '주택'
        familySize: null,
      },

      // 라이프스타일
      lifestyle: {
        workStyle: null, // '재택근무', '출근', '학생', '프리랜서'
        hobbies: [],
        exerciseFrequency: null,
        cookingSkill: null,
        shoppingStyle: null, // '신중한편', '충동구매', '할인선호', '품질우선'
      },

      // 선호도
      preferences: {
        budget: {
          min: null,
          max: null,
          preferred: null,
        },
        categories: {}, // 카테고리별 관심도 점수
        genres: [], // 선호하는 장르
        contentTypes: [], // 선호하는 콘텐츠 유형 ('book', 'movie', 'music', 'playlist')
        creators: [], // 선호하는 창작자/아티스트
        mood: [], // 선호하는 감정/분위기
      },

      // 구매 패턴
      purchasePatterns: {
        frequency: null,
        averageOrderValue: null,
        seasonalPreferences: {},
        timePreferences: {}, // 언제 주로 쇼핑하는지
      },

      // 개인 상황
      context: {
        currentGoals: [], // '건강관리', '인테리어', '요리시작', '운동시작'
        problems: [], // '공간부족', '시간부족', '예산부족'
        priorities: [], // '편의성', '가격', '품질', '디자인'
      },
    };
  }

  // 상호작용 데이터 불러오기
  loadInteractions() {
    try {
      const saved = localStorage.getItem(this.interactionsKey);
      return saved
        ? JSON.parse(saved)
        : {
            conversations: [],
            contentViews: [],
            contentLikes: [],
            contentExperiences: [],
            searches: [],
          };
    } catch (error) {
      console.error("Failed to load interactions:", error);
      return {
        conversations: [],
        contentViews: [],
        contentLikes: [],
        contentExperiences: [],
        searches: [],
      };
    }
  }

  // 프로필 저장
  saveProfile() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.userProfile));
    } catch (error) {
      console.error("Failed to save user profile:", error);
    }
  }

  // 상호작용 데이터 저장
  saveInteractions() {
    try {
      localStorage.setItem(
        this.interactionsKey,
        JSON.stringify(this.interactions)
      );
    } catch (error) {
      console.error("Failed to save interactions:", error);
    }
  }

  // 대화를 통해 프로필 정보 업데이트
  updateFromConversation(transcript, emotion) {
    const updates = this.extractInfoFromText(transcript, emotion);
    this.mergeProfileUpdates(updates);

    // 대화 기록 저장
    this.interactions.conversations.push({
      timestamp: Date.now(),
      transcript,
      emotion: emotion?.emotion || "neutral",
      extractedInfo: updates,
    });

    this.saveProfile();
    this.saveInteractions();
  }

  // 텍스트에서 사용자 정보 추출
  extractInfoFromText(text, emotion) {
    const updates = {};
    const lowerText = text.toLowerCase();

    // 나이 추출
    const ageMatch = lowerText.match(/(\d+)살|(\d+)세/);
    if (ageMatch) {
      updates.age = parseInt(ageMatch[1] || ageMatch[2]);
    }

    // 거주 형태
    if (lowerText.includes("원룸") || lowerText.includes("오피스텔")) {
      updates.livingType = "원룸";
    } else if (lowerText.includes("아파트")) {
      updates.livingType = "아파트";
    }

    // 콘텐츠 선호도 키워드
    const contentKeywords = {
      책: "book",
      독서: "book",
      영화: "movie",
      음악: "music",
      노래: "music",
      플레이리스트: "playlist",
    };

    // 장르 키워드
    const genreKeywords = {
      소설: "소설",
      판타지: "판타지",
      SF: "SF",
      로맨스: "로맨스",
      스릴러: "스릴러",
      코미디: "코미디",
      드라마: "드라마",
      인디: "인디",
      팝: "팝",
      클래식: "클래식",
      힙합: "힙합",
    };

    // 콘텐츠 유형 추출
    Object.entries(contentKeywords).forEach(([keyword, contentType]) => {
      if (lowerText.includes(keyword)) {
        if (!updates.contentTypes) updates.contentTypes = [];
        if (!updates.contentTypes.includes(contentType)) {
          updates.contentTypes.push(contentType);
        }
      }
    });

    // 장르 추출
    Object.entries(genreKeywords).forEach(([keyword, genre]) => {
      if (lowerText.includes(keyword)) {
        if (!updates.genres) updates.genres = [];
        if (!updates.genres.includes(genre)) {
          updates.genres.push(genre);
        }
      }
    });

    // 기존 취미 추출 로직 유지
    const lifestyleKeywords = {
      요리: "cooking",
      운동: "exercise",
      게임: "gaming",
      독서: "reading",
      영화: "movies",
      여행: "travel",
      카페: "cafe",
    };

    Object.entries(lifestyleKeywords).forEach(([keyword, category]) => {
      if (lowerText.includes(keyword)) {
        if (!updates.hobbies) updates.hobbies = [];
        if (!updates.hobbies.includes(category)) {
          updates.hobbies.push(category);
        }
      }
    });

    // 예산 관련
    const budgetMatch = lowerText.match(/(\d+)만원|(\d+)천원/);
    if (budgetMatch) {
      const amount = parseInt(budgetMatch[1] || budgetMatch[2]);
      updates.budget = budgetMatch[1] ? amount * 10000 : amount * 1000;
    }

    // 쇼핑 스타일
    if (lowerText.includes("할인") || lowerText.includes("세일")) {
      updates.shoppingStyle = "할인선호";
    } else if (lowerText.includes("브랜드") || lowerText.includes("품질")) {
      updates.shoppingStyle = "품질우선";
    }

    // 현재 목표/문제점
    const problemKeywords = {
      공간: "공간부족",
      시간: "시간부족",
      돈: "예산부족",
      정리: "정리정돈",
    };

    Object.entries(problemKeywords).forEach(([keyword, problem]) => {
      if (lowerText.includes(keyword)) {
        if (!updates.problems) updates.problems = [];
        if (!updates.problems.includes(problem)) {
          updates.problems.push(problem);
        }
      }
    });

    return updates;
  }

  // 프로필 업데이트 병합
  mergeProfileUpdates(updates) {
    Object.entries(updates).forEach(([key, value]) => {
      if (key === "age" && value) {
        this.userProfile.demographics.age = value;
      } else if (key === "livingType" && value) {
        this.userProfile.demographics.livingType = value;
      } else if (key === "hobbies" && Array.isArray(value)) {
        this.userProfile.lifestyle.hobbies = [
          ...new Set([...this.userProfile.lifestyle.hobbies, ...value]),
        ];
      } else if (key === "budget" && value) {
        this.userProfile.preferences.budget.preferred = value;
      } else if (key === "shoppingStyle" && value) {
        this.userProfile.lifestyle.shoppingStyle = value;
      } else if (key === "problems" && Array.isArray(value)) {
        this.userProfile.context.problems = [
          ...new Set([...this.userProfile.context.problems, ...value]),
        ];
      } else if (key === "contentTypes" && Array.isArray(value)) {
        this.userProfile.preferences.contentTypes = [
          ...new Set([...this.userProfile.preferences.contentTypes, ...value]),
        ];
      } else if (key === "genres" && Array.isArray(value)) {
        this.userProfile.preferences.genres = [
          ...new Set([...this.userProfile.preferences.genres, ...value]),
        ];
      }
    });
  }

  // 콘텐츠 상호작용 기록
  recordContentInteraction(type, content) {
    const interaction = {
      timestamp: Date.now(),
      type, // 'view', 'like', 'experience'
      content: {
        id: content.id,
        title: content.title,
        type: content.type,
        creator: content.creator,
        genre: content.genre || [],
      },
    };

    switch (type) {
      case "view":
        this.interactions.contentViews.push(interaction);
        break;
      case "like":
        this.interactions.contentLikes.push(interaction);
        this.updateContentPreference(content.type, 1);
        if (content.genre) {
          content.genre.forEach((genre) =>
            this.updateGenrePreference(genre, 1)
          );
        }
        break;
      case "experience":
        this.interactions.contentExperiences.push(interaction);
        this.updateContentPreference(content.type, 3);
        if (content.genre) {
          content.genre.forEach((genre) =>
            this.updateGenrePreference(genre, 2)
          );
        }
        break;
    }

    this.saveInteractions();
  }

  // 콘텐츠 유형 선호도 업데이트
  updateContentPreference(contentType, weight) {
    if (!this.userProfile.preferences.contentTypes.includes(contentType)) {
      this.userProfile.preferences.contentTypes.push(contentType);
    }
    this.saveProfile();
  }

  // 장르 선호도 업데이트
  updateGenrePreference(genre, weight) {
    if (!this.userProfile.preferences.genres.includes(genre)) {
      this.userProfile.preferences.genres.push(genre);
    }
    this.saveProfile();
  }

  // 사용자 프로필 완성도 계산
  getProfileCompleteness() {
    const profile = this.userProfile;
    let total = 0;
    let filled = 0;

    // 기본 정보 체크
    Object.values(profile.demographics).forEach((value) => {
      total++;
      if (value) filled++;
    });

    // 라이프스타일 체크
    Object.entries(profile.lifestyle).forEach(([key, value]) => {
      total++;
      if (Array.isArray(value) ? value.length > 0 : value) filled++;
    });

    // 선호도 체크
    if (profile.preferences.budget.preferred) filled++;
    total++;

    return Math.round((filled / total) * 100);
  }

  // 현재 프로필 가져오기
  getProfile() {
    return this.userProfile;
  }

  // 상호작용 데이터 가져오기
  getInteractions() {
    return this.interactions;
  }
}

// 싱글톤 인스턴스
export const userProfileService = new UserProfileService();
