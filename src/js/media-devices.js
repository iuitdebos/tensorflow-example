export function loadMediaDevices() {
  return new Promise((resolve, reject) => {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      // Gave permission, query for devices
      navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        resolve(devices);
      })
      .catch(() => {
        // No devices found
        reject('Can\'t find any devices.');
      });
    } else {
      // No support for media devices
      reject('Your browser does not support media devices. Please upgrade to a more modern browser.');
    }
  });
}

export function streamMediaDevice(target, constraints) {
  return new Promise((resolve, reject) => {
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      // Ask for permission
      navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        if (target) {
          target.srcObject = stream;
        }
        resolve(stream);
      })
      .catch(() => {
        // Didn't give permission or constraints not possible to match
        reject('You need to give permissions to have this example make sense.');
      });
    }
  });
}