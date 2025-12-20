/**
 * Firestore接続テストスクリプト
 * 
 * 使用方法:
 * node scripts/test-firestore.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

// サービスアカウントキーのパス
const serviceAccountPath = path.join(__dirname, '..', 'gcp-service-account.json');

// データベースID（デフォルト以外のデータベースを使用）
const DATABASE_ID = 'sincere-kit-buzzbase';

async function main() {
  console.log('=== Firestore接続テスト開始 ===\n');

  // 1. Firebase Admin SDK 初期化
  console.log('1. Firebase Admin SDK 初期化...');
  try {
    const serviceAccount = require(serviceAccountPath);
    console.log(`   プロジェクトID: ${serviceAccount.project_id}`);
    
    initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('   ✅ 初期化成功\n');
  } catch (error) {
    console.error('   ❌ 初期化失敗:', error.message);
    process.exit(1);
  }

  // 2. Firestore接続（特定のデータベースを指定）
  console.log(`2. Firestoreデータベース接続 (${DATABASE_ID})...`);
  let db;
  try {
    db = getFirestore(DATABASE_ID);
    console.log('   ✅ 接続成功\n');
  } catch (error) {
    console.error('   ❌ 接続失敗:', error.message);
    process.exit(1);
  }

  // 3. テストドキュメントの作成
  const testDocId = 'test-user-' + Date.now();
  console.log(`3. テストドキュメント作成 (users/${testDocId})...`);
  try {
    const userRef = db.collection('users').doc(testDocId);
    await userRef.set({
      email: 'test@example.com',
      displayName: 'Test User',
      createdAt: new Date(),
      lastLoginAt: new Date(),
    });
    console.log('   ✅ 作成成功\n');
  } catch (error) {
    console.error('   ❌ 作成失敗:', error.message);
    console.error('   詳細:', error);
    process.exit(1);
  }

  // 4. ドキュメントの読み取り
  console.log(`4. ドキュメント読み取り (users/${testDocId})...`);
  try {
    const userRef = db.collection('users').doc(testDocId);
    const doc = await userRef.get();
    if (doc.exists) {
      console.log('   ✅ 読み取り成功');
      console.log('   データ:', JSON.stringify(doc.data(), null, 2));
    } else {
      console.log('   ⚠️ ドキュメントが見つかりません');
    }
    console.log('');
  } catch (error) {
    console.error('   ❌ 読み取り失敗:', error.message);
    process.exit(1);
  }

  // 5. ドキュメントの更新
  console.log(`5. ドキュメント更新 (users/${testDocId})...`);
  try {
    const userRef = db.collection('users').doc(testDocId);
    await userRef.update({
      displayName: 'Updated Test User',
      updatedAt: new Date(),
    });
    console.log('   ✅ 更新成功\n');
  } catch (error) {
    console.error('   ❌ 更新失敗:', error.message);
    process.exit(1);
  }

  // 6. ドキュメントの削除
  console.log(`6. ドキュメント削除 (users/${testDocId})...`);
  try {
    const userRef = db.collection('users').doc(testDocId);
    await userRef.delete();
    console.log('   ✅ 削除成功\n');
  } catch (error) {
    console.error('   ❌ 削除失敗:', error.message);
    process.exit(1);
  }

  console.log('=== すべてのテストが成功しました ===');
  console.log('\nFirestoreへの接続・CRUD操作は正常に動作しています。');
  console.log('フロントエンドからの書き込みが失敗する場合は、以下を確認してください:');
  console.log('  - Firestoreセキュリティルールがデプロイされているか');
  console.log('  - フロントエンドが正しいデータベースIDを使用しているか');
  console.log('  - ユーザーが正しく認証されているか');
}

main().catch(console.error);

