#!/usr/bin/env node

/**
 * Admin User Creation Script
 * 어드민 사용자 생성 스크립트
 * 
 * Usage: node scripts/create-admin.js <email> <password>
 * Example: node scripts/create-admin.js admin@company.com mypassword123
 */

const { createClient } = require('@supabase/supabase-js');
const CryptoJS = require('crypto-js');
require('dotenv').config();

const SALT = 'AIRSCHOOL_SALT_2024';

class AdminCreator {
  constructor() {
    this.supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    );
  }

  hashPassword(password) {
    const saltedPassword = password + SALT;
    const hash = CryptoJS.SHA256(saltedPassword);
    return hash.toString(CryptoJS.enc.Hex);
  }

  async createAdmin(email, password) {
    try {
      console.log(`🔧 어드민 계정 생성 중: ${email}`);
      
      const passwordHash = this.hashPassword(password);
      
      const { data, error } = await this.supabase
        .from('users')
        .insert({
          email: email,
          password_hash: passwordHash,
          role: 'admin',
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          console.log(`❌ 이미 존재하는 이메일: ${email}`);
          
          // 기존 사용자를 어드민으로 업그레이드
          const { data: updateData, error: updateError } = await this.supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('email', email)
            .select()
            .single();
            
          if (updateError) {
            console.error('업데이트 실패:', updateError.message);
            return false;
          }
          
          console.log(`✅ 기존 사용자를 어드민으로 업그레이드: ${email}`);
          return true;
        }
        
        console.error('어드민 생성 실패:', error.message);
        return false;
      }

      console.log(`✅ 어드민 계정 생성 성공!`);
      console.log(`   이메일: ${email}`);
      console.log(`   비밀번호: ${password}`);
      console.log(`   역할: admin`);
      console.log(`   ID: ${data.id}`);
      
      return true;
    } catch (error) {
      console.error('예상치 못한 오류:', error.message);
      return false;
    }
  }

  async listAdmins() {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('id, email, role, is_active, created_at')
        .eq('role', 'admin')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('어드민 목록 조회 실패:', error.message);
        return;
      }

      console.log(`\n👑 현재 어드민 사용자 목록 (총 ${data.length}명):`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      data.forEach((admin, index) => {
        const status = admin.is_active ? '✅ 활성' : '❌ 비활성';
        const date = new Date(admin.created_at).toLocaleString('ko-KR');
        console.log(`${index + 1}. ${admin.email}`);
        console.log(`   상태: ${status}`);
        console.log(`   생성일: ${date}`);
        console.log(`   ID: ${admin.id}`);
        console.log('');
      });
    } catch (error) {
      console.error('예상치 못한 오류:', error.message);
    }
  }
}

async function main() {
  const adminCreator = new AdminCreator();
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('\n📋 사용법:');
    console.log('  어드민 생성: node scripts/create-admin.js <이메일> <비밀번호>');
    console.log('  어드민 목록: node scripts/create-admin.js --list');
    console.log('\n📝 예시:');
    console.log('  node scripts/create-admin.js admin@company.com mypassword123');
    console.log('  node scripts/create-admin.js --list');
    console.log('');
    return;
  }

  if (args[0] === '--list' || args[0] === '-l') {
    await adminCreator.listAdmins();
    return;
  }

  if (args.length !== 2) {
    console.log('❌ 잘못된 인수. 이메일과 비밀번호를 모두 입력해주세요.');
    console.log('사용법: node scripts/create-admin.js <이메일> <비밀번호>');
    return;
  }

  const [email, password] = args;
  
  if (!email.includes('@')) {
    console.log('❌ 유효하지 않은 이메일 형식입니다.');
    return;
  }
  
  if (password.length < 6) {
    console.log('❌ 비밀번호는 최소 6자 이상이어야 합니다.');
    return;
  }

  await adminCreator.createAdmin(email, password);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AdminCreator };