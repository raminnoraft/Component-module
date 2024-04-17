let gulp = require('gulp'),
  sass = require('gulp-dart-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  $ = require('gulp-load-plugins')(),
  cleanCss = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  postcssInlineSvg = require('postcss-inline-svg'),
  browserSync = require('browser-sync').create(), // Added comma here
  pxtorem = require('postcss-pxtorem'),
  gulpStylelint = require('gulp-stylelint'),
  eslint = require('gulp-eslint'),
  postcssProcessors = [
    pxtorem({
      propList: ['font', 'font-size', 'line-height', 'letter-spacing', '*margin*', '*padding*'],
      mediaQuery: true
    })
  ];

const paths = {
  scss: {
    src: './scss/**/*.scss',
    dest: './css',
    watch: './scss/**/*.scss',
  },
  js: {
    jquery: './node_modules/jquery/dist/jquery.min.js',
    popper: './node_modules/popper.js/dist/umd/popper.min.js',
    poppermap: './node_modules/popper.js/dist/umd/popper.min.js.map',
    matchHeight: './node_modules/jquery-match-height/dist/jquery.matchHeight-min.js',
    dest: './js'
  }
}

// Compile sass into CSS & auto-inject into browsers
function styles () {
  return gulp.src([paths.scss.src])
    .pipe(sourcemaps.init())
    .pipe(sass()).on('error', sass.logError)
    .pipe($.postcss(postcssProcessors))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(cleanCss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(browserSync.stream())
}

// Move the javascript files into our js folder
function js () {
  return gulp.src([paths.js.jquery, paths.js.popper, paths.js.poppermap, paths.js.matchHeight])
    .pipe(gulp.dest(paths.js.dest))
    .pipe(browserSync.stream())
}

function lintCssTask() {
  return gulp
    .src('./scss/**/*.scss')
    .pipe(gulpStylelint({
      reporters: [
        { formatter: 'string', console: true },
      ],
    }));
}

function lintJsTask() {
  return gulp
    .src(['./js/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

// Static Server + watching scss/html files
function serve () {
  gulp.watch([paths.scss.watch], styles).on('change', browserSync.reload)
}

const build = gulp.series(lintCssTask, styles, gulp.parallel(js))

exports.styles = styles
exports.js = js
exports.serve = serve

exports.default = build
