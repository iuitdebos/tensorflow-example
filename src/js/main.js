import '../css/index.scss';

import 'regenerator-runtime';

import { loadMediaDevices, streamToTarget } from './media-devices';

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

  // Load devices
  const reloadDevices = async () => {
    const devices = await loadMediaDevices();
    _app.availableVideoDevices = devices.filter(device => device.kind === 'videoinput');
    _app.videoDeviceIndex = 0;
  }

  // Load the stream by index into the video element
  const loadStreamByIndex = (index) => {
    if (index >= 0 && index < _app.availableVideoDevices.length) {
      // Load new stream by deviceId
      streamToTarget(videoEl, {
        ..._app.videoConstraints,
        deviceId: {
          exact: _app.availableVideoDevices[index].deviceId,
        },
      });

      // Update UI
      videoDescription.innerText = _app.availableVideoDevices[index].label;
    }
  };

  // Setup input source toggles
  const onToggleSource = async (e) => {
    e.preventDefault();
    
    if (_app.availableVideoDevices.length > 0) {
      _app.videoDeviceIndex = (_app.videoDeviceIndex + 1) % _app.availableVideoDevices.length;
      loadStreamByIndex(_app.videoDeviceIndex);
    } else {
      // If there are no available devices, attempt again
      await reloadDevices();
      loadStreamByIndex(0);
    }
  }

  // Attach event listeners
  const sourceToggles = document.querySelectorAll('.js-toggle-video-source');
  sourceToggles.forEach((toggle) => {
    toggle.addEventListener('click', onToggleSource);
  });

  // Initial load
  await reloadDevices();
  if (_app.availableVideoDevices.length > 0) {
    // Check if we need to be able to swap between devices
    if (_app.availableVideoDevices.length > 1) {
      videoRoot.classList.add('has-multiple-devices');
    }
  
    // Default load first device
    loadStreamByIndex(0);
  }
})();