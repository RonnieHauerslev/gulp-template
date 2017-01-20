// include gulp
var gulp = require('gulp'),

// include plug-ins
	jshint = require('gulp-jshint'),
	changed = require('gulp-changed'),
	imagemin = require('gulp-imagemin'),
	minifyHTML = require('gulp-htmlmin'),
	concat = require('gulp-concat'),
	inject = require('gulp-inject'),
	stripDebug = require('gulp-strip-debug'),
	uglify = require('gulp-uglify'),
	autoprefix = require('gulp-autoprefixer'),
	cleanCSS = require('gulp-clean-css'),
	sass = require('gulp-sass'),
	cached = require('gulp-cached'),
	sassPartialsImported = require('gulp-sass-partials-imported'),

// other variables
	scss_dir = './src/styles/sass/';

// JS hint task
gulp.task('jshint', () => {
	gulp.src('./src/scripts/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

// minify new images
gulp.task('imagemin', () => {
	var imgSrc = './src/images/**/*',
		imgDst = './build/images';

	gulp.src(imgSrc)
		.pipe(changed(imgDst))
		.pipe(imagemin())
		.pipe(gulp.dest(imgDst));
});

// inject relevant stylesheets and scripts, minify new or changed HTML pages
gulp.task('htmlpage', () => {
	var htmlSrc = './src/*.html',
		htmlDst = './build',
		scripts = gulp.src(['./build/scripts/jquery.min.js', './build/scripts/bootstrap.min.js', './build/scripts/app.js'], {read: false}),
		css = gulp.src(['./build/styles/bootstrap.min.css', './build/styles/bootstrap-theme.min.css', './build/styles/font-awesome.min.css', './build/styles/default.css'], {read: false});

	gulp.src(htmlSrc)
		.pipe(changed(htmlDst))
		.pipe(inject(scripts, {
			addRootSlash: false,
			transform: (filePath, file, i, length) => {
				var newPath = filePath.replace('build/', '');
				console.log('injected script: ' + newPath);
				return '<script src="' + newPath  + '"></script>';
			}
		}))
		.pipe(inject(css, {
			addRootSlash: false,
			transform: (filePath, file, i, length) => {
				var newPath = filePath.replace('build/', '');
				console.log('injected style: ' + newPath);
				return '<link rel="stylesheet" href="' + newPath + '">';
			}
		}))
		.pipe(minifyHTML({collapseWhitespace: true}))
		.pipe(gulp.dest(htmlDst));
});

// JS concat, strip debugging and minify
gulp.task('scripts', () => {
	gulp.src(['./src/scripts/lib.js','./src/scripts/*.js'])
		.pipe(concat('app.js'))
		.pipe(stripDebug())
		.pipe(uglify())
		.pipe(gulp.dest('./build/scripts/'));
});

// SASS to CSS
gulp.task('sass', () => {
	gulp.src(['./src/styles/sass/**/*.scss'])
		.pipe(cached('sassfiles'))
		.pipe(sassPartialsImported(scss_dir))
		.pipe(sass({includePaths: scss_dir, outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(gulp.dest('./build/styles'));
});

// copy relevant boostrap and jquery files to build
gulp.task('copyBootstrap', () => {
	gulp.src(
		['./node_modules/bootstrap/dist/js/bootstrap.min.js',
		'./node_modules/jquery/dist/jquery.min.js'])
		.pipe(gulp.dest('./build/scripts'));

	gulp.src(
		['./node_modules/bootstrap/dist/css/bootstrap.min.css',
		'./node_modules/bootstrap/dist/css/bootstrap-theme.min.css'])
		.pipe(gulp.dest('./build/styles'));
});

// copy relevant font-awesome files to build
gulp.task('copyFontAwesome', () => {
	gulp.src(['./node_modules/font-awesome/css/font-awesome.min.css'])
		.pipe(gulp.dest('./build/styles'));

	gulp.src(['./node_modules/font-awesome/fonts/*'])
		.pipe(gulp.dest('./build/fonts'));
});

// default gulp task
gulp.task('default', ['imagemin', 'jshint', 'scripts', 'copyFontAwesome', 'sass', 'copyBootstrap', 'htmlpage'], () => {
	// watch for image-changes
	gulp.watch('./src/images/**/*', ['imagemin']);
	
	// watch for HTML changes
	gulp.watch('./src/*.html', ['htmlpage']);

	// watch for JS changes
	gulp.watch('./src/scripts/*.js', ['scripts']);

	// watch for SASS changes
	gulp.watch('./src/styles/sass/*.scss', ['sass']);
});