import React, { useState } from "react";
import ProgressBar from "react-progress-bar-plus";
import "react-progress-bar-plus/lib/progress-bar.css";

const AnimatedInfoButton = () => {
  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);

  const handleClick = () => {
    setShowProgressBar(true);

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setShowProgressBar(false);
        }
        return newProgress;
      });
    }, 1000);
  };

  return (
    <div>
      <button onClick={handleClick}>Info Button</button>
      {showProgressBar && <ProgressBar percent={progress} autoIncrement />}
    </div>
  );
};

export default AnimatedInfoButton;
