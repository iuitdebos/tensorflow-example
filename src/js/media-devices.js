export function initMediaDevices(constraints) {
  return new Promise((resolve, reject) => {
    // Check if we support it
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      // Ask for permission
      navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
          // Gave permission, query for devices
          navigator.mediaDevices.enumerateDevices()
            .then((devices) => {
              resolve({
                type: 'success',
                stream,
                devices,
              });
            })
            .catch(() => {
              // No devices found
              reject('Can\'t find any devices.');
            });
        })
        .catch(() => {
          // Didn't give permission or constraints not possible to match
          reject('You need to give permissions to have this example make sense.');
        });
    } else {
      // No support for media devices
      reject('Your browser does not support media devices. Please upgrade to a more modern browser.');
    }
  });
}