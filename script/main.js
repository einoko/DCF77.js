let toggle = false;
const transmissionButton = document.getElementById("transmissionButton");

Clock.start();

transmissionButton.addEventListener("click", buttonHandler, false);

function buttonHandler() {
  // check for first time users
  if (localStorage.getItem("firstTime") === null) {
    if (
      window.confirm(
        "I understand that a high-pitched 15.5 kHz noise is going to play. My speakers are not at full volume."
      )
    ) {
      transmissionControl();
      localStorage.setItem("firstTime", "false");
    }
  } else {
    transmissionControl();
  }
}

function transmissionControl() {
  if (!toggle) {
    DCF77.startTransmission();
    transmissionButton.innerText = "Stop Transmission";
  } else {
    DCF77.stopTransmission();
    transmissionButton.innerText = "Start Transmission";
  }
  toggle = !toggle;
}
