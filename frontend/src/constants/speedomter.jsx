import React from "react";
import Speedometer from "react-d3-speedometer";

const BureauScoreSpeedometer = ({ score }) => {
  const minValue = 300; // Minimum possible score
  const maxValue = 850; // Maximum possible score

  return (
    <Speedometer
      value={score}
      minValue={minValue}
      maxValue={maxValue}
      startColor="#FF471A"
      endColor="#008000"
      needleColor="steelblue"
      needleTransitionDuration={2000}
      currentValueText="Bureau Score: ${value}"
      height={150}
      showLabels={false}
      width={250}
    />
  );
};

export default BureauScoreSpeedometer;
