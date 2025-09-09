package com.duckchat.api.dto;

import com.duckchat.api.entity.ChatMessage;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageRequest {
    
    @NotBlank(message = "메시지 내용은 필수입니다.")
    private String content;
    
    @NotNull(message = "메시지 타입은 필수입니다.")
    private ChatMessage.MessageType type;
    
    private String emotionType;
    
    private Double emotionScore;
    
    private Long chatSessionId;
    
    // 음성 메타데이터 (음성 입력 시 사용)
    private VoiceMetadata voiceMetadata;
    
    // 음성 입력 여부
    @Builder.Default
    private Boolean isVoiceInput = false;
}
