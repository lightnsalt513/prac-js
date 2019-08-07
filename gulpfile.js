// define plugins
var gulp = require('gulp');
var sass = require('gulp-sass');

// compile sass
gulp.task('sass', function() {
    return gulp.src('./sass/*.scss') // scss file location
            .pipe(sass())
            .pipe(gulp.dest('./'));
});

// watch the Sass directory for changes.
// gulp.task('watch', function() {
//     gulp.watch('./sass/*.scss', ['sass']); // if a file changes, re-run 'sass'
// });

gulp.task('minify', ['sass'], function() { // run 'sass' before minify
    return gulp.src('style.css')
            .pipe(cssnano())
            .pipe(gulp.dest('./'));
});

// refactor 'watch' task
gulp.task('watch', function() {
    gulp.watch('./sass/*.scss', ['minify']); // if a file changes, re-run 'sass' and then 'minify'
});
