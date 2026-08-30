/**
 * 捲動進場動畫。
 *
 * 由 index.html 結尾用 import() 動態載入，只有在 <html> 帶著 js-reveal
 * （代表瀏覽器支援 IntersectionObserver 且使用者沒有要求減少動態效果）時才會載。
 *
 * 安全機制：任何一步出錯或逾時，都會把 reveal-all 加到 <html>，讓內容直接顯示，
 * 不會因為 JS 出問題而整頁看不到東西。
 */

const root = document.documentElement;

/** 保底：直接顯示所有元素（仍保留轉場，看起來像正常淡入）。 */
const showAll = () => root.classList.add('reveal-all');

// index.html 的 inline script 設了一個計時器，模組接手後就取消它。
clearTimeout(window.__yaRevealGuard);

try {
  const els = document.querySelectorAll('[data-reveal]');

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // 同時進入視窗的元素依序延遲，做出接連出現的效果
        setTimeout(() => entry.target.classList.add('is-in'), i * 70);
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  els.forEach((el) => io.observe(el));

  // 最後保險：8 秒後如果一個都沒被觸發，代表 observer 沒在運作，直接全部顯示。
  // 只要有任何一個成功淡入就不動作，才不會害還沒往下捲的訪客提前看到全部動畫。
  setTimeout(() => {
    if (!document.querySelector('[data-reveal].is-in')) showAll();
  }, 8000);
} catch {
  showAll();
}
