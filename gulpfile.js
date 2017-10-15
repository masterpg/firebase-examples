const gulp = require('gulp');
const path = require('path');
const del = require('del');
const sequence = require('run-sequence');
const merge = require('merge-stream');
const vfs = require('vinyl-fs');
const shell = require('gulp-shell');
const changed = require('gulp-changed');
const imagemin = require('gulp-imagemin');
const _ = require('lodash');

//----------------------------------------------------------------------
//
//  Constants
//
//----------------------------------------------------------------------

/**
 * Web公開ディレクトリです。
 */
const PUBLIC_DIR = 'public';

/**
 * 環境定数(開発)です。
 */
const ENV_DEV = 'dev';

/**
 * 環境定数(本番)です。
 */
const ENV_PROD = 'prod';

//----------------------------------------------------------------------
//
//  Tasks
//
//----------------------------------------------------------------------

/**
 * firebaseのローカルサーバーを起動します。
 */
gulp.task('firebase-serve', shell.task([
  `firebase serve -o localhost -p 5000 --only hosting,functions`,
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
  del.sync([
    'public',
    'functions/index.js',
  ]);
});

//--------------------------------------------------
//  開発サーバー起動
//--------------------------------------------------

/**
 * 開発サーバーを起動します。
 */
gulp.task('serve', (done) => {
  sequence('clean:dev', 'build:dev', 'firebase-serve', done);
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
 * webpack(フロント開発環境用)を実行します。
 */
gulp.task('build:front-dev', shell.task([
  `webpack --config ./webpack.config.${ENV_DEV}`
]));

/**
 * webpack(functions開発環境用)を実行します。
 */
gulp.task('build:func-dev', shell.task([
  `cd functions && webpack --config ./webpack.config.${ENV_DEV}`
]));

/**
 * 公開ディレクトリ(開発環境用)の構築を行います。
 */
gulp.task('build:dev', () => {
  sequence(
    'build-dev-resources',
    ['build:front-dev', 'build:func-dev']
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
gulp.task('build', (done) => {
  sequence(
    'clean',
    'imagemin',
    'build-prod-resources',
    'build:front-prod',
    'build-service-worker',
    'build:func-prod',
    done
  );
});

/**
 * ビルド結果を検証するための開発サーバーを起動します。
 */
gulp.task('serve:prod', (done) => {
  sequence(
    ['firebase-serve'],
    done
  );
});

/**
 * webpack(フロント本番環境用)を実行します。
 */
gulp.task('build:front-prod', shell.task([
  `webpack --config ./webpack.config.${ENV_PROD}`
]));

/**
 * webpack(functions本番環境用)を実行します。
 */
gulp.task('build:func-prod', shell.task([
  `cd functions && webpack --config ./webpack.config.${ENV_PROD}`
]));

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
