// modules
var system = require('system'),
    casper = require('casper').create();

// command line arguments
var url = casper.cli.get(0),
    dimensions = requireRelative('_getDimensions.js')(casper.cli.get(1)),
    image_name = casper.cli.get(2),
    selector = casper.cli.get(3),
    globalBeforeCaptureJS = casper.cli.get(4),
    pathBeforeCaptureJS = casper.cli.get(5);

// functions
function requireRelative(file) {
  // PhantomJS will automatically `require` relatively, but CasperJS needs some extra help. Hence this function.
  // 'templates/javascript/casper.js' -> 'templates/javascript'
  var currentFilePath = system.args[3].split('/');
  currentFilePath.pop();
  var fs = require('fs');
  currentFilePath = fs.absolute(currentFilePath.join('/'));
  return require(currentFilePath + '/' + file);
}
function snap() {
  if (!selector) {
    this.capture(image_name);
  }
  else {
    this.captureSelector(image_name, selector);
  }
  console.log('Snapping ' + url + ' at: ' + dimensions.viewportWidth + 'x' + dimensions.viewportHeight);
}

// Casper can now do its magic
casper.start();
casper.open(url);
casper.viewport(dimensions.viewportWidth, dimensions.viewportHeight);
casper.then(function() {
  if (globalBeforeCaptureJS) {
    require('./' + globalBeforeCaptureJS)(this);
  }
});
casper.then(function() {
  if (pathBeforeCaptureJS) {
    require('./' + pathBeforeCaptureJS)(this);
  }
});
// waits for all images to download before taking screenshots
// (broken images are a big cause of Wraith failures!)
// Credit: http://reff.it/8m3HYP
casper.waitFor(function() {
  return this.evaluate(function() {
    var images = document.getElementsByTagName('img');
    return Array.prototype.every.call(images, function(i) { return i.complete; });
  });
}, function then () {
  snap.bind(this)();
});

casper.run();
