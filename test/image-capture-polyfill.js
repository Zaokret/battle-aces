function getBlobFromMediaStream(stream) {

    if ('ImageCapture' in window) {
  
      const videoTrack = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(videoTrack);
      return imageCapture.takePhoto();
      
    } else {
  
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
  
      video.srcObject = stream;
  
      return new Promise((resolve, reject) => {
        video.addEventListener('loadeddata', async () => {
          const { videoWidth, videoHeight } = video;
          canvas.width = videoWidth;
          canvas.height = videoHeight;

          video.play().then(() => {
            context.drawImage(video, 0, 0, videoWidth, videoHeight);
            canvas.toBlob(resolve, 'image/png');
          }).catch((err) => reject(err))
        });
      });
  
    }
    
  }