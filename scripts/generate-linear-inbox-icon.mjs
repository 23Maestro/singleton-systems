import satori from "satori";
import { writeFileSync } from "node:fs";
import path from "node:path";

const BLACK = "#101820";
const CORAL = "#FF6257";

const W = 200;
const H = 160;

const envelope = {
  type: "div",
  props: {
    style: {
      display: "flex",
      position: "relative",
      width: 176,
      height: 128,
    },
    children: [
      // envelope body
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            position: "absolute",
            left: 0,
            top: 0,
            width: 176,
            height: 128,
            background: "#ffffff",
            border: `7px solid ${BLACK}`,
            borderRadius: 22,
          },
        },
      },
      // coral accent stripe, clipped to the card via overflow hidden wrapper
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            position: "absolute",
            left: 0,
            top: 0,
            width: 176,
            height: 128,
            borderRadius: 22,
            overflow: "hidden",
          },
          children: {
            type: "div",
            props: {
              style: {
                display: "flex",
                position: "absolute",
                width: 26,
                height: 230,
                background: CORAL,
                left: 118,
                top: -50,
                transform: "rotate(28deg)",
              },
            },
          },
        },
      },
      // flap: left diagonal
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            position: "absolute",
            width: 132,
            height: 9,
            background: BLACK,
            borderRadius: 5,
            left: -6,
            top: 26,
            transform: "rotate(24.5deg)",
            transformOrigin: "left center",
          },
        },
      },
      // flap: right diagonal
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            position: "absolute",
            width: 132,
            height: 9,
            background: BLACK,
            borderRadius: 5,
            right: -6,
            top: 26,
            transform: "rotate(-24.5deg)",
            transformOrigin: "right center",
          },
        },
      },
    ],
  },
};

const root = {
  type: "div",
  props: {
    style: {
      display: "flex",
      width: W,
      height: H,
      alignItems: "center",
      justifyContent: "center",
    },
    children: envelope,
  },
};

const svg = await satori(root, { width: W, height: H, fonts: [] });

const outPath = path.join(process.cwd(), "public", "linear-inbox-icon.svg");
writeFileSync(outPath, svg, "utf8");
console.log("wrote", outPath);
