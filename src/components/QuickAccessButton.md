# QuickAccessButton 컴포넌트

QuickAccessButton은 애플리케이션 내에서 빠른 접근이 필요한 기능에 사용할 수 있는 낮은 결합도를 가진 재사용 가능한 버튼 컴포넌트입니다.

## 특징

- 낮은 결합도: 특정 기능에 종속되지 않고 다양한 상황에서 재사용 가능
- 유연한 위치 지정: 화면의 네 모서리 중 원하는 위치에 배치 가능
- 다양한 스타일 옵션: 크기, 색상, 라벨 등 커스터마이징 가능
- 접근성 고려: aria-label 지원

## 사용법

```jsx
import QuickAccessButton from '@/components/QuickAccessButton';
import { ShoppingBag } from 'lucide-react';

// 기본 사용법
<QuickAccessButton
  icon={<ShoppingBag className="h-5 w-5" />}
  label="상품 보기"
  onClick={() => navigate('/products')}
/>

// 위치, 스타일 등 커스터마이징
<QuickAccessButton
  icon={<ShoppingBag className="h-5 w-5" />}
  label="상품 보기"
  onClick={() => navigate('/products')}
  position="bottom-right"
  variant="ghost"
  size="md"
  showLabel={true}
  labelPosition="top"
/>
```

## Props

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| icon | ReactNode | 필수 | 버튼에 표시할 아이콘 |
| label | string | - | 버튼에 표시할 텍스트 (선택 사항) |
| onClick | Function | 필수 | 클릭 이벤트 핸들러 |
| position | string | 'bottom-right' | 버튼 위치 ('bottom-right', 'bottom-left', 'top-right', 'top-left') |
| className | string | - | 추가 스타일 클래스 |
| size | string | 'md' | 버튼 크기 ('sm', 'md', 'lg') |
| variant | string | 'primary' | 버튼 스타일 ('primary', 'secondary', 'ghost') |
| showLabel | boolean | false | 라벨 표시 여부 |
| labelPosition | string | 'bottom' | 라벨 위치 ('top', 'bottom', 'left', 'right') |

## 크기 가이드

- `sm`: 40px x 40px (w-10 h-10)
- `md`: 48px x 48px (w-12 h-12)
- `lg`: 56px x 56px (w-14 h-14)

## 스타일 가이드

- `primary`: 강조된 색상으로 주요 액션에 사용
- `secondary`: 흰색 배경의 기본 스타일
- `ghost`: 반투명 배경의 가벼운 스타일

## 제거 방법

낮은 결합도로 설계되어 있어 필요 없을 경우 쉽게 제거할 수 있습니다:

1. MainScreen.jsx 파일에서 QuickAccessButton import 구문 제거
2. MainScreen.jsx 파일에서 QuickAccessButton 컴포넌트 사용 부분 제거
3. QuickAccessButton.jsx 파일 삭제

이렇게 하면 애플리케이션의 다른 부분에 영향을 주지 않고 기능을 제거할 수 있습니다.
