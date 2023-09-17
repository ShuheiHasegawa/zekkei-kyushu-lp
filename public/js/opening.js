(function () {
  let gsapTl = gsap.timeline();

  //1.5秒かけ黒色背景を表示
  gsapTl.to(".opening-bg", {
    duration: 1, //アニメーションの時間の設定
    opacity: 1, //表示状態の指定
  });

  //.textを1.5秒かけ出現させ1.5秒かけ逆再生させ初期状態に戻す
  gsapTl.to(".opening-text", {
    delay: 1, //アニメーションの初期遅延（アニメーションが開始されるまでの指定）
    duration: 1, //アニメーションの時間の設定
    opacity: 1, //表示状態の指定
    y: "0px", //cssでY軸-20pxから完了時0pxへの指定
    yoyo: true, //trueにすることで上記で指定したY軸の動きの逆再生
    repeat: 1, //yoyoのリピート回数
    //同じclass名のバリデーションの設定
    stagger: {
      each: 0.5, //ディレイ時間
    },
  });

  //初期遅延3.5秒かけてから.titleを表示
  // const openingTitle = document.querySelector(".opening-title span");
  gsapTl.to(".opening-title span", {
    // delay: 3.5, //アニメーションの初期遅延（アニメーションが開始されるまでの指定）
    duration: 1.5, //アニメーションの時間の設定
    opacity: 1, //表示状態の指定
    //同じclass名のバリデーションの設定
    stagger: {
      each: 0.2, //ディレイ時間
      from: "start", //出現方法の指定
    },
  });

  gsapTl.to(".opening-title span", {
    duration: 1,
    opacity: 0
  });

  const opBg = document.querySelector(".opening-bg");
  gsapTl.to(opBg, {
    // opacity: 0, //表示状態の指定
    onComplete: () => {
      opBg.style.display = 'none';
    }
  });
})();
