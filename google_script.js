/**
 * Google Sheets 後端接收腳本 (Google Apps Script)
 * 
 * 使用方式：
 * 1. 在 Google 雲端硬碟建立一個新的「Google 試算表」。
 * 2. 點擊選單的「擴充功能」->「Apps Script」。
 * 3. 將原本編輯器中的程式碼清空，並貼上此段程式碼。
 * 4. 點擊上方的「儲存」圖示（或按 Ctrl+S）。
 * 5. 點擊右上角的「部署」->「新增部署」。
 * 6. 選取類型為「網頁應用程式」(Web App)。
 * 7. 設定如下：
 *    - 說明：填入「家長回饋收集」
 *    - 指派給：您的 Google 帳號 (Me)
 *    - 誰能存取：所有人 (Anyone) （這一步非常重要，否則家長填表時會權限不足）
 * 8. 點擊「部署」，並授予必要的 Google 帳號權限。
 * 9. 部署完成後，複製產生的「網頁應用程式 URL」（這就是我們要貼入 index.html 的 API 網址）。
 */

function doPost(e) {
  // 取得目前開啟的試算表與工作表
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // 設定 CORS 標頭，允許跨網域存取
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  
  try {
    var name = "";
    var email = "";
    var feedback = "";
    
    // 解析傳入的資料（相容 JSON 格式與一般表單格式）
    if (e.postData && e.postData.contents) {
      try {
        var data = JSON.parse(e.postData.contents);
        name = data.name || "";
        email = data.email || "";
        feedback = data.feedback || "";
      } catch (parseError) {
        // 如果不是 JSON，嘗試解析為 URL 編碼表單
        var params = e.parameter;
        name = params.name || "";
        email = params.email || "";
        feedback = params.feedback || "";
      }
    } else {
      var params = e.parameter;
      name = params.name || "";
      email = params.email || "";
      feedback = params.feedback || "";
    }
    
    // 檢查必填欄位
    if (!name || !feedback) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "error", 
        message: "姓名與回饋欄位皆為必填！" 
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    }
    
    // 寫入資料到試算表的新行：[填表時間, 姓名, Email, 給老師的回饋]
    var timestamp = new Date();
    sheet.appendRow([timestamp, name, email, feedback]);
    
    // 回傳成功訊息
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: "資料已成功送出！" 
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
    
  } catch (err) {
    // 發生錯誤時回傳錯誤訊息
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: err.toString() 
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  }
}

// 處理 OPTIONS 請求（瀏覽器發送跨網域 POST 前的預檢）
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}

// 提供簡單的 GET 測試
function doGet(e) {
  return ContentService.createTextOutput("Google Sheets Web App 運作中！請使用 POST 傳送表單資料。");
}
