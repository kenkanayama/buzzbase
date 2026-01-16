import { useEffect, useCallback, useRef } from 'react';

/**
 * モーダルの開閉状態をブラウザ履歴と連携させるカスタムフック
 *
 * スマホの「戻る」ジェスチャーでモーダルを閉じられるようにする
 *
 * @param isOpen モーダルが開いているかどうか
 * @param onClose モーダルを閉じる際のコールバック
 * @param modalId 複数モーダルを区別するためのユニークID
 */
export function useModalHistory(isOpen: boolean, onClose: () => void, modalId: string) {
  // 履歴を追加したかどうかを追跡
  const historyPushedRef = useRef(false);
  // closeModalから呼ばれたかどうかを追跡（popstateハンドラでの二重処理を防ぐ）
  const closingFromCloseModalRef = useRef(false);
  // onCloseのref（依存関係の問題を避けるため）
  const onCloseRef = useRef(onClose);
  // isOpenのref（popstateハンドラ内で最新の値を参照するため）
  const isOpenRef = useRef(isOpen);
  // 前回のisOpen値を追跡（変更を検出するため）
  const prevIsOpenRef = useRef(isOpen);

  // refを最新の値に更新
  useEffect(() => {
    onCloseRef.current = onClose;
    isOpenRef.current = isOpen;
  });

  // モーダルを閉じる（×ボタンやオーバーレイクリック時に使用）
  const closeModal = useCallback(() => {
    if (historyPushedRef.current) {
      // closeModalから呼ばれたことをマーク
      closingFromCloseModalRef.current = true;
      // 履歴フラグをリセット
      historyPushedRef.current = false;
      // onCloseを直接呼び出す（これでisOpenがfalseになる）
      onCloseRef.current();
      // 履歴を戻す
      window.history.back();
      // フラグをリセット（次のpopstateイベント用）
      // 非同期でリセットすることで、popstateイベントが処理される前にリセットされないようにする
      setTimeout(() => {
        closingFromCloseModalRef.current = false;
      }, 0);
    } else {
      // 履歴がない場合は直接閉じる
      onCloseRef.current();
    }
  }, []);

  // モーダルの開閉状態の変化を監視
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    if (isOpen && !wasOpen && !historyPushedRef.current) {
      // モーダルが開いたとき: 履歴を追加
      window.history.pushState({ modalId, modalOpen: true }, '');
      historyPushedRef.current = true;
    } else if (!isOpen && wasOpen && historyPushedRef.current) {
      // モーダルが閉じられたが、履歴がまだ残っている場合
      // （closeModalを経由せずに閉じられた場合のフォールバック）
      // closeModalから呼ばれた場合は既にhistoryPushedRefがfalseになっているので
      // この条件には入らない
      historyPushedRef.current = false;
      window.history.back();
    }
  }, [isOpen, modalId]);

  // popstateイベントのハンドリング（ブラウザの「戻る」ボタン/ジェスチャー用）
  useEffect(() => {
    const handlePopState = () => {
      // closeModalから呼ばれた場合は処理をスキップ（既にonCloseが呼ばれているため）
      if (closingFromCloseModalRef.current) {
        return;
      }

      // 履歴を追加していた場合のみ処理
      if (historyPushedRef.current) {
        historyPushedRef.current = false;
        // モーダルがまだ開いている場合は閉じる
        if (isOpenRef.current) {
          onCloseRef.current();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // 依存関係を空にして、イベントリスナーの再登録を防ぐ

  // 注意: コンポーネントのアンマウント時に history.back() を呼ばない
  // これを呼ぶと、ページ遷移時に意図しない「戻る」が発生してしまう
  // 例: モーダルを開いた状態でリンクをクリックして別ページに遷移すると、
  //     新しいページに行った直後に前のページに戻されてしまう

  return { closeModal };
}
