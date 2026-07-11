# Pilot Ops Center · Integrated Flight Ops Briefer

항공사 조종사용 **Integrated Flight Ops Briefer** (NOTAM + Joint Briefing).  
사이트: **https://boeing00.github.io/NOTAM-Briefer/**

## 주요 기능
- **NOTAM 분석** — PDF 업로드/원문 붙여넣기 → AI가 NOTAM을 추출·분류 (WARNING / CAUTION / ADVISORY)
- **직접 관련만 RED** — 내 FPL 항로(웨이포인트·항로)·사용 활주로에 직접 적용되는 것만 WARNING, 나머지는 ADVISORY
- **Joint Briefing PDF** — 브라우저에서 Joint Briefing PDF 바로 다운로드 (NOTAM 요약 선택 첨부)
- **항로 대조** — Page 2 서술형 항로 ↔ ICAO FPL Field 15 자동 대조
- **차트 데크** — 공항 차트 업로드 후 AI가 NOTAM 위치를 자동 하이라이트
- **오프라인 지원** — 서비스워커로 앱 셸 캐시
- **API 키** — 통합 홈 상단에서 한 번만 입력 (NOTAM·Joint AI 공유)

## 파일 구성
| 파일 | 설명 |
|------|------|
| `index.html` | **사이트 홈** · Integrated Flight Ops Briefer (NOTAM + Joint Briefing) |
| `notam.html` | Pilot Ops Center · EFB (NOTAM 전용, ①탭 iframe / 단독 사용) |
| `IntegratedFlightBriefer.html` | 구 URL 호환용 → `/` 로 리다이렉트 |
| `sw.js` | 서비스워커 (오프라인 앱 셸 캐시) |
| `.nojekyll` | GitHub Pages의 Jekyll 처리 비활성화 |

## 탭 구성 (홈)
| 탭 | 내용 |
|----|------|
| ① NOTAM 브리핑 | `notam.html` iframe · ANALYZE 후 요약 자동 전송 |
| ② Joint Briefing Briefer | FPL/OFP AI 추출 + Flight/Weather/Fuel 입력 |
| ③ Joint Briefing PDF | 브라우저에서 **PDF 바로 다운로드** |

NOTAM만 따로 쓰려면: https://boeing00.github.io/NOTAM-Briefer/notam.html

## 배포 (GitHub Pages)
1. 위 파일을 저장소에 커밋 · 푸시합니다.
2. 저장소 **Settings → Pages → Source** 를 `main` 브랜치 루트(`/`)로 설정합니다.
3. 몇 분 뒤 **https://boeing00.github.io/NOTAM-Briefer/** 에서 통합 앱이 열립니다.
4. iPhone·iPad Safari에서 **공유 → 홈 화면에 추가** 로 앱처럼 사용합니다.

> 서비스워커·Gemini API 호출은 **HTTPS** 에서만 동작합니다. 로컬 `file://` 에서는 API가 차단될 수 있습니다.

## 사용법
1. 상단에서 Gemini API Key 입력 (한 번만 · 원하면 저장).
2. ①탭에서 비행 패키지 PDF를 열고 **ANALYZE**.
3. ②탭에서 Joint Briefing 데이터를 채우거나 AI 추출.
4. ③탭에서 **PDF 다운로드**.

## 문의
For inquiries or suggestions, please contact **moonsikyim@gmail.com**.

© 2026 Moon-Sik Yim. All rights reserved.
