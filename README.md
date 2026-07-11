# Pilot Ops Center · EFB

항공사 조종사용 EFB 스타일 NOTAM 브리핑 웹앱. 단일 HTML 파일로 동작하며, Gemini API로 비행 패키지/OFP를 분석해 출발·항로·도착·교체 공항 NOTAM을 중요도별로 분류합니다.

## 주요 기능
- **NOTAM 분석** — PDF 업로드/원문 붙여넣기 → AI가 NOTAM을 추출·분류 (WARNING / CAUTION / ADVISORY)
- **직접 관련만 RED** — 내 FPL 항로(웨이포인트·항로)·사용 활주로에 직접 적용되는 것만 WARNING, 나머지는 ADVISORY
- **항로 대조** — Page 2 서술형 항로 ↔ ICAO FPL Field 15 자동 대조 (좌표 표기 차이 정규화)
- **RWY / TWY / Taxi Route 필터** — 예상 활주로·유도로·택시루트 입력 → 관련 NOTAM만 집중 표시
- **차트 데크** — 공항 차트 업로드 후 AI가 NOTAM 위치를 자동 하이라이트
- **오프라인 지원** — 서비스워커로 앱 셸 캐시, 저장된 브리핑 오프라인 열람
- **API 키 보안 저장** — PIN 기반 AES-GCM 암호화

## 파일 구성
| 파일 | 설명 |
|------|------|
| `index.html` | Pilot Ops Center · EFB 본체 (NOTAM 브리핑) |
| `IntegratedFlightBriefer.html` | NOTAM + Joint Briefing 통합 UI (①탭에서 `index.html` iframe 연동) |
| `sw.js` | 서비스워커 (오프라인 앱 셸 캐시) — `index.html`과 같은 폴더 필수 |
| `.nojekyll` | GitHub Pages의 Jekyll 처리 비활성화 |

## Integrated Flight Ops Briefer
통합 UI 주소: `https://<user>.github.io/NOTAM-Briefer/IntegratedFlightBriefer.html`  
(루트 `/` 는 NOTAM 전용 `index.html`입니다.)

| 탭 | 내용 |
|----|------|
| ① NOTAM 브리핑 | 같은 폴더의 최신 `index.html` iframe · ANALYZE 후 요약 자동 전송 |
| ② Joint Briefing Briefer | FPL/OFP AI 추출 + Flight/Weather/Fuel 입력 |
| ③ PDF 스크립트 생성 | 원본 Joint Briefing Python(reportlab) `.py` 다운로드 (NOTAM 요약은 PDF 맨 뒤에만 추가) |

> 통합 앱·iframe 연동은 **HTTPS**(GitHub Pages)에서 가장 안정적입니다.

## 배포 (GitHub Pages)
1. 위 세 파일을 저장소에 커밋 · 푸시합니다.
2. 저장소 **Settings → Pages → Source** 를 `main` 브랜치 루트(`/`)로 설정합니다.
3. 몇 분 뒤 `https://<사용자명>.github.io/<저장소명>/` 에서 열립니다.
4. iPhone·iPad Safari에서 **공유 → 홈 화면에 추가** 로 앱처럼 사용합니다.

> 서비스워커·Gemini API 호출은 **HTTPS** 에서만 동작합니다. GitHub Pages는 HTTPS로 제공되므로 그대로 사용하면 됩니다. 로컬 `file://` 이나 미리보기 iframe 에서는 API가 차단됩니다.

## 사용법
1. 헤더에서 Gemini API Key 입력 (원하면 PIN으로 암호화 저장).
2. 비행 패키지 PDF를 열거나 원문을 붙여넣고 **ANALYZE**.
3. 필요 시 예상 RWY/TWY/Taxi Route 입력 → **관련만 보기** 로 공항 NOTAM 집중.

## 문의
For inquiries or suggestions, please contact **moonsikyim@gmail.com**.

© 2026 Moon-Sik Yim. All rights reserved.
