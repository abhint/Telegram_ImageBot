const fs = require('fs');
const request = require('request');

const download = (url, path, callback) => {
  request.head(url, (err, res, body) => {
    request(url, function (error) {
      if (error === null) {
        return
      }
      else {
        console.log(error)
      }
    })
      .pipe(fs.createWriteStream(path))
      .on('close', callback)
  })
  return path
}


module.exports = download;