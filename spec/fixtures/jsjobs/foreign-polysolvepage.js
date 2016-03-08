
window.polySolvePage = function(page, options, callback) {
    if (options._hidden) {
        return callback(new Error("Inner function saw hidden info"));
    }
    var html = "<html>"+page.body.toString()+"</html>";
    var details = {};
    return callback(null, html, details);
};
