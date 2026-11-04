# 簡報急救站

公開網站：[https://slide-rescue-study.nicebolt6.chatgpt.site](https://slide-rescue-study.nicebolt6.chatgpt.site)

目前公開網站由 Sites 託管，已完成部署；GitHub 儲存庫仍待建立與上傳。下方保留 GitHub Pages 的部署流程，之後也可以改用 Pages。

給大學生的繁體中文簡報改造指南。從「文字太多」「配色混亂」「重點不明顯」三個常見問題出發，每篇提供原創的修改前後示範、三個可操作步驟、四項檢查清單與一個小練習。示範統一使用虛構的「校園二手交換日」，方便比較同一份資訊如何改善。

這個專案也示範如何用 [AGENTS.md](AGENTS.md) 延續 AI 協作：教學內容存成 JSON，由共用模板產生網頁。新增文章時，AI 能依照固定格式補齊內容，首頁、分類與上下篇導覽會隨建置更新。

## 專案特色

- 純靜態網站，使用 Node.js 內建模組，無外部 API 或套件依賴。
- 支援關鍵字搜尋、分類篩選與修改前後對照。
- 檢查清單進度儲存在目前瀏覽器；換裝置或清除網站資料後需重新勾選。
- 使用相對路徑，適合部署至 GitHub Pages 的儲存庫子路徑。
- 內容驗證與頁面、連結檢查納入部署流程。

## 檔案結構

```text
AGENTS.md                    AI 開發規則與內容格式
README.md                    本機操作與部署說明
SUBMISSION.md                作業繳交草稿，請補上個人資料與實際連結
package.json                 Node.js 指令
content/guides/              正式教學 JSON；每篇檔名等於 slug
templates/guide.json          可複製的第四篇完整範本，不參與建置
src/                         共用頁面模板、樣式、互動程式與圖示
scripts/                     內容驗證、建置、檢查與預覽伺服器
.github/workflows/pages.yml  GitHub Pages 自動部署流程
dist/                        建置產物，請勿直接修改
```

若專案中有 `.openai/hosting.json`，它是 Sites 託管的識別設定；依 `AGENTS.md` 保留原有的 `project_id`。GitHub Pages 的網站內容由 `dist/` 提供。

## 本機建置與預覽

先安裝 Node.js 22 以上版本，並在終端機切換到包含 `package.json` 的 `slide-rescue` 專案資料夾。

```powershell
node --version
npm run check
npm run dev
```

不需要執行 `npm install`。開啟終端機顯示的預覽網址，預設為 `http://127.0.0.1:4173`。**預覽期間請保持該終端機與伺服器運作**；結束預覽時按 `Ctrl+C`。

本專案沒有自動監看來源檔。修改後，可在另一個終端機進入同一專案資料夾，執行 `npm run check` 再重新整理瀏覽器；也可以停止伺服器後重新執行 `npm run dev`。僅需產出網站時執行 `npm run build`。

## 依規則新增第四篇教學

請先閱讀 [AGENTS.md](AGENTS.md)。範本已填入完整的「簡報標題太模糊怎麼辦？」教學，使用未占用的 `weak-headlines` 與 `order: 4`。在專案根目錄執行：

```powershell
Copy-Item -LiteralPath 'templates/guide.json' -Destination 'content/guides/weak-headlines.json'
npm run check
npm run dev
```

複製前先確認目的地不存在，避免覆蓋已新增的文章。`templates/guide.json` 本身不會顯示在網站中，複製到 `content/guides/` 才會加入建置。

開啟首頁確認出現第四張卡片，搜尋「標題」並切換「內容精簡」分類。進入新文章，檢查五節內容、修改前後切換、四項清單、重新整理後進度、上下篇連結、手機版與鍵盤導覽。

要寫其他主題時，修改這份新 JSON 的全部內容，使用唯一的小寫英文 `slug`、相同檔名及未使用的正整數 `order`。沿用三個既有分類之一，保留三步驟與四項檢查條件。不要編輯 `dist/` 或手動新增首頁卡片；執行 `npm run check` 會自動更新網站。若要加入第五篇，請更換 slug 與 order，不要直接複製後保留原值。

可交給 AI 的新增指令：

> 請先閱讀 AGENTS.md 與 README.md，依既有格式新增一篇簡報教學。使用獨立的 content/guides/檔名.json，保持 slug 與檔名一致，使用未占用的 order，沿用既有分類與示範樣式。三個步驟需可操作，四項檢查需可自行判斷。修改前後沿用同一個虛構活動與一致事實。完成後執行 npm run check，檢查首頁、教學頁及導覽，回報實際結果。

## 上傳 GitHub：方案 A，使用 Git push

先在 GitHub 建立自己的 **Public** 儲存庫，例如命名為 `slide-rescue`。此方案請建立空白儲存庫，不預先加入 README、`.gitignore` 或授權檔。複製 GitHub 顯示的 HTTPS 儲存庫網址。

在本機專案根目錄先執行 `npm run check`，再執行以下 PowerShell 指令。`Read-Host` 會讓你貼上剛建立的實際儲存庫網址：

```powershell
git init
git branch -M main
git add .
git commit -m "Create slide rescue guide website"
$repositoryUrl = Read-Host '貼上自己新建儲存庫的 HTTPS URL'
git remote add origin $repositoryUrl
git push -u origin main
```

以上是新專案首次上傳的操作。若專案已經有 Git 記錄或 `origin`，先用 `git status` 與 `git remote -v` 確認目前狀態，再沿用既有儲存庫。登入或授權依 GitHub／Git 的畫面操作。

## 上傳 GitHub：方案 B，使用網頁上傳

1. 在 GitHub 建立自己的 Public 儲存庫；此方案可先勾選建立 README，進入檔案列表。
2. 選 **Add file → Upload files**，上傳本專案根目錄內的來源檔案與資料夾，包含 `content/`、`src/`、`scripts/`、`templates/`、`AGENTS.md`、`README.md`、`SUBMISSION.md`、`package.json` 與 `.gitignore`。上傳的是專案資料夾內的內容，不要多包一層 `slide-rescue/`；也不需要上傳 `dist/`、預覽截圖或壓縮檔。
3. 填寫提交訊息，將變更提交至 `main`。上傳完成後，確認儲存庫根目錄直接看得到 `package.json` 與 `AGENTS.md`。
4. 若 `.github` 隱藏資料夾沒有一起上傳，選 **Add file → Create new file**，檔名輸入 `.github/workflows/pages.yml`，將本機同名檔案的全部文字貼上，再提交至 `main`。`.gitignore` 若未上傳，也可用相同方式建立。
5. 開啟儲存庫內的 `.github/workflows/pages.yml`，確認內容存在；只上傳 ZIP 檔不會建立網站。

檔案與資料夾上傳的操作可參考 [GitHub 官方說明](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)。

## 啟用 GitHub Pages Actions

完成任一上傳方案後：

1. 進入儲存庫的 **Settings → Pages**。
2. 在 **Build and deployment → Source** 選擇 **GitHub Actions**。
3. 進入 **Actions**，選取 **Deploy GitHub Pages** 工作流程。若需要先啟用 Actions，依 GitHub 顯示的提示啟用。
4. 若尚未成功部署，選 **Run workflow → main → Run workflow**。此流程也會在之後每次推送至 `main` 時自動執行。
5. 等待 `build` 與 `deploy` 都成功。流程會使用 Node.js 22 執行 `npm run check`，再將 `dist/` 發布至 `github-pages` 環境。
6. 在成功的部署或 **Settings → Pages** 開啟 GitHub 提供的實際網站連結。確認首頁與任一教學頁可開啟、搜尋和檢查清單可使用。
7. 將實際的 Repository 與網站連結填入 [SUBMISSION.md](SUBMISSION.md)，完成個人資料後再繳交。

若流程失敗，先開啟失敗的步驟查看原因；格式錯誤回本機執行 `npm run check`，修改來源後重新提交。若 Pages 設定尚未啟用，完成第二步後重跑工作流程。操作依據為 [GitHub Pages 自訂工作流程官方說明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 已完成的驗證

- `npm run check` 通過：3 篇正式教學、5 個 HTML（含 404）、78 個站內連結與資源。
- 依規則複製第四篇範本後，檢查通過：4 篇教學、6 個 HTML、99 個連結與資源；首頁自動產生新卡片，並建立新頁面及上下篇導覽。驗證後已恢復三篇初版，第四篇保留在範本。
- 瀏覽器實測：首頁修改前後切換、分類篩選、搜尋無結果、顯示全部、教學導覽、清單勾選、重整保存與重新檢查。
- 320px 寬度的首頁與教學頁未出現整頁水平溢出；教學主要正文為 16px。
- 公開部署由 Sites 回報成功。GitHub Actions 尚未在實際 GitHub 儲存庫執行，待上傳後驗證。

本文件不預填尚未建立的儲存庫連結。GitHub 上傳完成後，將實際網址補入繳交草稿。
