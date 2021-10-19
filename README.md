# DCF77.js

#### Demo available [here](https://einoken.github.io/DCF77.js/).

DCF77.js is a proof-of-concept [DCF77](https://en.wikipedia.org/wiki/DCF77) time signal emulator written in JavaScript and its Web Audio API. It currently works correctly on Firefox, Chrome and Chromium based browsers. You can use DCF77.js to synchronise your DCF77-radio-controlled clocks/watches. You can check out the [demo page](https://einoken.github.io/DCF77.js/) to see how it can be implemented on a web page.

Set your radio controlled clock/watch to “receive” mode and place it near the speaker or headphones. It should take 2–10 minutes for your watch to synchronize.

### Signal documentation
* [https://en.wikipedia.org/wiki/DCF77<sup>__1__</sup>](https://en.wikipedia.org/wiki/DCF77)

<sup>__1__</sup> Leap second and summer time announcements (bits 16 and 19) are not implemented in DCF77.js.

## Usage
Include the script in your HTML file.

```html
<script src="DCF77.js"></script>
```

DCF77.js exposes two methods, `startTransmission()` and `stopTransmission()`. Use these to start and stop the signal transmission. You can check the demo page in `/demo` to see an example.

#### Disclaimer:
__This script will produce a high-pitched 15.5kHz sine wave noise! Please protect your hearing! Also, it may or may not be legal to transmit this sound in your country. Consult your local laws if you are unsure.__

## Instructions

1. Call `DCF77.startTransmission()`. The sound will start playing immediately. The encoded time signal will automatically be in German time (UTC+1).
2. Set your radio controlled watch or clock to "receive" mode and place its antenna near the speaker or headphones (~1–5 cm)
3. Wait. It can take anywhere from 2 to 10 minutes for your watch to synchronize. You can stop the signal at any time by calling `DCF77.stopTransmission()` or closing the browser window.

### What if it doesn't work?
It's most likely one of these reasons:

1. __The speaker volume is not loud enough:__ Try increasing your system volume.
2. __The antenna is not placed near enough to the speaker:__ Try placing it closer to the speaker.

If it's still not working, your clock/watch probably cannot be fooled by this signal. The signal was tested on my Casio Wave Ceptor wristwatch and a radio controlled wall clock.
