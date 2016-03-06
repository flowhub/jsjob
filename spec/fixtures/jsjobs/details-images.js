window.polySolvePage = function(page, options, callback) {
  var err = null;
  var html = "<html></html>";
  var details = {
    images: [
      "https://imgflo.herokuapp.com/graph/vahj1ThiexotieMo/84de3cd6cb44d80c54121fcdd521faba/passthrough.jpg?input=https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fthe-grid-img%2Fp%2Fb0bd5825071c11444ee622ca37ccdbbb5c2df21a.jpg&width=480&height=270",
      "https://imgflo.herokuapp.com/graph/vahj1ThiexotieMo/712bf632e9d4752eee99670c7bb6c8b5/passthrough?input=https%3A%2F%2Fs.gravatar.com%2Favatar%2F6d8c157b8db7b3266d5e616c0006f367%3Fd%3Dhttps%253A%252F%252Fpassport.thegrid.io%252Fprofile-fallback.png&width=100"
    ]
  };
  return callback(err, html, details);
};
