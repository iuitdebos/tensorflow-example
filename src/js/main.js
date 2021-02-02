import '../css/index.scss';

import 'regenerator-runtime';

// For some reason importing it through npm brings some stupid error. Most likely has to do with the rollup build setup,
// import * as posenet from '@tensorflow-models/posenet';
// import '@tensorflow/tfjs-backend-webgl';

(async () => {
  // App variables
  window._app = {
    videoConstraints: {
      video: true,
    },
  };

  // Setup DOM elements
  const videoRoot = document.querySelector('.js-video-root');
  const videoEl = videoRoot.querySelector('.js-video');
  const videoDescription = videoRoot.querySelector('.js-video-description');

  // Attach event listeners
  const sourceToggles = document.querySelectorAll('.js-toggle-video-source');
  sourceToggles.forEach((toggle) => {
    toggle.addEventListener('click', onToggleSource);
  });

  // Load devices
  async function loadDevices() {
    if ('mediaDevices' in navigator && 'enumerateDevices' in navigator.mediaDevices) {
      // Gave permission, query for devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      _app.availableVideoDevices = devices.filter(device => device.kind === 'videoinput');
      _app.videoDeviceIndex = 0;

      if (_app.availableVideoDevices.length > 0) {
        _app.posenet = await posenet.load();
      }
    }
  }

  // Load the stream by index into the video element
  async function loadStreamByIndex(index) {
    if (index >= 0 && index < _app.availableVideoDevices.length) {
      // Load new stream by deviceId
      if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({
          ..._app.videoConstraints,
          deviceId: {
            exact: _app.availableVideoDevices[index].deviceId,
          },
        });
        videoEl.srcObject = stream;

        // Update UI
        videoDescription.innerText = _app.availableVideoDevices[index].label;

        videoEl.onloadedmetadata = () => {
          applyPosenet();
        };
      }
    }
  };

  // Setup input source toggles
  async function onToggleSource(e) {
    e.preventDefault();
    
    if (_app.availableVideoDevices.length > 0) {
      _app.videoDeviceIndex = (_app.videoDeviceIndex + 1) % _app.availableVideoDevices.length;
      await loadStreamByIndex(_app.videoDeviceIndex);
    } else {
      // If there are no available devices, attempt again
      await loadDevices();
      await loadStreamByIndex(0);
    }
  }

  // Initial load
  await loadDevices();
  if (_app.availableVideoDevices.length > 0) {
    // Check if we need to be able to swap between devices
    if (_app.availableVideoDevices.length > 1) {
      videoRoot.classList.add('has-multiple-devices');
    }
  
    // Default load first device
    await loadStreamByIndex(0);
  }

  // Posenet
  function applyPosenet() {
    async function posenetFrame() {
      if (!videoEl.paused) {
        const pose = await _app.posenet.estimateSinglePose(videoEl, {
          flipHorizontal: false,
        });
        console.log(pose);
      }
      requestAnimationFrame(posenetFrame);
    }
    requestAnimationFrame(posenetFrame);
  }
})();