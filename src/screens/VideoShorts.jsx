import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VideoShorts = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [videos, setVideos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRefs = useRef([]);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8090/api/videos/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('네트워크 응답이 올바르지 않습니다');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setVideos(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('동영상을 불러오는데 실패했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.play().catch(err => console.log('재생 오류:', err));
      } else {
        currentVideo.pause();
      }
    }

    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentIndex) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentIndex, isPlaying]);

  const handleSwipeUp = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // 마지막 동영상에서 위로 스와이프 시 메인 화면으로 돌아가면서 피드백 요청
      handleVideoFeedback();
    }
  };

  const handleSwipeDown = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVideoFeedback = () => {
    // 동영상 시청 완료 정보를 localStorage에 저장
    const feedbackData = {
      watchedVideos: videos.length,
      lastVideoIndex: currentIndex,
      timestamp: new Date().toISOString(),
      videoTitles: videos.map(video => video.title)
    };
    
    localStorage.setItem('videoFeedback', JSON.stringify(feedbackData));
    
    // 피드백 요청 플래그 설정
    localStorage.setItem('requestVideoFeedback', 'true');
    
    // 메인 화면으로 이동
    navigate('/');
  };

  const handleTouchStart = useRef({ y: 0, time: 0 });
  const handleTouchEnd = useRef({ y: 0, time: 0 });

  const onTouchStart = (e) => {
    handleTouchStart.current = {
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const onTouchEnd = (e) => {
    handleTouchEnd.current = {
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };

    const deltaY = handleTouchStart.current.y - handleTouchEnd.current.y;
    const deltaTime = handleTouchEnd.current.time - handleTouchStart.current.time;
    const velocity = Math.abs(deltaY) / deltaTime;

    if (Math.abs(deltaY) > 50 && velocity > 0.3) {
      if (deltaY > 0) {
        handleSwipeUp();
      } else {
        handleSwipeDown();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">동영상 로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button 
          onClick={() => navigate('/')}
          className="text-white px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col">
        <div className="text-white text-xl mb-4">추천할 동영상이 없습니다</div>
        <button 
          onClick={() => navigate('/')}
          className="text-white px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white font-bold text-lg ml-2">추천 동영상</h1>
        </div>
      </div>

      {/* 동영상 컨테이너 */}
      <div 
        className="relative h-screen"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          key={currentIndex}
          className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out"
        >
          <video
            ref={(el) => (videoRefs.current[currentIndex] = el)}
            src={`http://localhost:8090${videos[currentIndex]?.url}`}
            className="w-full h-full object-cover"
            autoPlay={isPlaying}
            loop
            muted={false}
            controls={false}
            onClick={togglePlayPause}
          />
          
          {/* 재생/일시정지 오버레이 */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-4">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* 동영상 정보 */}
        <div className="absolute bottom-20 left-0 right-0 z-10 p-6">
          <div className="text-white">
            <h2 className="text-xl font-bold mb-2">
              {videos[currentIndex]?.title}
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-75">
                {currentIndex + 1} / {videos.length}
              </span>
              <button
                onClick={togglePlayPause}
                className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 스와이프 인디케이터 */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col space-y-2">
          {videos.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-8 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* 스와이프 힌트 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="text-white text-sm bg-black/50 px-3 py-2 rounded-full">
            {currentIndex === 0 && "위로 스와이프해서 다음 동영상 보기"}
            {currentIndex > 0 && currentIndex < videos.length - 1 && "위/아래 스와이프로 동영상 전환"}
            {currentIndex === videos.length - 1 && "위로 스와이프하면 메인으로 돌아갑니다"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoShorts;