var PREFIX = JSON.parse(Plugin.manifest).id;

var page = require('showtime/page');
var http = require('showtime/http');
var html = require('showtime/html');

// Check architecture endian
var switchEndian = true;
var f = new Float64Array(1);
f[0] = 1;
if (f.buffer[0] == 0x3f) { switchEndian = false; }

// Create the service (ie, icon on home screen)
require('showtime/service').create('DMAX', PREFIX + ':start', 'video', true, Plugin.path + 'DMAX.svg');

// Play episode
new page.Route(PREFIX + ":playEpisode:(.+):(.+)", function(page, seriesName, episodeName) {
  // Instead of shipping a whole amf encoder lib for one request i use a predefined value (thx wireshark)
  // and replace the content id

  var amfBuffer = Duktape.Buffer(new Buffer([
    0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x46, 0x63, 0x6f, 0x6d, 0x2e, 0x62, 0x72, 0x69, 0x67,
    0x68, 0x74, 0x63, 0x6f, 0x76, 0x65, 0x2e, 0x65, 0x78, 0x70, 0x65, 0x72, 0x69, 0x65, 0x6e, 0x63,
    0x65, 0x2e, 0x45, 0x78, 0x70, 0x65, 0x72, 0x69, 0x65, 0x6e, 0x63, 0x65, 0x52, 0x75, 0x6e, 0x74,
    0x69, 0x6d, 0x65, 0x46, 0x61, 0x63, 0x61, 0x64, 0x65, 0x2e, 0x67, 0x65, 0x74, 0x44, 0x61, 0x74,
    0x61, 0x46, 0x6f, 0x72, 0x45, 0x78, 0x70, 0x65, 0x72, 0x69, 0x65, 0x6e, 0x63, 0x65, 0x00, 0x02,
    0x2f, 0x31, 0x00, 0x00, 0x01, 0xfb, 0x0a, 0x00, 0x00, 0x00, 0x02, 0x02, 0x00, 0x28, 0x37, 0x64,
    0x30, 0x37, 0x66, 0x63, 0x63, 0x35, 0x66, 0x35, 0x65, 0x66, 0x38, 0x37, 0x30, 0x34, 0x39, 0x61,
    0x35, 0x30, 0x34, 0x62, 0x34, 0x62, 0x63, 0x31, 0x63, 0x63, 0x31, 0x61, 0x38, 0x35, 0x62, 0x31,
    0x30, 0x61, 0x63, 0x37, 0x34, 0x63, 0x11, 0x0a, 0x63, 0x63, 0x63, 0x6f, 0x6d, 0x2e, 0x62, 0x72,
    0x69, 0x67, 0x68, 0x74, 0x63, 0x6f, 0x76, 0x65, 0x2e, 0x65, 0x78, 0x70, 0x65, 0x72, 0x69, 0x65,
    0x6e, 0x63, 0x65, 0x2e, 0x56, 0x69, 0x65, 0x77, 0x65, 0x72, 0x45, 0x78, 0x70, 0x65, 0x72, 0x69,
    0x65, 0x6e, 0x63, 0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x19, 0x65, 0x78, 0x70, 0x65,
    0x72, 0x69, 0x65, 0x6e, 0x63, 0x65, 0x49, 0x64, 0x07, 0x55, 0x52, 0x4c, 0x19, 0x64, 0x65, 0x6c,
    0x69, 0x76, 0x65, 0x72, 0x79, 0x54, 0x79, 0x70, 0x65, 0x11, 0x54, 0x54, 0x4c, 0x54, 0x6f, 0x6b,
    0x65, 0x6e, 0x13, 0x70, 0x6c, 0x61, 0x79, 0x65, 0x72, 0x4b, 0x65, 0x79, 0x21, 0x63, 0x6f, 0x6e,
    0x74, 0x65, 0x6e, 0x74, 0x4f, 0x76, 0x65, 0x72, 0x72, 0x69, 0x64, 0x65, 0x73, 0x05, 0x42, 0x61,
    0x12, 0x6a, 0x31, 0xdc, 0x20, 0x00, 0x06, 0x81, 0x31, 0x68, 0x74, 0x74, 0x70, 0x3a, 0x2f, 0x2f,
    0x77, 0x77, 0x77, 0x2e, 0x64, 0x6d, 0x61, 0x78, 0x2e, 0x64, 0x65, 0x2f, 0x70, 0x72, 0x6f, 0x67,
    0x72, 0x61, 0x6d, 0x6d, 0x65, 0x2f, 0x61, 0x69, 0x72, 0x70, 0x6c, 0x61, 0x6e, 0x65, 0x2d, 0x72,
    0x65, 0x70, 0x6f, 0x2f, 0x76, 0x69, 0x64, 0x65, 0x6f, 0x73, 0x2f, 0x61, 0x69, 0x72, 0x70, 0x6c,
    0x61, 0x6e, 0x65, 0x2d, 0x72, 0x65, 0x70, 0x6f, 0x2d, 0x64, 0x72, 0x61, 0x75, 0x66, 0x67, 0x61,
    0x65, 0x6e, 0x67, 0x65, 0x72, 0x2d, 0x64, 0x65, 0x72, 0x2d, 0x6c, 0x75, 0x65, 0x66, 0x74, 0x65,
    0x2f, 0x05, 0x7f, 0xff, 0xff, 0xff, 0xe0, 0x00, 0x00, 0x00, 0x06, 0x01, 0x06, 0x65, 0x41, 0x51,
    0x7e, 0x7e, 0x2c, 0x41, 0x41, 0x41, 0x41, 0x41, 0x47, 0x4c, 0x76, 0x43, 0x4f, 0x49, 0x7e, 0x2c,
    0x61, 0x30, 0x43, 0x33, 0x68, 0x31, 0x4a, 0x68, 0x33, 0x61, 0x51, 0x4b, 0x73, 0x32, 0x55, 0x63,
    0x52, 0x5a, 0x72, 0x72, 0x78, 0x79, 0x72, 0x6a, 0x45, 0x30, 0x56, 0x48, 0x39, 0x33, 0x78, 0x6c,
    0x09, 0x03, 0x01, 0x0a, 0x81, 0x03, 0x53, 0x63, 0x6f, 0x6d, 0x2e, 0x62, 0x72, 0x69, 0x67, 0x68,
    0x74, 0x63, 0x6f, 0x76, 0x65, 0x2e, 0x65, 0x78, 0x70, 0x65, 0x72, 0x69, 0x65, 0x6e, 0x63, 0x65,
    0x2e, 0x43, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x4f, 0x76, 0x65, 0x72, 0x72, 0x69, 0x64, 0x65,
    0x13, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x49, 0x64, 0x15, 0x63, 0x6f, 0x6e, 0x74, 0x65,
    0x6e, 0x74, 0x49, 0x64, 0x73, 0x0d, 0x74, 0x61, 0x72, 0x67, 0x65, 0x74, 0x15, 0x66, 0x65, 0x61,
    0x74, 0x75, 0x72, 0x65, 0x64, 0x49, 0x64, 0x19, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x52,
    0x65, 0x66, 0x49, 0x64, 0x17, 0x63, 0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x54, 0x79, 0x70, 0x65,
    0x1b, 0x66, 0x65, 0x61, 0x74, 0x75, 0x72, 0x65, 0x64, 0x52, 0x65, 0x66, 0x49, 0x64, 0x1b, 0x63,
    0x6f, 0x6e, 0x74, 0x65, 0x6e, 0x74, 0x52, 0x65, 0x66, 0x49, 0x64, 0x73, 0x05, 0x42, 0x88, 0x07,
    0x23, 0x81, 0xc1, 0xc8, 0x00, 0x01, 0x06, 0x17, 0x76, 0x69, 0x64, 0x65, 0x6f, 0x50, 0x6c, 0x61,
    0x79, 0x65, 0x72, 0x05, 0x7f, 0xff, 0xff, 0xff, 0xe0, 0x00, 0x00, 0x00, 0x01, 0x04, 0x00, 0x01,
    0x01
  ]));

  page.type = 'video';

  // Find video id
  var dom = html.parse(http.request('http://www.dmax.de/programme/'+seriesName+'/videos/'+episodeName+'/').toString());
  var param = dom.root.getElementByTagName('param');
  var videoId = 0;
  for (var i = 0; i < param.length; i++) {
    if (param[i].attributes.getNamedItem('name').value == '@videoPlayer') {
      videoId = parseFloat(param[i].attributes.getNamedItem('value').value);
      break;
    }
  }

  // Okay, we need to convert our contentID to a float (double) and copy it in the amfBuffer
  // This one is a bit tricky but works^^
  var f = new Float64Array(1);
  f[0] = videoId;
  for (var i = 0; i < f.buffer.length; i++) {
    if (switchEndian) {  // reversed byte order depending on system
      amfBuffer[amfBuffer.length-36+i] = f.buffer[7-i];
    } else {
      amfBuffer[amfBuffer.length-36+i] = f.buffer[i];
    }
  }

  // Now do an amf request
  http.request('http://c.brightcove.com/services/messagebroker/amf?playerKey=AQ~~,AAAAAGLvCOI~,a0C3h1Jh3aQKs2UcRZrrxyrjE0VH93xl', {
    method: 'POST',
    postdata: amfBuffer,
    headers: {
      'Content-Type': 'application/x-amf'
    }
  }, function(err, result) {
    if(err) {
      page.error(err);
    } else {
      try {
        // Filter printable chars out of result buffer
        var str = '';
        for (var i = 0; i<result.bytes.length; i++) {
          if ((result.bytes[i] > 31) && (result.bytes[i] < 127)) {
            str += String.fromCharCode(result.bytes[i]);
          }
        }

        // Cut video url
        str = str.match(/http:\/\/discintlhdflash.+mp4/)[0];
        str = str.substr(0, str.indexOf('.mp4')+4);

        // Profit
        page.source = 'videoparams: {"title": "'+episodeName+'", "sources": [{"url": "'+str+'"}], "no_fs_scan": true, "canonicalUrl": "'+page.root.url+'"}';
      } catch (e) {
        page.error(e);
      }
    }
  });
});


