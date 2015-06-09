var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');

gulp.task('styles', function() {
  gulp.src('sass/*.scss')
    .pipe(plumber())
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(concat('styles.css'))
  .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(gulp.dest('./css'))
});

gulp.task('default', function() {
  gulp.watch('sass/*.scss', ['styles']);
  gulp.watch('sass/**/*.scss', ['styles']);
});