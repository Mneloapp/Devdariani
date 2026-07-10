export const easing = [0.22, 1, 0.36, 1] as const;

export const reveal = {
  hidden: { filter: "blur(10px)", opacity: 0, y: 24 },
  visible: { filter: "blur(0px)", opacity: 1, y: 0 },
};
