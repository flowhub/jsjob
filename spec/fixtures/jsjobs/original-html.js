

window.polySolvePage = function(page, options, callback) {
    var html = "";
    var ind = "  ";
    page.content.forEach(function(item) {
        html += ind+"<section>"
        item.blocks.forEach(function(block) {
            html += ind+ind+block.html;
        });
        html += ind+"</section>"
    }
    return callback(null, html, {});
};
