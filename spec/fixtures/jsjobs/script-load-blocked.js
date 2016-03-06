var loadScript = function(url, callback) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  script.onerror = function(e) {
     return callback(new Error('Failed to load script: ') + url);
  };
  script.onload = function(state) {
    return callback(null);
  };

  var head = (document.head || document.getElementsByTagName("head")[0]);
  head.appendChild(script);
};

window.polySolvePage = function(page, options, callback) {
    var allowed = 'http://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    var blocked = 'https://s3-us-west-2.amazonaws.com/cdn.thegrid.io/design-systems/helloworld/0.1.2/helloworld.js';
    loadScript(allowed, function(err) {
        if (err) {
          return callback(new Error('Allowed script errored'), null, {});
        }
        loadScript(blocked, function(err) {
          return callback(new Error(err), null, {});
        });
    });
};
