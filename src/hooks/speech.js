/**
 * Web Speech API 타입 정의 (JSDoc 주석 형태)
 * 
 * 이 파일은 Web Speech API에 대한 참조 정보를 제공합니다.
 * JavaScript에서는 실제 런타임 코드에 영향을 주지 않지만,
 * IDE의 자동완성 및 문서화에 도움이 될 수 있습니다.
 */

/**
 * SpeechRecognition 인터페이스
 * @typedef {Object} SpeechRecognition
 * @property {boolean} continuous - 연속 인식 여부
 * @property {SpeechGrammarList} grammars - 문법 목록
 * @property {boolean} interimResults - 중간 결과 반환 여부
 * @property {string} lang - 인식할 언어
 * @property {number} maxAlternatives - 대체 결과 최대 수
 * @property {string} serviceURI - 서비스 URI
 * @property {function} start - 인식 시작
 * @property {function} stop - 인식 중지
 * @property {function} abort - 인식 중단
 * @property {function|null} onaudiostart - 오디오 시작 이벤트 핸들러
 * @property {function|null} onaudioend - 오디오 종료 이벤트 핸들러
 * @property {function|null} onend - 인식 종료 이벤트 핸들러
 * @property {function|null} onerror - 오류 이벤트 핸들러
 * @property {function|null} onnomatch - 일치 항목 없음 이벤트 핸들러
 * @property {function|null} onresult - 결과 이벤트 핸들러
 * @property {function|null} onsoundstart - 소리 시작 이벤트 핸들러
 * @property {function|null} onsoundend - 소리 종료 이벤트 핸들러
 * @property {function|null} onspeechstart - 음성 시작 이벤트 핸들러
 * @property {function|null} onspeechend - 음성 종료 이벤트 핸들러
 * @property {function|null} onstart - 인식 시작 이벤트 핸들러
 */

/**
 * SpeechRecognitionEvent 인터페이스
 * @typedef {Object} SpeechRecognitionEvent
 * @property {number} resultIndex - 결과 인덱스
 * @property {SpeechRecognitionResultList} results - 인식 결과 목록
 */

/**
 * SpeechRecognitionErrorEvent 인터페이스
 * @typedef {Object} SpeechRecognitionErrorEvent
 * @property {string} error - 오류 유형 ('no-speech', 'aborted', 'audio-capture', 'network', 'not-allowed', 'service-not-allowed', 'bad-grammar', 'language-not-supported')
 * @property {string} [message] - 오류 메시지
 */

/**
 * SpeechRecognitionResultList 인터페이스
 * @typedef {Object} SpeechRecognitionResultList
 * @property {number} length - 결과 목록 길이
 * @property {function} item - 인덱스로 항목 가져오기
 */

/**
 * SpeechRecognitionResult 인터페이스
 * @typedef {Object} SpeechRecognitionResult
 * @property {boolean} isFinal - 최종 결과 여부
 * @property {number} length - 결과 길이
 * @property {function} item - 인덱스로 항목 가져오기
 */

/**
 * SpeechRecognitionAlternative 인터페이스
 * @typedef {Object} SpeechRecognitionAlternative
 * @property {string} transcript - 인식된 텍스트
 * @property {number} confidence - 인식 신뢰도
 */

/**
 * 감정 분석 결과 인터페이스
 * @typedef {Object} EmotionAnalysis
 * @property {number} confidence - 신뢰도
 * @property {'neutral'|'happy'|'sad'|'angry'|'sarcastic'|'excited'|'frustrated'} emotion - 감정 유형
 * @property {number} pitch - 음성 피치
 * @property {number} speed - 음성 속도
 * @property {number} volume - 음성 볼륨
 * @property {string} description - 감정 설명
 */

/**
 * 음성 인식 결과 인터페이스
 * @typedef {Object} SpeechResult
 * @property {string} transcript - 인식된 텍스트
 * @property {EmotionAnalysis} emotion - 감정 분석 결과
 * @property {number} confidence - 인식 신뢰도
 */

// 이 파일은 실제 코드를 내보내지 않고, 참조용으로만 사용됩니다.
export {};
