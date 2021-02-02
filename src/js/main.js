import '../css/index.scss';
import './vendor/modernizr-3.11.2.min';

import { initMediaDevices } from './media-devices';

const videoRoot = document.querySelector('.js-video-root');

initMediaDevices({ video: true }).then((mediaDevices) => {
  console.log(mediaDevices);
  videoRoot.srcObject = mediaDevices.stream;
}).catch((err) => {
  console.error(err);
  window.alert(err);
});