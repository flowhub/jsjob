// Initially based on fiddle from https://jsfiddle.net/7cAH9/103/

function resizeCanvas(image, canvas) {
    document.body.appendChild(image);
    canvas.width = image.offsetWidth;
    canvas.style.width = image.offsetWidth.toString() + "px";
    canvas.height = image.offsetHeight;
    canvas.style.height = image.offsetHeight.toString() + "px";
    document.body.removeChild(image);
}

function showMsg(msg) {
    console.log(msg);
}

function visualizeResults(canvas, img, comp) {
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#f00";
    for (var i = 0; i < comp.length; i++) {
        ctx.strokeRect(comp[i].x, comp[i].y, comp[i].width, comp[i].height);
    }
}

function runFaceDetection(url, callback) {
  // TODO: dynamically create the canvas element
  var canvas = document.createElement('canvas');

  var img = new Image();
  //document.body.appendChild(img);
  img.src = url;
  //img.setAttribute('crossOrigin','anonymous');
  img.onerror = function(e) {
     return callback(new Error("failed to load image " + img.src));
  };
  img.onload = function() {
      resizeCanvas(img, canvas);

      var s = (new Date()).getTime();
      showMsg("Detecting ...");

      var comp = ccv.detect_objects({
          "canvas": ccv.grayscale(ccv.pre(img)),
          "cascade": cascade,
          "interval": 5,
          "min_neighbors": 1
      });

      var elapsed = ((new Date()).getTime() - s);
      showMsg("Elapsed time : " + elapsed.toString() + "ms");

      visualizeResults(canvas, img, comp);
      var details = {
        elapsedTime: elapsed.getMilliseconds()
      };
      return callback(null, comp, details);
  };
}

// add JsJob entrypoint
window.jsJobRun = function(data, options, callback) {
  data.url = "https://crossorigin.me/"+data.url; // Get around CORS issues
  runFaceDetection(data.url, callback);
};
