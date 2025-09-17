const { chromium } = require('playwright');

async function checkConsoleErrors() {
  console.log('🔍 브라우저 콘솔 오류 확인 중...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 콘솔 메시지 수집
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    console.log(`[${type.toUpperCase()}] ${text}`);
  });
  
  // 페이지 오류 수집
  page.on('pageerror', error => {
    console.log('❌ Page Error:', error.message);
  });
  
  try {
    // 앱 페이지 방문
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');
    
    // 추가 시간 대기 (React 컴포넌트 로딩 확인)
    await page.waitForTimeout(3000);
    
    console.log('\n📊 수집된 콘솔 메시지:');
    consoleMessages.forEach((msg, i) => {
      console.log(`${i+1}. [${msg.type}] ${msg.text}`);
    });
    
    // DOM 구조 확인
    const bodyHTML = await page.$eval('body', el => el.innerHTML);
    console.log('\n📋 현재 DOM 구조 (처음 1000자):');
    console.log(bodyHTML.substring(0, 1000));
    
  } catch (error) {
    console.error('❌ 스크립트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

checkConsoleErrors();