const { chromium } = require('playwright');

async function checkScreen() {
  console.log('🔍 현재 앱 화면 확인 중...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // 앱 페이지 방문
    await page.goto('http://localhost:8082');
    await page.waitForLoadState('networkidle');
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'current-app-screen.png', fullPage: true });
    console.log('📸 스크린샷 저장: current-app-screen.png');
    
    // 페이지 타이틀 확인
    const title = await page.title();
    console.log('📄 페이지 타이틀:', title);
    
    // 현재 URL 확인
    const url = page.url();
    console.log('🌐 현재 URL:', url);
    
    // 페이지의 텍스트 내용 확인
    const bodyText = await page.$eval('body', el => el.innerText);
    console.log('📝 페이지 내용 (처음 500자):');
    console.log(bodyText.substring(0, 500));
    
    // 버튼과 링크 요소들 확인
    const buttons = await page.$$eval('button', buttons => buttons.map(btn => btn.textContent));
    console.log('🔘 발견된 버튼들:', buttons);
    
    const links = await page.$$eval('a', links => links.map(link => link.textContent));
    console.log('🔗 발견된 링크들:', links);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

checkScreen();