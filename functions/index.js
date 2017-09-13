'use strict';

const functions = require('firebase-functions');

// クロスドメインアクセスの設定
const cors = require('cors')({
  origin: (origin, callback) => {
    const whiteList = [
      'https://hoge-ac1d8.firebaseapp.com'
    ];
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
});

// "Hello World!"を返すHTTP API
exports.hello = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    res.status(200).send(`Hello World!`);
  });
});






