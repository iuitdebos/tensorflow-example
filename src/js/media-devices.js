export async function loadMediaDevices() {
  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    // Gave permission, query for devices
    return await navigator.mediaDevices.enumerateDevices();
  } else {
    // No support for media devices
    throw new Error('Your browser does not support media devices. Please upgrade to a more modern browser.');
  }
}

export async function streamToTarget(target, constraints) {
  if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
    // Ask for permission
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    if (target) {
      target.srcObject = stream;
    }
  }
}