import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { connectFirestoreEmulator, Firestore, initializeFirestore } from 'firebase/firestore';

// Firebase設定
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firestoreデータベース名（デフォルト以外のデータベースを使用）
const FIRESTORE_DATABASE_ID = 'sincere-kit-buzzbase';

// Firebase設定が有効かチェック
const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// Firebase初期化
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);

    // デバッグ用: Firebase設定をログに出力（本番環境でも確認可能）
    console.log('Firebase initialized:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      currentHostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
    });

    // 特定のFirestoreデータベースに接続
    db = initializeFirestore(app, {}, FIRESTORE_DATABASE_ID);

    // 開発環境でエミュレーターに接続
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.warn('🔧 Firebase Emulator に接続しました');
    }
  } catch (error) {
    console.error('Firebase初期化エラー:', error);
  }
} else {
  console.warn('⚠️ Firebase設定が見つかりません。.envファイルを確認してください。');
}

export { auth, db, isFirebaseConfigured };
export default app;