// Season was chosen, list episodes
new page.Route(PREFIX + ":listEpisodes:(.+):(.+)", function(page, seriesName, seasonName) {
  // Set metadata (type, title, icon)
  page.type = 'directory';
  page.metadata.title = 'DMAX - '+seriesName+': '+seasonName;
  page.metadata.icon = Plugin.path + 'DMAX.svg';
  page.loading = true;

  http.request('http://dmax.de/programme/'+seriesName+'/'+seasonName+'/', {compression: true}, function(err, result) {
    page.loading = false;

    if(err) {
      page.error(err);
    } else {
      try {
        var dom = html.parse(result.toString());
        var elem = dom.root.getElementByClassName('dni-episode-browser-item');
        for (var i = 0; i < elem.length; i++) {
          var rgx = elem[i].attributes.getNamedItem('href').value.match(/programme\/(.+)\/videos\/(.+)\//);
          if (rgx) {
            if (rgx.length != 3) {continue;}

            var episodeTitle = 'Episode '+parseInt(i+1);
            try {
              episodeTitle += ' - '+elem[i].getElementByClassName('item-title')[0].textContent;
            } catch (e) {}

            var episodeImage = null;
            try {
              episodeImage = elem[i].getElementByTagName('img')[0].attributes.getNamedItem('src').value;
            } catch (e) {}

            var episodeDescription = null;
            try {
              episodeDescription = elem[i].getElementByTagName('p')[0].textContent;
            } catch (e) {}


            page.appendItem(PREFIX+':playEpisode:'+rgx[1]+':'+rgx[2], 'video', {title: episodeTitle, icon: episodeImage, description: episodeDescription});
          }
        }
      } catch (e) {
        page.error(e);
      }
    }
  });
});


// Series was chosen, list seasons
// TODO: Wenn nicht nach Staffeln sortiert (Die Abholzer) dann Videoseite aufrufen und Kram auflisten.
new page.Route(PREFIX + ":listSeasons:(.+)", function(page, seriesName) {
  // Set metadata (type, title, icon)
  page.type = 'directory';
  page.metadata.title = 'DMAX - '+seriesName+' - Staffeln';
  page.metadata.icon = Plugin.path + 'DMAX.svg';
  page.loading = true;

  http.request('http://dmax.de/programme/'+seriesName+'/', {compression: true}, function(err, result) {
    page.loading = false;

    if(err) {
      page.error(err);
    } else {
      try {
        var dom = html.parse(result.toString());
        var elem = dom.root.getElementByClassName('currentPage')[0].getElementByTagName('a');
        for (var i = 0; i < elem.length; i++) {
          var rgx = elem[i].attributes.getNamedItem('href').value.match(/programme\/(.+)\/(.+)\//);
          if (rgx) {
            if (rgx.length != 3) {continue;}
            page.appendItem(PREFIX+':listEpisodes:'+rgx[1]+':'+rgx[2], 'directory', {title: elem[i].textContent});
          }
        }
      } catch (e) {
        page.error(e);
      }
    }
  });
});


// Landing page
new page.Route(PREFIX + ":start", function(page) {
  // Set metadata (type, title, icon)
  page.type = 'directory';
  page.metadata.title = 'DMAX';
  page.metadata.icon = Plugin.path + 'DMAX.svg';
  page.model.contents = 'grid';
  page.loading = true;

  http.request('http://dmax.de/videos', {compression: true}, function(err, result) {
    page.loading = false;

    if(err) {
      page.error(err);
    } else {
      try {
        page.appendItem(null, 'separator', {title: 'Sendungen A-Z'});

        // Search series json data
        var resstr = result.toString();
        resstr = resstr.substr(resstr.indexOf('var dniListingData = ')+21);
        resstr = resstr.substr(0, resstr.indexOf('\n')-1); // -1 kills terminating ;

        // Parse data
        var jsonres = JSON.parse(resstr);
        for (var i = 0; i < jsonres.raw.length; i++) {
          try {
            page.appendItem(PREFIX+':listSeasons:'+jsonres.raw[i].url.match(/programme\/(.+)\/[a-z]/)[1], 'directory', {title: jsonres.raw[i].title, icon: jsonres.raw[i].image});
          } catch (e) {
            console.log(PREFIX+': Unparsed item -> '+JSON.stringify(jsonres.raw[i]));
          }
        }
      } catch (e) {
        page.error(e);
      }
    }
  });
});
