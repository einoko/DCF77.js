const buttonHandler = () => {
  const isiOS = !!navigator.platform.match(/iPhone|iPod|iPad/);

  // check for first time users on non iOS devices
  if (localStorage.getItem("firstTime") === null) {
    if (
      window.confirm(
        "I understand that a high-pitched 15.5 kHz noise is going to play. My speakers are not at full volume."
      )
    ) {
      transmissionControl();
      localStorage.setItem("firstTime", "false");
      if (isiOS) transmissionControl();
    }
  } else {
    transmissionControl();
  }
};

const transmissionControl = () => {
  if (!toggle) {
    DCF77.startTransmission();
    transmissionButton.innerText = "STOP TRANSMISSION";
  } else {
    DCF77.stopTransmission();
    transmissionButton.innerText = "START TRANSMISSION";
  }
  toggle = !toggle;
};

let toggle = false;

const transmissionButton = document.getElementById("transmissionButton");

Clock.start();

transmissionButton.addEventListener("click", buttonHandler, false);
