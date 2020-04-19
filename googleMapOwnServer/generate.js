var http = require('http');
var fs = require('fs');

// Only images which 'src' attrib match this will be considered for moving around.
// Looks like some kind of string-based protobuf, maybe??
// Only the roads (and terrain, and vector-based stuff) match this pattern
var _roadRegexp = /!1i(\d+)!2i(\d+)!3i(\d+)!/;

// On the other hand, raster imagery matches this other pattern
var _satRegexp = /x=(\d+)&y=(\d+)&z=(\d+)/;

http.createServer(function (req, res) {

    let rawdata = fs.readFileSync('z18.har');
    let har = JSON.parse(rawdata);
    let r = '';

    har.log.entries.forEach(entry => {
        if (entry.request.url.startsWith('https://maps.googleapis.com/maps/vt?pb=')
            && entry.response.content.mimeType === 'image/png') {

            // get coords
            var coords;
            var match = entry.request.url.match(_roadRegexp);

            if (match) {
                coords = {
                    z: match[1],
                    x: match[2],
                    y: match[3]
                };
            } else {
                match = val.match(_satRegexp);
                if (match) {
                    coords = {
                        x: match[1],
                        y: match[2],
                        z: match[3]
                    };
                }
            }

            if (coords) {
                var img64 = entry.response.content.text.trim('"');
                var fileName = `${coords.z}_${coords.x}_${coords.y}`;
                var success = 'done';
                fs.writeFile(`map/${fileName}.png`, img64, 'base64', function (err) {
                    success = err;
                });

                r += `<div>:${fileName}: ${success}</div>`;
            }
        }
    });

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(r);
}).listen(8090);

