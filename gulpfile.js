/*jslint node: true */

/**
 * Plugins
 */
var gulp = require('gulp')
  , path = require('path')
  , rename = require('gulp-rename')
  , concat = require('gulp-concat')
  , uglify = require('gulp-uglify')
  , jshint = require('gulp-jshint')
  , stylish = require('jshint-stylish')
  , less = require('gulp-less')
  , prefix = require('gulp-autoprefixer')
  , csslint = require('gulp-csslint')
  , htmlhint = require('gulp-htmlhint')
  , plumber = require('gulp-plumber')
  , notify = require('gulp-notify');

/**
 * Paths
 */
var paths = {
  scripts: [
    'htdocs/**/_*.js'
  ],
  jshint: [
    'gulpfile.js',
    'htdocs/**/*.js',
    '!htdocs/**/all.min.js',
    '!htdocs/**/vendor/**/*.js'
  ],
  styles: [
    'htdocs/**/*.less',
    '!htdocs/**/_*.less'
  ],
  htmlhint: [
    'htdocs/**/*.html'
  ],
  watch: {
    styles: [
      'htdocs/**/*.less'
    ]
  }
};

/**
 * Options
 */
var options = {
  scripts: {
    uglify: {
      preserveComments: 'some',
      outSourceMap: false
    }
  },
  styles: {
    less: {
      paths: ['htdocs/common/_less']
      //@import対策
    },
    prefix: ['> 1%', 'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'ios 6', 'android 4']
  }
};

/**
 * Concatenate and minify scripts.
 */
gulp.task('scripts', function() {
  gulp
    .src(paths.scripts)
    .pipe(plumber())
    .pipe(concat('all.min.js'))
    .pipe(uglify(options.scripts.uglify))
    .pipe(gulp.dest('htdocs/js/'));
});

/**
 * jshint
 */
gulp.task('jshint', function() {
  gulp
    .src(paths.jshint)
    .pipe(plumber())
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish));
});

/**
 * Compile less and csslint.
 */
gulp.task('styles', function() {
  gulp
    .src(paths.styles)
    //gulp.src()はまず処理対象のファイルを列挙。それぞれのファイルに対して.pipe()された処理を順に実行。
    .pipe(plumber({errorHandler: notify.onError("<%= error.message %>")}))
    // //エラー時でも続行&デスクトップノーティフィケーション
    .pipe(less(options.styles.less))
    // //lessをコンパイル&@import対策
    .pipe(prefix(options.styles.prefix))
    //ベンダープレフィックス用
    .pipe(rename(function(data) {
      data.dirname = path.join(data.dirname, '..', 'css');
    }))
    //data.dirnameでディレクトリパスを取得し,'..'でひとつ前にcssというディレクトリを加えている
    .pipe(gulp.dest('htdocs/'))
    .pipe(csslint('.csslintrc'))
    .pipe(csslint.reporter());
});

/**
 * htmlhint
 */
gulp.task('htmlhint', function() {
  gulp
    .src(paths.htmlhint)
    .pipe(plumber())
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.reporter());
});

/**
 * Task dependencies.
 */
gulp.task('all', ['scripts', 'jshint', 'styles', 'htmlhint']);

/**
 * Watch.
 */
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.jshint, ['jshint']);
  gulp.watch(paths.watch.styles, ['styles']);
  gulp.watch(paths.htmlhint, ['htmlhint']);
});

/**
 * Default task.
 */
gulp.task('default', ['watch']);
