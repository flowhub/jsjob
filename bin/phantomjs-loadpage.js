
var system = require('system');
var page = require('webpage').create();

/// Parse commandline options
if (system.args.length === 1) {
  console.log('Usage: loadpage.js <some URL>');
  phantom.exit(5);
}
var address = system.args[1];

var timeout = 60*1000;
if (system.args.length > 2) {
  timeout = system.args[2];
}

var allowedResources = null; // everything allowed
if (system.args.length > 3) {
  allowedResources = JSON.parse(system.args[3]); // expects array of strings
}

// Resource listing
var resourceIsAllowed = function(url) {
  if (!allowedResources) {
    return true;
  }
  for (var i=0; i<allowedResources.length; i++) {
    var allow = allowedResources[i];
    var index = url.indexOf(allow);
    if (index == 0) {
      return true;
    }
  }
  return false;
};
page.onResourceRequested = function(request, net) {
  var allowed = resourceIsAllowed(request.url);
  if (!allowed) {
    console.log('blocked resource', request.url);
    net.abort();
  }
};

// Screenshots
var takeScreenshot = function(name) {
  var screenshot = page.renderBase64('PNG');
  screenshot = 'data:image/png;charset=utf-8;base64,'+screenshot;
  // send the data into node.js by going via JS and over HTTP
  page.evaluate(function(data, n) {
    window.jsJobEvent('screenshot', { name: n, data: data });
  }, screenshot, name);
};


// Error handling
var onError = function(msg, stack) {
  console.log('JS ERROR: ' + msg + '\n' + JSON.stringify(stack, null, 2));
  phantom.exit(4);
};
phantom.onError = onError;
page.onError = onError;

page.onResourceError = function(e) {
  if (resourceIsAllowed(e.url)) {
    // supress blocked from being reported as error
    console.log('resource error', e.url, e.errorCode);
  }
  // not fatal, to permit retry-logic etc inside polySolvePage()
}

page.onCallback = function(msg) {
  if (typeof msg !== 'undefined' && msg.event == 'pipeline-message') {
    msg.messages.forEach( function(m, idx) {
      var args = JSON.stringify(m.arguments, null);
      console.log(m.method, args);
    });
  } else if (typeof msg !== 'undefined' && msg.event == 'screenshot') {
    takeScreenshot(msg.name);
  } else {
    console.log('page.onCallback: ignored unknown message', JSON.stringify(msg, null, 2));
  }
};

// Run
page.onConsoleMessage = function(msg) {
  console.log(msg);
};

var onTimeout = function() {
   console.log('TIMEOUT');
   phantom.exit(3);
};

console.log('Opening: ', address);
page.open(address, function(status) {
  var killTimeout = setInterval(onTimeout, timeout);

  console.log("Opened: " + status);
  if (status === "success") {
    // The page is loaded,
    // poly runner will kill us when solving is done, or we time out
  } else {
    phantom.exit(2);
  }
});

