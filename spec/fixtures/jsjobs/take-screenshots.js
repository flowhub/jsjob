window.polySolvePage = function(page, options, callback) {

  var element = document.createElement('div');
  element.innerHTML = '<p>Some text to be screenshotted</p>';
  document.body.appendChild(element);

  // trigger a screenshot
  setTimeout(function() {
    if (window.callPhantom) {
      window.callPhantom({event: 'screenshot', name: 'myname'});
    }
    // give screenshot a little bit of time
    setTimeout(function() {
      return callback(null, "<html></html>", {});
    }, 100);

  }, 200);

};
