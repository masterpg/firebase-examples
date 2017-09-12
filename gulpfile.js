const gulp = require('gulp');
const runSequence = require('run-sequence');
const shell = require('gulp-shell');

//--------------------------------------------------
//  プロジェクトビルド
//--------------------------------------------------

/**
 * プロジェクトのビルドを行います。
 */
gulp.task('build', (cb) => {
  runSequence(
    'build-app',
    'generate-service-worker',
    cb);
});

/**
 * アプリケーションをビルドします。
 */
gulp.task('build-app', shell.task([
  'polymer build',
]));


/**
 * service-worker.jsを生成します。
 */
gulp.task('generate-service-worker', shell.task([
  'cd build/es6-bundled && sw-precache --config=../../sw-precache-config.js',
]));
