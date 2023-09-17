/**
 * ランダムな数値を返却する
 * @param {*} min
 * @param {*} max
 * @returns
 */
function getRandom(min, max) {
  let random = Math.floor(Math.random() * (max + 1 - min)) + min;

  return random;
}

/**
 * @param {*} NUM 値
 * @param {*} LEN 桁数
 * @returns
 */
function zeroPadding(NUM, LEN) {
  return (Array(LEN).join("0") + NUM).slice(-LEN);
}
