var PREFIX = JSON.parse(Plugin.manifest).id;

var page = require('showtime/page');
var http = require('showtime/http');
var misc = require('native/misc');

var cacheStash = 'plugin/' + Plugin.id + '/tempvars';

var authKey = '';

// Create the service (ie, icon on home screen)
require('showtime/service').create('DMAX', PREFIX + ':start', 'video', true, Plugin.path + 'DMAX.svg');

// Play episode
new page.Route(PREFIX + ":playEpisode:([0-9]+):(.+)", function(page, videoId, episodeName) {
  page.type = 'video';

  var jsonres = JSON.parse(http.request('https://sonic-eu1-prod.disco-api.com/playback/videoPlaybackInfo/'+videoId, {headers: {'Authorization': 'Bearer '+authKey, 'Referer': 'https://www.dmax.de/programme/fast-n-loud/'}}).toString());

  page.source = 'videoparams: ' + JSON.stringify({
    title: episodeName,
    sources: [{url: jsonres.data.attributes.streaming.hls.url}],
    no_fs_scan: true,
    canonicalUrl: page.root.url.toString()
  });
});


// Season was chosen, list episodes
new page.Route(PREFIX + ":listEpisodes:(.+):(.+):([0-9]+)", function(page, cacheId, seriesName, seasonNumber) {
  // Set metadata (type, title, icon)
  page.type = 'directory';
  page.metadata.title = 'DMAX - '+seriesName+': Staffel '+seasonNumber;
  page.metadata.icon = Plugin.path + 'DMAX.svg';
  page.loading = true;

  try {
    var episodeData = JSON.parse(misc.cacheGet(cacheStash, cacheId));

    for (var i = 0; i < episodeData.length; i++) {
      var episodeTitle = episodeData[i].title;
      episodeTitle = episodeTitle.replace('{S}', 'S');
      episodeTitle = episodeTitle.replace('{E}', 'E');
      page.appendItem(PREFIX+':playEpisode:'+episodeData[i].id+':'+episodeData[i].name, 'video', {
        title: episodeTitle,
        icon: episodeData[i].image.src,
        description: episodeData[i].description,
        duration: episodeData[i].videoDuration / 1000
      });
    }

    page.loading = false;
  } catch (e) {
    page.error(e);
  }
});


// Series was chosen, list seasons
new page.Route(PREFIX + ":listSeasons:(.+):(.+)", function(page, seriesAliasOrID, seriesName) {
  // Set metadata (type, title, icon)
  page.type = 'directory';
  page.metadata.title = 'DMAX - '+seriesName+' - Staffeln';
  page.metadata.icon = Plugin.path + 'DMAX.svg';
  page.loading = true;
  var pageEmpty = true;

  http.request('https://dmax.de/api/show-detail/'+seriesAliasOrID, {compression: true}, function(err, result) {
    page.loading = false;

    if(err) {
      page.error(err);
    } else {
      var jsonres = JSON.parse(result.toString());

      if (jsonres.show.episodeCount == 0) {
        page.type = 'empty';
        return;
      }

      for (var i = 0; i < jsonres.show.seasonNumbers.length; i++) {
        var cacheId = seriesName + jsonres.show.seasonNumbers[i].toString();
        if (jsonres.videos.episode[jsonres.show.seasonNumbers[i]] != undefined) {
          misc.cachePut(cacheStash, cacheId, JSON.stringify(jsonres.videos.episode[jsonres.show.seasonNumbers[i].toString()]), 86400);
          page.appendItem(
            PREFIX+':listEpisodes:'+cacheId+':'+seriesName+':'+jsonres.show.seasonNumbers[i],
            'directory',
            {title: 'Staffel '+jsonres.show.seasonNumbers[i]}
          );
        }
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

  http.request('https://www.dmax.de/api/shows/beliebt?limit=100', {compression: true, headers: {'Cookie': ''}}, function(err, result) {
    page.loading = false;
    try {
      authKey = result.headers['Set-Cookie'].match(/sonicToken=([^;]+)/)[1];
    } catch (e) {
      console.log(e);
    }

    if(err) {
      page.error(err);
    } else {
      try {
        var jsonres = JSON.parse(result.toString());
        for (var i = 0; i < jsonres.items.length; i++) {
          page.appendItem(PREFIX+':listSeasons:'+jsonres.items[i].id+':'+jsonres.items[i].title, 'directory', {
            title: jsonres.items[i].title,
            icon: jsonres.items[i].image.src
          });
        }
      } catch (e) {
        page.error(e);
      }
    }
  });
});
