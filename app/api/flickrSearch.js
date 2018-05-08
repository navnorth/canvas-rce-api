"use strict";

const unirest = require("unirest");

const flickrBase = "https://api.flickr.com/services/rest";
// extras=needs_interstitial is required to get undocumented needs_interstitial
// photo property in the results
const flickrQuery =
  "method=flickr.photos.search&format=json&sort=relevance&license=1,2,3,4,5,6&per_page=15&nojsoncallback=1&extras=needs_interstitial";

function getFlickrResults(searchTerm) {
  let flickrKey = process.env.FLICKR_API_KEY;
  let encodedTerm = encodeURIComponent(searchTerm);
  let queryAddendum = `api_key=${flickrKey}&text=${encodedTerm}`;
  let flickrUrl = `${flickrBase}?${flickrQuery}&${queryAddendum}`;
  return new Promise(resolve => {
    unirest.get(flickrUrl).end(resolve);
  });
}

function transformSearchResults(results) {
  return (
    results.body.photos.photo
      // needs_interstitial is an undcoumented parameter of the photo object.
      // it seems to be reliable at identifying nsfw rsults where safe and the
      // safe_search filter are not. this should be the first thing to check if
      // nsfw results come through in the future.
      .filter(photo => photo.needs_interstitial != 1)
      .map(photo => {
        const url = `https://farm${photo.farm}.static.flickr.com/${
          photo.server
        }/${photo.id}_${photo.secret}.jpg`;
        const link = `https://www.flickr.com/photos/${photo.owner}/${photo.id}`;
        return {
          id: photo.id,
          title: photo.title,
          href: url,
          link: link
        };
      })
  );
}

// get results from Flickr API
function flickrSearch(request, response) {
  let searchTerm = request.query.term;
  getFlickrResults(searchTerm)
    .then(searchResults => {
      let images = transformSearchResults(searchResults);
      response.status(searchResults.status);
      response.send(images);
    })
    .catch(e => {
      process.stderr.write("Flickr Search Failed");
      process.stderr.write("" + e);
      response.status(500);
      response.send("Internal Error, see server logs");
    });
}

module.exports = flickrSearch;
