# 대마과 요원 파일 · 캐릭터 소개 모션

CoC 7판 「리와인드 시나리오」 캐릭터 소개 모션 템플릿이에요. 1200×1700, 7초 분량이고, 브라우저 안에서만 돌아가요(서버 없음).

```
슬레이트 → 종이 실루엣(포스터 몽타주) → 스포트라이트 → 캐릭터 마스크 글리치 → 프로필
```

- 이미지와 정보를 넣으면 실루엣, 마스크, 얼굴 크롭이 자동으로 만들어져요.
- 주소 끝에 `#group`을 붙이면 4인 인트로(슬레이트 → 실루엣 라인업 → 글리치)가 재생돼요.
- 배경은 원본 리소스가 아니라 **합성이 끝난 이미지**(`assets/bg/`)만 들어 있어요.

---

## 폴더 구조

```
index.html              템플릿 전체 (화면 + 타임라인 + 편집 패널)
assets/characters/      캐릭터 전신 · 표정 (투명 배경 webp)
assets/bg/              합성된 배경 (슬레이트 1장, 실루엣 장면 5장)
assets/fx/              클래퍼, 필름, 종이 질감, 글리치 스프라이트
fonts/                  Pretendard 서브셋 (KS X 1001 한글 + 라틴)
tools/render.mjs        내 컴퓨터에서 MP4 뽑는 보조 도구
CLAUDE.md               터미널(Claude Code) 작업용 설명서
```

## 내 맥에서 열어보기

```bash
cd oss-intro
npx serve -l 5173 .        # 또는: python3 -m http.server 5173
```
브라우저에서 http://localhost:5173 을 여세요.
`index.html`을 더블클릭해서 바로 열면 이미지 처리가 막히니 꼭 이렇게 열어주세요.

## GitHub Pages로 무료 배포

1. GitHub에서 새 저장소를 만들어요. 예: `oss-intro`, Public
2. 터미널에서 아래를 실행해요.
   ```bash
   cd oss-intro
   git remote add origin https://github.com/<아이디>/oss-intro.git
   git push -u origin main
   ```
3. 저장소의 **Settings → Pages → Build and deployment**에서 Source를 `Deploy from a branch`, Branch를 `main` / `/ (root)`로 고르고 Save를 눌러요.
4. 1~2분 뒤 `https://<아이디>.github.io/oss-intro/` 로 열려요.

## 캐릭터 추가하기

`index.html` 안의 `CHARACTERS` 배열에 항목을 하나 추가하고, 이미지를 `assets/characters/`에 넣어요.
페이지 편집 패널에서 입력한 뒤 **설정 JSON 복사**로 값을 받아 붙여도 돼요.

## 내 컴퓨터에서 MP4 뽑기 (임시)

브라우저 안에서 바로 다운로드하는 기능은 아직 작업 전이에요(`CLAUDE.md`의 다음 작업 참고). 그전까지는 이렇게 뽑을 수 있어요.

```bash
brew install ffmpeg
npm install && npx playwright install chromium
npm run render -- calvin     # out/calvin.mp4
npm run render -- group      # out/group_intro.mp4
```

## 주의

- 원본 포스터, 스티커, 글리치 영상은 이 저장소에 넣지 마세요. 합성본만 커밋해요. git은 한 번 올라간 파일을 기록에 남겨요.
- 비상업 무료 배포 용도예요.
