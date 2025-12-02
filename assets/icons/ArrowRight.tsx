import React from "react";
import Svg, { Path } from "react-native-svg";

export default function ArrowRight({ width = 22, height = 22, color = "#111" }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 6l6 6-6 6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
