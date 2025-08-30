import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  ExternalLink,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useThemeContext } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { contentRecommendationEngine } from "@/services/contentRecommendationEngine";
import { userProfileService } from "@/services/userProfile";
import contentApi from "@/api/contentApi";

export const ContentScreen = ({ selectedContent = null, onContentLiked, onNavigateToMain }) => {
  const navigate = useNavigate();
  const [personalizedContents, setPersonalizedContents] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likedContents, setLikedContents] = useState([]);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);

  // 개인화된 콘텐츠 또는 선택된 콘텐츠 사용
  const currentContents = selectedContent
    ? [selectedContent]
    : personalizedContents.length > 0
      ? personalizedContents
      : [];
  const currentContent = currentContents[currentIndex];

  // 개인화된 추천 로드
  useEffect(() => {
    const loadPersonalizedRecommendations = async () => {
      try {
        setIsLoading(true);

        // 선택된 콘텐츠가 있으면 그것만 사용
        if (selectedContent) {
          setPersonalizedContents([selectedContent]);
          setIsLoading(false);
          return;
        }

        // API를 통해 콘텐츠 가져오기 - 일반 콘텐츠와 로컬 비디오 모두 가져오기
        const [contentResponse, localVideoResponse] = await Promise.all([
          contentApi.getAllContents(),
          contentApi.getLocalVideos()
        ]);
        
        let combinedContents = [];
        
        // 일반 콘텐츠 추가
        if (contentResponse.success && contentResponse.data.length > 0) {
          combinedContents.push(...contentResponse.data);
        }
        
        // 로컬 동영상 추가 - 콘텐츠 형태로 변환
        if (localVideoResponse.success && localVideoResponse.data.length > 0) {
          const videoContents = localVideoResponse.data.map(video => ({
            id: video.id,
            title: video.title,
            type: 'video',
            creator: '덕키 추천',
            description: `${video.title} - 로컬 동영상`,
            coverImage: '/video-thumbnail.jpg', // 기본 썸네일
            url: `http://localhost:8090${video.url}`,
            filename: video.filename,
            isLocal: true,
            rating: 4.8,
            reviewCount: 100,
            year: 2024,
            duration: '짧은 영상',
            genre: ['힐링', '재미'],
            emotionTags: ['happy', 'relaxed']
          }));
          combinedContents.push(...videoContents);
        }
        
        if (combinedContents.length > 0) {
          setPersonalizedContents(combinedContents);
        } else {
          const msg = '콘텐츠를 찾을 수 없습니다.';
          console.error(msg);
          setLoadError(msg);
        }
      } catch (error) {
        console.error("Failed to load personalized recommendations:", error);
        // 로컬 폴백 제거: 에러 상태로 표시
        setLoadError(error.message || String(error));
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonalizedRecommendations();
  }, [selectedContent]);

  // 터치 스와이프 핸들러
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe) {
      handleNext();
    }
    if (isDownSwipe) {
      handlePrev();
    }
  };

  const handleNext = () => {
    if (selectedContent) return; // 선택된 콘텐츠가 있으면 넘기지 않음

    setCurrentIndex((prev) => (prev + 1) % currentContents.length);
    setIsLiked(false);

    // 콘텐츠 조회 기록
    if (currentContent) {
      userProfileService.recordContentInteraction("view", {
        id: currentContent.id,
        title: currentContent.title,
        type: currentContent.type,
        creator: currentContent.creator,
      });
    }
  };

  const handlePrev = () => {
    if (selectedContent) return; // 선택된 콘텐츠가 있으면 넘기지 않음

    setCurrentIndex(
      (prev) => (prev - 1 + currentContents.length) % currentContents.length
    );
    setIsLiked(false);

    // 콘텐츠 조회 기록
    if (currentContent) {
      userProfileService.recordContentInteraction("view", {
        id: currentContent.id,
        title: currentContent.title,
        type: currentContent.type,
        creator: currentContent.creator,
      });
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      setLikedContents((prev) => [...prev, currentContent]);
      onContentLiked?.(currentContent);

      // 좋아요 상호작용 기록
      userProfileService.recordContentInteraction("like", {
        id: currentContent.id,
        title: currentContent.title,
        type: currentContent.type,
        creator: currentContent.creator,
      });
    } else {
      setLikedContents((prev) =>
        prev.filter((p) => p.id !== currentContent.id)
      );
    }
  };

  const handleExperience = () => {
    // 콘텐츠 체험 시작
    setIsRedirecting(true);

    // 콘텐츠 체험 기록
    userProfileService.recordContentInteraction("experience", {
      id: currentContent.id,
      title: currentContent.title,
      type: currentContent.type,
      creator: currentContent.creator,
    });

    // 3초 후 피드백 프롬프트 표시 (실제로는 콘텐츠 체험 후)
    setTimeout(() => {
      setIsRedirecting(false);
      setShowFeedbackPrompt(true);
    }, 3000);
  };

  const handleReturnToChat = () => {
    // 채팅으로 돌아가기
    onNavigateToMain();
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">
            너에게 딱 맞는 콘텐츠를 찾고 있어...
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">😵‍💫 콘텐츠 로드 중 오류가 발생했습니다.</p>
          <p className="text-white/70 mb-6">{loadError}</p>
          <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-white/20 text-white rounded-full">대화하러 가기</button>
        </div>
      </div>
    );
  }

  if (isRedirecting) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">🦆 콘텐츠로 이동 중...</p>
          <p className="text-white/70 mt-2">
            외부 앱이나 웹사이트로 이동합니다
          </p>
        </div>
      </div>
    );
  }

  if (showFeedbackPrompt) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
        <div className="text-center px-6 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6">
            <img
              src="/duck-character.png"
              alt="덕키"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-white text-xl font-bold mb-4">
            콘텐츠는 어땠어요?
          </h2>
          <p className="text-white/80 mb-8">
            {currentContent.title}에 대한 감상을 나눠주세요! 더 정확한 추천을
            위해 도움이 됩니다.
          </p>
          <button
            onClick={handleReturnToChat}
            className="w-full py-3 bg-white text-black rounded-full font-medium mb-4"
          >
            대화로 돌아가기
          </button>
          <button
            onClick={() => setShowFeedbackPrompt(false)}
            className="w-full py-3 bg-white/20 text-white rounded-full"
          >
            다른 콘텐츠 보기
          </button>
        </div>
      </div>
    );
  }

  if (!currentContent) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">
            😅 추천할 콘텐츠를 찾지 못했어!
          </p>
          <p className="text-white/70">덕키와 더 대화해서 취향을 알려줘!</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-white/20 text-white rounded-full"
          >
            대화하러 가기
          </button>
        </div>
      </div>
    );
  }

  // 콘텐츠 타입별 아이콘
  const getContentIcon = (type) => {
    switch (type) {
      case "book":
        return "📚";
      case "movie":
        return "🎬";
      case "music":
        return "🎵";
      case "playlist":
        return "🎧";
      case "video":
        return "🎥";
      default:
        return "🎭";
    }
  };

  // 콘텐츠 타입별 경험 버튼 텍스트
  const getExperienceButtonText = (type) => {
    switch (type) {
      case "book":
        return "읽기";
      case "movie":
        return "시청하기";
      case "music":
        return "듣기";
      case "playlist":
        return "재생하기";
      case "video":
        return "재생하기";
      default:
        return "체험하기";
    }
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
        {/* 배경 이미지 또는 비디오 */}
        {currentContent.type === 'video' && currentContent.isLocal ? (
          // 로컬 비디오인 경우 비디오 플레이어 표시
          <div className="absolute inset-0">
            <video
              className="w-full h-full object-cover"
              controls
              autoPlay
              loop
              muted
            >
              <source src={currentContent.url} type="video/mp4" />
              비디오를 재생할 수 없습니다.
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80"></div>
          </div>
        ) : (
          // 일반 콘텐츠인 경우 배경 이미지 표시
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentContent.coverImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80"></div>
          </div>
        )}

        {/* 상단 헤더 */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-12 px-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="text-white text-sm font-medium">
              {currentContent.type === "book"
                ? "도서"
                : currentContent.type === "movie"
                  ? "영화"
                  : currentContent.type === "music"
                    ? "음악"
                    : currentContent.type === "video"
                      ? "동영상"
                      : "플레이리스트"}
            </div>
            <div className="w-10 h-10"></div>
          </div>
        </div>

        {/* 우측 액션 버튼들 */}
        <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center space-y-6">
          {/* 크리에이터 아이콘 */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl border-2 border-white">
              {getContentIcon(currentContent.type)}
            </div>
          </div>

          {/* 좋아요 버튼 */}
          <button
            onClick={handleLike}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
              <Heart
                className={cn(
                  "w-7 h-7",
                  isLiked ? "text-red-500 fill-current" : "text-white"
                )}
              />
            </div>
            <span className="text-white text-xs font-medium">
              {isLiked ? likedContents.length + 1 : likedContents.length}
            </span>
          </button>

          {/* 체험하기 버튼 */}
          <button
            onClick={handleExperience}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <ExternalLink className="w-6 h-6 text-black" />
            </div>
            <span className="text-white text-xs font-medium">
              {getExperienceButtonText(currentContent.type)}
            </span>
          </button>
        </div>

        {/* 하단 콘텐츠 정보 */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-8">
          <div className="space-y-3">
            {/* 크리에이터 정보 */}
            <div className="flex items-center space-x-2">
              <span className="text-white font-semibold">
                {currentContent.creator}
              </span>
            </div>

            {/* 콘텐츠 제목 */}
            <h2 className="text-white text-2xl font-bold">
              {currentContent.title}
            </h2>

            {/* 콘텐츠 설명 */}
            <p className="text-white text-sm leading-relaxed">
              {currentContent.description}
            </p>

            {/* 장르 태그 */}
            <div className="flex flex-wrap gap-2 mt-2">
              {currentContent.genre && Array.isArray(currentContent.genre) && currentContent.genre.map((tag, index) => (
                <span
                  key={index}
                  className="text-white/80 text-xs bg-white/20 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 감정 태그 */}
            <div className="flex flex-wrap gap-2">
              {currentContent.emotionTags && Array.isArray(currentContent.emotionTags) && currentContent.emotionTags.map((tag, index) => (
                <span
                  key={index}
                  className="text-blue-300 text-xs bg-blue-500/20 px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* 콘텐츠 정보 카드 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 mt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {currentContent.year}년
                    </span>
                    <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                      {currentContent.duration}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      평점 {currentContent.rating}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({currentContent.reviewCount}명)
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">
                    {currentContent.recommendationReason ||
                      "당신의 취향에 맞는 추천"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 수직 스크롤 인디케이터 (여러 콘텐츠가 있을 때만 표시) */}
        {currentContents.length > 1 && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20">
            <div className="flex flex-col items-center space-y-2">
              <button onClick={handlePrev}>
                <ChevronUp className="w-6 h-6 text-white/60" />
              </button>

              {/* 진행 인디케이터 */}
              <div className="flex flex-col space-y-1">
                {currentContents.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-1 h-6 rounded-full transition-all duration-300",
                      index === currentIndex ? "bg-white" : "bg-white/30"
                    )}
                  />
                ))}
              </div>

              <button onClick={handleNext}>
                <ChevronDown className="w-6 h-6 text-white/60" />
              </button>
            </div>
          </div>
        )}
    </div>
  );
};
