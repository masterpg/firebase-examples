const gulp = require('gulp');
const path = require('path');
const del = require('del');
const runSequence = require('run-sequence');
const merge = require('merge-stream');
const vfs = require('vinyl-fs');
const shell = require('gulp-shell');
const changed = require('gulp-changed');
const imagemin = require('gulp-imagemin');
const _ = require('lodash');

const webpackStream = require('webpack-stream');
const webpack = require('webpack');

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
gulp.task('firebase-serve', shell.task([
  `firebase serve --only hosting,functions`,
]));

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
  return del(['public']);
});

//--------------------------------------------------
//  開発サーバー起動
//--------------------------------------------------

/**
 * 開発サーバーを起動します。
 */
gulp.task('serve', () => {
  return runSequence('clean:dev', 'build:dev', 'firebase-serve');
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
 * webpack(開発環境用)を実行します。
 */
gulp.task('webpack:dev', () => {
  return runWebpack('dev');
});

/**
 * 公開ディレクトリ(開発環境用)の構築を行います。
 */
gulp.task('build:dev', () => {
  return runSequence(
    'build-dev-resources',
    'webpack:dev'
  );
});

/**
 * 公開ディレクトリに開発環境用のリソースを準備します。
 */
gulp.task('build-dev-resources', ['imagemin'], () => {
  // node_modulesのシンボリックリンクを作成
  const node = vfs.src('node_modules', {followSymlinks: false})
    .pipe(vfs.symlink(PUBLIC_DIR));
  const manifest = vfs.src('manifest.json', {followSymlinks: false})
    .pipe(vfs.symlink(PUBLIC_DIR));
  // service-worker.jsのシンボリックリンクを作成
  const serviceWorker = vfs.src('service-worker.js', {followSymlinks: false})
    .pipe(vfs.symlink(PUBLIC_DIR));

  return merge(node, manifest, serviceWorker);
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
    'webpack:prod',
    'build-prod-resources',
    'build-service-worker',
    'imagemin'
  );
});

/**
 * ビルド結果を検証するための開発サーバーを起動します。
 */
gulp.task('serve:build', () => {
  return runSequence(
    ['firebase-serve']
  );
});

/**
 * webpack(本番環境用)を実行します。
 */
gulp.task('webpack:prod', () => {
  return runWebpack('prod');
});

/**
 * 公開ディレクトリに本番環境用のリソースを準備します。
 */
gulp.task('build-prod-resources', () => {
  const files = gulp.src([
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

//----------------------------------------------------------------------
//
//  Methods
//
//----------------------------------------------------------------------

/**
 * webpackを実行します。
 * @param mode "dev", "prod"のいずれかを指定します。
 */
function runWebpack(mode) {
  const config = _.cloneDeep(require(`./webpack.config.${mode}`));
  const destPath = config.output.path;
  return webpackStream(config, webpack)
    .pipe(gulp.dest(destPath));
}
