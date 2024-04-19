const gulp = require('gulp');
const sass = require('gulp-dart-sass');
const sourcemaps = require('gulp-sourcemaps');
const $ = require('gulp-load-plugins')();
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const postcssInlineSvg = require('postcss-inline-svg');
const pxtorem = require('postcss-pxtorem');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const terser = require('gulp-terser');
const gulpStylelint = require('gulp-stylelint');
const eslint = require('gulp-eslint');
const browserify = require('browserify');

const postcssProcessors = [
  postcssInlineSvg({
    removeFill: true,
    paths: ['./node_modules/bootstrap-icons/icons'],
  }),
  pxtorem({
    propList: ['font', 'font-size', 'line-height', 'letter-spacing', '*margin*', '*padding*'],
    mediaQuery: true,
  }),
];
const paths = {
  scss: {
    src: './scss/**/*.scss',
    dest: './css',
    watch: './scss/**/*.scss',
    bootstrap: './node_modules/bootstrap/scss/bootstrap.scss',
  },
  js: {
    bootstrap: './node_modules/bootstrap/dist/js/bootstrap.min.js',
    jquery: './node_modules/jquery/dist/jquery.min.js',
    popper: './node_modules/popper.js/dist/umd/popper.min.js',
    poppermap: './node_modules/popper.js/dist/umd/popper.min.js.map',
    dest: './js',
    src: './js/**/*.js',
    minified: '!./js/**/*.min.js',
    min_dest: './js/minified',
  },
};
// Compile sass into CSS & auto-inject into browsers
function styles() {
  return gulp.src([paths.scss.bootstrap, paths.scss.src])
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: [
        './node_modules/bootstrap/scss',
        '../../contrib/bootstrap5/scss',
      ],
    }).on('error', sass.logError))
    .pipe($.postcss(postcssProcessors))
    .pipe(postcss([autoprefixer({
      browsers: [
        'Chrome >= 35',
        'Firefox >= 38',
        'Edge >= 12',
        'Explorer >= 10',
        'iOS >= 8',
        'Safari >= 8',
        'Android 2.3',
        'Android >= 4',
        'Opera >= 12'],
    })]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.scss.dest))
    .pipe(cleanCss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.scss.dest));
}
// Move the javascript files into our js folder
function js() {
  return gulp.src([
    paths.js.bootstrap,
    paths.js.jquery,
    paths.js.popper,
    paths.js.poppermap,
  ])
    .pipe(gulp.dest(paths.js.dest));
}
function minifyjs() {
  return gulp.src([
    paths.js.src,
    paths.js.minified,
  ])
    .pipe(plumber())
    .pipe(
      babel({
        presets: [
          [
            '@babel/env',
            {
              modules: false,
            },
          ],
        ],
      }),
    )
    .pipe(terser())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.js.min_dest));
}
// Static Server + watching scss/html files
function serve() {
  // browserSync.init({
  //   proxy: 'http://yourdomain.com',
  // })
  gulp.watch([paths.scss.watch, paths.scss.bootstrap], styles);
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

// const build = gulp.series(styles, gulp.parallel(js, serve))
const build = gulp.series(styles, js, minifyjs);
exports.styles = styles;
exports.js = js;
exports.serve = serve;
exports.default = build;
