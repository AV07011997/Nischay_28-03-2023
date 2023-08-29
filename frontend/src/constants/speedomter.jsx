import React from "react";
import Speedometer from "react-d3-speedometer";

const BureauScoreSpeedometer = ({ score }) => {
  const minValue = 300; // Minimum possible score
  const maxValue = 900; // Maximum possible score

  // Define custom intervals and colors
  const customSegmentStops = [300, 500, 700, 900];
  const segmentColors = ["#FF0000", "#FFFF00", "	#7CFC00", "#008000"];

  return (
    <Speedometer
      value={score}
      minValue={minValue}
      maxValue={maxValue}
      // startColor="#FF471A"
      // endColor="green"
      needleColor="steelblue"
      needleTransitionDuration={2000}
      currentValueText="Bureau Score: ${value}"
      height={150}
      showLabels={false}
      width={250}
      customSegmentStops={customSegmentStops}
      segmentColors={segmentColors}
    />
  );
};

export default BureauScoreSpeedometer;
