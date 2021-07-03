/**
 * DCF77.js - DCF77 signal simulator
 * author: sumire
 * license: MIT
 *
 * DCF77.js exposes two public methods, startTransmission and stopTransmission,
 * which start and stop the time signal transmission respectively.
 *
 * NOTE! Please bear in mind that this script will produce a high-pitched
 * 15.5 kHz sine wave noise. Never play this signal at full volume and be sure
 * to always protect your hearing! Also, please do not use this script to mess
 * up other people's radio controlled clocks.
 */

const DCF77 = (() => {
  const SPECIAL_BIT = "-";
  const FREQUENCY = 77500 / 5;
  let FIRST_UPCOMING_MINUTE = [];
  let SECOND_UPCOMING_MINUTE = [];

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx = new AudioContext();
  let lowshelfFilter, gainNode;

  const repeatString = (input, n) => {
    return Array(++n).join(input);
  };

  const addMinutes = (date, minutes) => {
    return new Date(date.getTime() + minutes * 60000);
  };

  const evenParity = (input) => {
    return (input.match(/1/g) || []).length % 2;
  };

  const reverse = (string) => {
    return string.split("").reverse().join("");
  };

  const binary = (input, size) => {
    const bin = input.toString(2);
    return reverse(bin) + repeatString(0, size - bin.length);
  };

  const isDST = (t) => {
    const jan = new Date(t.getFullYear(), 0, 1);
    const jul = new Date(t.getFullYear(), 6, 1);
    return (
      Math.min(jan.getTimezoneOffset(), jul.getTimezoneOffset()) ===
      t.getTimezoneOffset()
    );
  };

  const bcd = (input, size) => {
    if (size <= 4) {
      return binary(input, size);
    } else {
      let ones = binary(Math.floor(input % 10), 4);
      let tens = binary(Math.floor(input / 10), size - 4);
      return ones + tens;
    }
  };

  const getUTC = () => {
    let currentTime = new Date();
    return new Date(
      currentTime.getUTCFullYear(),
      currentTime.getUTCMonth(),
      currentTime.getUTCDate(),
      currentTime.getUTCHours(),
      currentTime.getUTCMinutes(),
      currentTime.getUTCSeconds()
    );
  };

  const generateMinute = (d) => {
    let minute = String();

    // first 17 "useless" bits
    minute += "00011101111101000";

    // DST information
    minute += +isDST(d);
    minute += +!isDST(d);

    // time coding begins here
    minute += "01";

    // minutes + parity bit
    minute += bcd(d.getMinutes(), 7);
    minute += evenParity(bcd(d.getMinutes(), 7));

    // hours + parity bit
    minute += bcd(d.getHours(), 6);
    minute += evenParity(bcd(d.getHours(), 6));

    // day of month
    minute += bcd(d.getDate(), 6);

    // day of week
    minute += bcd(d.getDay(), 3);

    // month
    minute += bcd(d.getMonth() + 1, 5);

    // year (within century) + parity bit for all date bits
    minute += bcd(d.getFullYear() - 2000, 8);
    minute += evenParity(
      bcd(d.getDate(), 6) +
        bcd(d.getDay(), 3) +
        bcd(d.getMonth() + 1, 5) +
        bcd(d.getFullYear() - 2000, 8)
    );

    // Insert last 59th bit that ends the minute
    minute += SPECIAL_BIT;

    return minute;
  };

  const playMinute = (arr) => {
    let buffer = audioCtx.createBuffer(1, arr.length, audioCtx.sampleRate);
    buffer.copyToChannel(arr, 0);

    let source = audioCtx.createBufferSource();
    source.buffer = buffer;

    // Apply filtering to the signal
    lowshelfFilter = audioCtx.createBiquadFilter();
    lowshelfFilter.type = "lowshelf";
    lowshelfFilter.frequency.value = 12000;
    lowshelfFilter.gain.value = -60;

    // Apply gain
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 20;

    source.connect(lowshelfFilter);
    lowshelfFilter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    source.start(0);
    source.onended = function () {
      FIRST_UPCOMING_MINUTE = SECOND_UPCOMING_MINUTE;
      playMinute(FIRST_UPCOMING_MINUTE);
      setTimeout(createNextMinute, 5000);
    };
  };

  const createNextMinute = () => {
    SECOND_UPCOMING_MINUTE = createMinute(2);
  };

  const createMinute = (n) => {
    const currentTime = getUTC();
    const difference = isDST(currentTime) ? 2 : 1;
    let DE_time = new Date(
      currentTime.setHours(currentTime.getHours() + difference)
    );
    DE_time = addMinutes(DE_time, n);
    let sequence = generateMinute(DE_time);
    let minute = new Float32Array(audioCtx.sampleRate * 60);

    sequence.split("").forEach((bit, i) => {
      switch (bit) {
        case "0":
          minute.set(ZERO, audioCtx.sampleRate * i);
          break;
        case "1":
          minute.set(ONE, audioCtx.sampleRate * i);
          break;
        case "-":
          minute.set(END, audioCtx.sampleRate * i);
      }
    });

    return minute;
  };

  const start = async () => {
    FIRST_UPCOMING_MINUTE = createMinute(1);
    SECOND_UPCOMING_MINUTE = createMinute(2);
    audioCtx = new AudioContext();

    await new Promise((r) =>
      setTimeout(r, 1000 - new Date().getMilliseconds())
    );

    playMinute(
      FIRST_UPCOMING_MINUTE.slice(new Date().getSeconds() * audioCtx.sampleRate)
    );
  };

  const stop = () => {
    audioCtx.close();
  };

  const sine = (sampleNumber, tone) => {
    const distorter = audioCtx.sampleRate / 3;
    const sampleFreq = audioCtx.sampleRate / tone;
    return (
      Math.floor(
        Math.sin(sampleNumber / (sampleFreq / (Math.PI * 2))) * distorter
      ) / distorter
    );
  };

  const createSecond = (freq, ampMod) => {
    let second = [];

    for (let i = 0; i < audioCtx.sampleRate; i++) {
      if (i / audioCtx.sampleRate < ampMod) {
        second[i] = 0;
      } else {
        second[i] = sine(i, freq);
      }
    }
    return second;
  };

  // Create second information here
  const ZERO = createSecond(FREQUENCY, 0.1);
  const ONE = createSecond(FREQUENCY, 0.2);
  const END = createSecond(FREQUENCY, 0);

  return {
    startTransmission: () => {
      start();
    },
    stopTransmission: () => {
      stop();
    },
  };
})();
