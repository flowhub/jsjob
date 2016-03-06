window.polySolvePage = function(page, options, callback) {
    var url = 'http://api.thegrid.io/non-existant.js';

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.onerror = function(e) {
       return callback(new Error('script load error'));
    };
    script.onload = function(state) {
      return callback(new Error('script loaded OK'));
    };

    var head = (document.head || document.getElementsByTagName("head")[0]);
    head.appendChild(script);
};
