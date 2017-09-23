const gulp = require('gulp');
const path = require('path');
const del = require('del');
const runSequence = require('run-sequence');
const merge = require('merge-stream');
const vfs = require('vinyl-fs');
const shell = require('gulp-shell');
const changed = require('gulp-changed');
const imagemin = require('gulp-imagemin');

const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');

//----------------------------------------------------------------------
//
//  Constants
//
//----------------------------------------------------------------------

/**
 * Web公開ディレクトリです。
 */
const PUBLIC_DIR = 'public';

//----------------------------------------------------------------------
//
//  Tasks
//
//----------------------------------------------------------------------

/**
 * firebaseのローカルサーバーを起動します。
 */
gulp.task('serve:firebase', shell.task([
  `firebase serve --only hosting,functions`,
]));

/**
 * webpackを実行します。
 */
gulp.task('webpack', () => {
  const destPath = webpackConfig.output.path;
  return webpackStream(webpackConfig, webpack)
    .pipe(gulp.dest(destPath));
});

gulp.task('flow', shell.task(
  [
    `yarn flow`,
  ],
  {ignoreErrors: true})
);

/**
 * 画像ファイルを圧縮します。
 */
gulp.task('imagemin', () => {
  const srcGlob = path.join('images', '/**/*.+(ico|jpg|jpeg|png|gif|svg)');
  const dstGlob = path.join(PUBLIC_DIR, 'images');
  const imageminOptions = {
    progressive: true,
    interlaced: true
  };

  return gulp.src(srcGlob)
    .pipe(changed(dstGlob))
    .pipe(imagemin(imageminOptions))
    .pipe(gulp.dest(dstGlob));
});

/**
 * プロジェクトをクリーンします。
 */
gulp.task('clean', () => {
  del.sync(['public']);
});

//--------------------------------------------------
//  開発サーバー起動
//--------------------------------------------------

/**
 * 開発サーバーを起動します。
 */
gulp.task('serve', () => {
  // 変更監視処理
  gulp.watch(['webpack.config.js', 'src/**/*.js'], ['webpack', 'flow']);

  return runSequence('clean:dev', 'build:dev', 'serve:firebase');
});


/**
 * 公開ディレクトリ(開発環境用)のクリーンを行います。
 */
gulp.task('clean:dev', () => {
  return del([
    path.join(PUBLIC_DIR, '**/*'),
    path.join('!' + PUBLIC_DIR, 'images/**'),
    path.join('!' + PUBLIC_DIR, 'app.bundle.js'),
  ]);
});

/**
 * 公開ディレクトリ(開発環境用)の構築を行います。
 */
gulp.task('build:dev', () => {
  return runSequence(
    'webpack',
    'build-dev-resources'
  );
});

/**
 * 公開ディレクトリに開発環境用のリソースを準備します。
 */
gulp.task('build-dev-resources', ['imagemin'], () => {
  // node_modulesのシンボリックリンクを作成
  const node = vfs.src('node_modules', {followSymlinks: false})
    .pipe(vfs.symlink(PUBLIC_DIR));
  // index.htmlのシンボリックリンクを作成
  const index = vfs.src('index.html', {followSymlinks: false})
    .pipe(vfs.symlink(PUBLIC_DIR));
  // manifest.jsonのシンボリックリンクを作成
  const manifest = vfs.src('manifest.json', {followSymlinks: false})
    .pipe(vfs.symlink(PUBLIC_DIR));
  // service-worker.jsのシンボリックリンクを作成
  const serviceWorker = vfs.src('service-worker.js', {followSymlinks: false})
    .pipe(vfs.symlink(PUBLIC_DIR));

  return merge(node, index, manifest, serviceWorker);
});

//--------------------------------------------------
//  本番環境用ビルド
//--------------------------------------------------

/**
 * 公開ディレクトリ(本番環境用)の構築を行います。
 */
gulp.task('build', () => {
  return runSequence(
    'clean',
    'webpack',
    'build-prod-resources',
    'build-service-worker',
    'imagemin'
  );
});

/**
 * 公開ディレクトリに本番環境用のリソースを準備します。
 */
gulp.task('build-prod-resources', () => {
  const files = gulp.src([
    'index.html',
    'manifest.json',
  ]).pipe(gulp.dest(PUBLIC_DIR));

  const webcomponents = gulp.src(
    'node_modules/@webcomponents/webcomponentsjs/webcomponents-*.js',
    {base: 'node_modules'}
  ).pipe(gulp.dest(path.join(PUBLIC_DIR, 'node_modules')));

  return merge(files, webcomponents);
});

/**
 * service-worker.jsを生成します。
 */
gulp.task('build-service-worker', shell.task([
  `cd ${PUBLIC_DIR} && sw-precache --config=../sw-precache-config.js`,
]));
