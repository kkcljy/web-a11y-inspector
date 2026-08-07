# A11Y Inspector Brand Guide

## 브랜드명

A11Y Inspector

제품 설명은 "웹 접근성 검사 및 자동화 도구"이다. 헤더 로고 영역에는 설명을 상시 노출하지 않고, 메인 시작 화면, README, 보고서 또는 소개 영역에서 필요한 경우에만 사용한다.

## 로고 의미

심볼은 웹 요소를 검사하는 포커스 프레임, 접근성 검사 항목을 나타내는 목록, 검사와 분석을 나타내는 돋보기를 조합한다.

로고는 실무 도구로서의 식별성과 작은 크기에서의 판독성을 우선한다. 그라데이션, 그림자, 장식 효과는 사용하지 않는다.

현재 `assets/images/brand/`의 SVG 파일은 공통 헤더와 파비콘 연결을 위한 임시 리소스다. 확정된 Option 2B 원본 SVG가 전달되면 동일 파일 경로의 SVG를 교체한다. 이번 공통 레이아웃 작업에서는 심볼을 재디자인하거나 임의 수정하지 않는다.

## 로고 파일 경로

- `assets/images/brand/logo.svg`: 밝은 배경용 심볼 + 워드마크
- `assets/images/brand/logo-dark.svg`: 어두운 배경용 심볼 + 워드마크
- `assets/images/brand/symbol.svg`: 밝은 배경용 심볼
- `assets/images/brand/symbol-dark.svg`: 어두운 배경용 심볼
- `assets/images/brand/favicon.svg`: 브라우저 탭용 단순화 심볼

## 컬러 토큰

Primary:

- `--brand-primary: #2563EB`
- `--brand-primary-hover: #1D4ED8`
- `--brand-primary-active: #1E40AF`
- `--brand-primary-soft: #EFF6FF`

Secondary:

- `--brand-secondary: #4F46E5`
- `--brand-secondary-soft: #EEF2FF`

Text:

- `--text-primary: #0F172A`
- `--text-secondary: #334155`
- `--text-muted: #64748B`
- `--text-disabled: #94A3B8`

Background and border:

- `--background-page: #F8FAFC`
- `--background-surface: #FFFFFF`
- `--background-subtle: #F1F5F9`
- `--border-default: #CBD5E1`
- `--border-subtle: #E2E8F0`
- `--border-strong: #94A3B8`

Status:

- `--status-danger: #DC2626`
- `--status-danger-soft: #FEF2F2`
- `--status-danger-border: #FECACA`
- `--status-warning: #D97706`
- `--status-warning-soft: #FFFBEB`
- `--status-warning-border: #FDE68A`
- `--status-success: #059669`
- `--status-success-soft: #ECFDF5`
- `--status-success-border: #A7F3D0`
- `--status-info: #0284C7`
- `--status-info-soft: #F0F9FF`
- `--status-info-border: #BAE6FD`
- `--status-neutral: #64748B`
- `--status-neutral-soft: #F1F5F9`
- `--status-neutral-border: #CBD5E1`

## 로고 최소 크기

- 심볼: 화면 표시 기준 최소 20px
- 헤더 심볼: 28px 권장
- 워드마크 포함 로고: 가로 160px 이상 권장
- favicon: 32px 기준으로 제작

## 로고 여백

로고 주변에는 심볼 폭의 50% 이상 여백을 둔다. 헤더에서 심볼과 워드마크 사이 간격은 10px 이상을 유지한다.

## 밝은 배경과 어두운 배경 사용법

밝은 배경에서는 `symbol.svg` 또는 `logo.svg`를 사용한다.

어두운 배경에서는 `symbol-dark.svg` 또는 `logo-dark.svg`를 사용한다.

단색이 필요한 경우 밝은 배경에서는 `#0F172A`, 어두운 배경에서는 `#FFFFFF`을 사용한다.

## 잘못된 사용 예

- 로고에 그라데이션을 추가하지 않는다.
- 로고에 그림자나 입체 효과를 추가하지 않는다.
- 심볼과 워드마크의 비율을 임의로 찌그러뜨리지 않는다.
- 브랜드 Primary 컬러를 오류나 경고 상태 표현에 사용하지 않는다.
- Secondary 컬러를 일반 버튼이나 기본 링크에 남용하지 않는다.
- 헤더 로고 영역에 제품 설명을 항상 붙이지 않는다.

## 검사 상태 컬러 사용 원칙

브랜드 컬러와 검사 결과 상태 컬러는 분리한다.

상태는 색상만으로 전달하지 않는다. 상태 텍스트, 아이콘, 배지명, 보조 설명 중 하나 이상을 함께 제공한다.

오류 상태 입력 요소도 키보드 포커스를 받으면 파란색 포커스 링을 유지한다. 오류 여부는 입력 테두리, 아이콘, 오류 메시지로 별도 표현한다.

## 추후 수정 시 주의사항

이번 브랜드 적용은 대규모 UI 개편이 아니다. 검사 기능, axe 실행 구조, 커스텀 규칙, 결과 데이터 구조, Drawer 동작, iframe 처리, 저장 및 복원 기능은 브랜드 작업과 분리해서 다룬다.

새 화면이나 보고서를 만들 때는 이 문서의 로고 파일과 컬러 토큰을 우선 사용한다. 문서와 코드가 충돌할 경우 임의로 구현하지 말고 문서를 기준으로 검토한다.

확정 로고를 반영할 때는 다음 파일 경로를 유지한다.

- `assets/images/brand/logo.svg`
- `assets/images/brand/logo-dark.svg`
- `assets/images/brand/symbol.svg`
- `assets/images/brand/symbol-dark.svg`
- `assets/images/brand/favicon.svg`
