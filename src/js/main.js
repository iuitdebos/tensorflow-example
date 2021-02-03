import '../css/index.scss';

import 'regenerator-runtime';

// For some reason importing it through npm brings some stupid error. Most likely has to do with the rollup build setup,
// import * as posenet from '@tensorflow-models/posenet';
// import '@tensorflow/tfjs-backend-webgl';

(async () => {
  // App variables
  window._app = {
    videoDeviceIndex: 0,
    videoConstraints: {},
    posenetIsLoaded: false,
    posenetIsApplied: false,
    minConfidence: 0.6,
  };

  // Setup DOM elements
  const videoRoot = document.querySelector('.js-video-root');
  const videoEl = videoRoot.querySelector('.js-video');

  const canvas = videoRoot.querySelector('.js-canvas');
  const ctx = canvas.getContext('2d');

  // Attach event listeners
  const sourceToggles = document.querySelectorAll('.js-toggle-video-source');
  sourceToggles.forEach((toggle) => {
    toggle.addEventListener('click', onToggleSource);
  });

  // Resize handling (should be throttled for production)
  function onResize() {
    // Aspect ratio = videoEl.videoHeight / videoEl.videoWidth, clamped to window
    const videoRatio = Math.min(window.innerWidth / videoEl.videoWidth, window.innerHeight / videoEl.videoHeight);
    
    videoEl.width = canvas.width = videoEl.videoWidth * videoRatio;
    videoEl.height = canvas.height = videoEl.videoHeight * videoRatio;
  }
  window.addEventListener('resize', onResize);

  // Load devices
  async function loadDevices() {
    if ('mediaDevices' in navigator && 'enumerateDevices' in navigator.mediaDevices) {
      // Query for devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      _app.availableVideoDevices = devices.filter(device => device.kind === 'videoinput');
      
      // If videoDeviceIndex is an invalid one after reloading the devices, reset to 0
      if (_app.videoDeviceIndex >= _app.availableVideoDevices.length) {
        _app.videoDeviceIndex = 0;
      }

      // If there are video devices available, init posenet
      if (_app.availableVideoDevices.length > 0 && !_app.posenetIsLoaded) {
        _app.posenetIsLoaded = true;
        _app.posenet = await posenet.load({
          architecture: 'MobileNetV1',
          outputStride: 16,
          inputResolution: { width: 640, height: 480 },
          multiplier: 0.75
        });
      }
    }
  }

  // Load the stream by index into the video element
  async function loadStreamByIndex(index) {
    if (index >= 0 && index < _app.availableVideoDevices.length) {
      if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        // Stop any existing stream
        if (videoEl.srcObject) {
          videoEl.srcObject.getTracks().forEach(track => {
            track.stop();
          });
        }
        // Make sure cellphones have time to switch off cameras
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 500);
        });

        // Set up constraints with new DeviceID
        _app.videoConstraints = {
          ..._app.videoConstraints,
          deviceId: {
            exact: _app.availableVideoDevices[index].deviceId,
          },
        };

        // Load new stream by deviceId
        const stream = await navigator.mediaDevices.getUserMedia({ video: _app.videoConstraints });
        videoEl.srcObject = stream;

        // Set correct sizes on loading the video stream and start running posenet
        videoEl.onloadedmetadata = () => {
          onResize();
          applyPosenet();
        };

        // After we've gotten permissions, reload devices to get their labels
        await loadDevices();

        // Update UI
        sourceToggles.forEach((toggle) => {
          toggle.innerText = `${_app.availableVideoDevices[index].label} :: ${_app.videoDeviceIndex + 1} / ${_app.availableVideoDevices.length}`;
        });
      }
    }
  };

  // Setup input source toggles
  async function onToggleSource(e) {
    e.preventDefault();
    
    if (_app.availableVideoDevices.length > 0) {
      // Load next available device, wrap back to 0
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

  // Draw
  function drawEmoji(emoji, size, x, y) {
    ctx.font = `${size}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, x, y);
  }

  // Posenet
  async function posenetFrame() {
    if (!videoEl.paused) {
      const pose = await _app.posenet.estimateSinglePose(videoEl, {
        flipHorizontal: false,
      });

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < pose.keypoints.length; i ++) {
          if (pose.keypoints[i].score > _app.minConfidence) {
            const { x, y } = pose.keypoints[i].position;
            switch (pose.keypoints[i].part) {
              case 'leftEye':
                drawEmoji('👁️', 40, x, y);
                break;
              case 'rightEye':
                drawEmoji('👁️', 40, x, y);
                break;
              case 'nose':
                drawEmoji('👄', 50, x, y + 30);
                break;
              case 'leftWrist':
                drawEmoji('👌', 80, x, y);
                break;
              case 'rightWrist':
                drawEmoji('👋', 80, x, y);
                break;
              default:
            }
          }
        }
      }
    }
    requestAnimationFrame(posenetFrame);
  }

  function applyPosenet() {
    if (!_app.posenetIsApplied) {
      _app.posenetIsApplied = true;
      requestAnimationFrame(posenetFrame);
    }
  }
})();