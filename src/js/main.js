import '../css/index.scss';
import './vendor/modernizr-3.11.2.min';

import { loadMediaDevices, streamMediaDevice } from './media-devices';

// App variables
window._app = {};

// Setup media devices
const videoRoot = document.querySelector('.js-video-root');
const videoEl = videoRoot.querySelector('.js-video');
const videoDescription = videoRoot.querySelector('.js-video-description');
const constraints = { video: true };

loadMediaDevices().then((devices) => {
  // Successfully retrieved some media devices.
  _app.availableVideoDevices = devices.filter(device => device.kind === 'videoinput');
  _app.videoDeviceIndex = 0;

  if (_app.availableVideoDevices.length > 0) {
    // Check if we need to be able to swap between devices
    if (_app.availableVideoDevices.length > 1) {
      videoRoot.classList.add('has-multiple-devices');
    }
  
    // Load first device
    loadStreamByIndex(0);
  }
}).catch((err) => {
  console.error(err);
  window.alert(err);
});

// Load the stream by index into the video element
const loadStreamByIndex = (index) => {
  if (index >= 0 && index < _app.availableVideoDevices.length) {
    streamMediaDevice(videoEl, {
      ...constraints,
      deviceId: {
        exact: _app.availableVideoDevices[index].deviceId,
      },
    });

    // Update UI
    videoDescription.innerText = _app.availableVideoDevices[index].label;
  }
};

// Setup input source toggles
const onToggleSource = (e) => {
  e.preventDefault();
  
  _app.videoDeviceIndex = (_app.videoDeviceIndex + 1) % _app.availableVideoDevices.length;
  loadStreamByIndex(_app.videoDeviceIndex);
}

// Attach event listeners
const sourceToggles = document.querySelectorAll('.js-toggle-video-source');
sourceToggles.forEach((toggle) => {
  toggle.addEventListener('click', onToggleSource);
});