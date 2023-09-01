gsap.fromTo(
  ".circle",
  { y: -30 },
  {
    y: 30,
    ease: "power1.inOut", // 進行具合
    stagger: {
      each: 0.15, // アニメーション間の時間
      repeat: -1, // 無限に繰り返し
      yoyo: true, // アニメーションの反復
    },
  }
);