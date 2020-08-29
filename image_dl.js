const fs = require('fs');
const request = require('request');

    const download = (url, path, callback) => {
        request.head(url, (err, res, body) => {
          request(url, function(error){
            console.log(error)  
          })
          .pipe(fs.createWriteStream(path))
          .on('close', callback)
        })
      }

module.exports = download;