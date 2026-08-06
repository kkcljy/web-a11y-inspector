# Web A11Y Inspector

axe-core 기반 웹 접근성 검사기입니다. 대상 페이지를 iframe으로 로딩한 뒤 axe 검사와 커스텀 DOM 검사를 함께 실행하고, 결과를 실무자가 확인하기 쉬운 형태로 정리합니다.

## 구성

- `index.html`: 검사 메인 화면
- `guide.html`: 접근성 구현 가이드
- `lab.html`: 테스트 샘플 모음
- `api.html`: 내부 공유/확장 기능 안내 화면
- `assets/js/`: 검사 흐름, 엔진, 렌더러, 규칙, 저장소 코드
- `assets/scss/style.scss`: SCSS 원본 스타일
- `assets/css/style.css`: 브라우저 적용 CSS
- `assets/vendor/axe.min.js`: axe-core 라이브러리
- `samples/`: 접근성 테스트용 샘플 페이지

## 로컬 실행

정적 파일 기반 프로젝트라 별도 빌드 없이 로컬 서버에서 확인할 수 있습니다.

```bash
python3 -m http.server 4174
```

브라우저에서 아래 주소로 접속합니다.

```text
http://127.0.0.1:4174/
```

## 참고

브라우저 보안 정책 때문에 iframe에 로딩된 페이지가 같은 출처가 아니면 DOM 접근 및 axe 검사가 제한됩니다. 내부망에서 사용할 때는 검사기와 대상 샘플/페이지를 같은 서버 출처로 맞춰야 합니다.
