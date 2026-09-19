export type ExerciseImages = {
  name: string;
  frames?: { src: string; label: string }[];
  composite?: string;
};
export const exerciseImages: Record<string, ExerciseImages> = {
  "floor-press": {
    name: "floor press",
    frames: [
      {
        src: "/fitness/images/floor-press-start.jpg",
        label: "Start",
      },
      {
        src: "/fitness/images/floor-press-finish.jpg",
        label: "Finish",
      },
    ],
  },
  "db-row": {
    name: "db row",
    frames: [
      {
        src: "/fitness/images/db-row-start.jpg",
        label: "Start",
      },
      {
        src: "/fitness/images/db-row-finish.jpg",
        label: "Finish",
      },
    ],
  },
  "shoulder-press": {
    name: "shoulder press",
    frames: [
      {
        src: "/fitness/images/shoulder-press-start.jpg",
        label: "Start",
      },
      {
        src: "/fitness/images/shoulder-press-finish.jpg",
        label: "Finish",
      },
    ],
  },
  "pull-apart": {
    name: "pull apart",
    frames: [
      {
        src: "/fitness/images/pull-apart-start.jpg",
        label: "Start",
      },
      {
        src: "/fitness/images/pull-apart-finish.jpg",
        label: "Finish",
      },
    ],
  },
  "hammer-curl": {
    name: "hammer curl",
    frames: [
      {
        src: "/fitness/images/hammer-curl-start.jpg",
        label: "Start",
      },
      {
        src: "/fitness/images/hammer-curl-finish.jpg",
        label: "Finish",
      },
    ],
  },
  "glute-bridge": {
    name: "Glute bridge",
    composite: "/fitness/images/glute-bridge.png",
  },
  rdl: {
    name: "Dumbbell Romanian deadlift",
    composite: "/fitness/images/rdl.webp",
  },
  "goblet-squat": {
    name: "Goblet squat",
    composite: "/fitness/images/goblet-squat.jpeg",
  },
  "reverse-lunge": {
    name: "Reverse lunge",
    composite: "/fitness/images/reverse-lunge.jfif",
  },
  "calf-raise": {
    name: "Standing calf raise",
    composite: "/fitness/images/calf-raise.png",
  },
};
export const equipmentImages: Record<string, { src: string; name: string }> = {
  "handle-bands": {
    src: "/fitness/images/gear-handle-bands.JPG",
    name: "Handle resistance bands",
  },
  block: {
    src: "/fitness/images/gear-block.jpg",
    name: "Yoga blocks",
  },
  roller: {
    src: "/fitness/images/gear-roller.jpg",
    name: "Foam roller",
  },
  "ab-wheel": {
    src: "/fitness/images/gear-ab-wheel.webp",
    name: "Ab wheel",
  },
  stick: {
    src: "/fitness/images/gear-stick.jpg",
    name: "Mobility stick in use",
  },
  dumbbells: {
    src: "/fitness/images/gear-dumbbells.jpg",
    name: "Dumbbells in use",
  },
  "loop-bands": {
    src: "/fitness/images/gear-loop-bands.jpg",
    name: "Long resistance band in use",
  },
  bodyweight: {
    src: "/fitness/images/gear-bodyweight.jpg",
    name: "Bodyweight movement",
  },
};
