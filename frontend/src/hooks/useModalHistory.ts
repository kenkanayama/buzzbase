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
  // popstateイベント処理中かどうかを追跡（useEffectでの重複処理を防ぐ）
  const handlingPopStateRef = useRef(false);
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
      // 履歴フラグをリセット
      historyPushedRef.current = false;
      // onCloseを直接呼び出す（これでisOpenがfalseになる）
      onCloseRef.current();
      // 履歴を戻す（×ボタンやオーバーレイクリック時のみ）
      window.history.back();
    } else {
      // 履歴がない場合は直接閉じる
      onCloseRef.current();
    }
  }, []);

  // モーダルの開閉状態の変化を監視
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    // popstateイベント処理中の場合はスキップ
    // （「戻る」ジェスチャーで閉じた場合、追加の history.back() は不要）
    if (handlingPopStateRef.current) {
      handlingPopStateRef.current = false;
      return;
    }

    if (isOpen && !wasOpen && !historyPushedRef.current) {
      // モーダルが開いたとき: 履歴を追加
      window.history.pushState({ modalId, modalOpen: true }, '');
      historyPushedRef.current = true;
    }
    // 注意: モーダルが閉じたときに history.back() を呼ばない
    // 「戻る」ジェスチャー時はブラウザが既に履歴を戻しているため不要
    // ×ボタンやオーバーレイクリック時は closeModal() 内で処理
  }, [isOpen, modalId]);

  // popstateイベントのハンドリング（ブラウザの「戻る」ボタン/ジェスチャー用）
  useEffect(() => {
    const handlePopState = () => {
      // 履歴を追加していた場合のみ処理
      if (historyPushedRef.current) {
        // popstateイベント処理中であることをマーク
        // これにより、useEffectで余分な history.back() が呼ばれるのを防ぐ
        handlingPopStateRef.current = true;
        // 履歴フラグをリセット
        historyPushedRef.current = false;
        // モーダルがまだ開いている場合は閉じる
        // 注意: ここでは history.back() を呼ばない
        // ブラウザの「戻る」ジェスチャーによって既に履歴は戻っている
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

  return { closeModal };
}
