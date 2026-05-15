import gulp from 'gulp';
import imagemin from 'gulp-imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';
import imageminWebp from 'imagemin-webp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'gulp-csso';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import browserSync from 'browser-sync';
import posthtml from 'gulp-posthtml';
import include from 'posthtml-include';
import { deleteAsync as del } from 'del';

const server = browserSync.create();

// Пути
const paths = {
  src: {
    scss: 'source/scss/**/*.scss',
    js: 'source/scripts/**/*.js',
    html: 'source/**/*.html',
    components: 'source/components/*.html',
    images: 'source/img/**/*.{jpg,jpeg,png,gif,svg,webp}',
    svgIcons: 'source/img/icons/*.svg',
    fonts: 'source/fonts/**/*',
  },
  build: {
    css: 'build/css/',
    js: 'build/scripts/',
    html: 'build/',
    components: 'build/components/',
    images: 'build/img/',
    sprites: 'build/img/sprites/',
    fonts: 'build/fonts/',
  },
  watch: {
    scss: 'source/scss/**/*.scss',
    js: 'source/scripts/**/*.js',
    html: 'source/**/*.html',
    components: 'source/components/*.html',
    images: 'source/img/**/*.{jpg,jpeg,png,gif,svg,webp}',
    fonts: 'source/fonts/**/*',
  },
};

// Очистка build
const clean = () => del('build');

const isProduction = process.env.NODE_ENV === 'production';

// Обработка SCSS → CSS
const styles = () => {
  return gulp.src(paths.src.scss, { sourcemaps: !isProduction })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest(paths.build.css, { sourcemaps: !isProduction ? '.' : false }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(csso())
    .pipe(gulp.dest(paths.build.css, { sourcemaps: !isProduction ? '.' : false }));
};

// Минификация JS
const scripts = () => {
  return gulp.src(paths.src.js)
    .pipe(plumber())
    .pipe(uglify())
    .pipe(rename((filePath) => {
      if (filePath.extname === '.js') {
        const nameWithoutMin = filePath.basename.replace(/\.min$/, '');
        filePath.basename = `${nameWithoutMin}.min`;
      }
    }))
    .pipe(gulp.dest(paths.build.js));
};

// Копирование скриптов (все файлы кроме script.js)
const copyScripts = () => {
  return gulp.src([
    'source/scripts/**/*',
    '!source/scripts/script.min.js',
    '!source/scripts/**/script.js'
  ], {
    encoding: false,
    nodir: true
  })
  .pipe(gulp.dest(paths.build.js));
};

// Обработка HTML с include
const html = () => {
  return gulp.src(paths.src.html)
    .pipe(posthtml([
      include({
        root: 'source',           // базовый путь для включений
        encoding: 'utf8',     // кодировка файлов
        trim: true            // удалять пробелы вокруг включенного контента
      })
    ]))
    .pipe(gulp.dest(paths.build.html));
};

// Копирование изображений (dev)
const copyImages = () => {
  return gulp.src(paths.src.images, { encoding: false })
    .pipe(gulp.dest(paths.build.images));
};

const optimizeImages = () => {
  return new Promise((resolve, reject) => {
    const stream = gulp.src(paths.src.images)
      .pipe(plumber({
        errorHandler: (err) => {
          console.error('Imagemin error:', err);
          stream.emit('end');
        }
      }))
      .pipe(imagemin([
        imageminMozjpeg({ quality: 75, progressive: true }),
        imageminPngquant({ quality: [0.65, 0.8], speed: 1 }),
        imageminSvgo({
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                  removeDimensions: true,
                  cleanupIDs: { minify: true, remove: true },
                  removeComments: true,
                  removeUselessDefs: true,
                  removeEditorsNSData: true,
                  removeEmptyAttrs: true,
                  convertPathData: true,
                  mergePaths: true,
                }
              }
            }
          ]
        }),
        // Временное отключение WebP для диагностики
        // imageminWebp({ quality: 75 })
      ], { verbose: true }))
      .pipe(gulp.dest(paths.build.images));

    stream
      .on('end', () => {
        console.log('OptimizeImages: завершено');
        resolve();
      })
      .on('error', (err) => {
        console.error('OptimizeImages error:', err);
        reject(err);
      });
  });
};

// Копирование шрифтов
const copyFonts = () => {
  return gulp.src(paths.src.fonts, { encoding: false })
    .pipe(gulp.dest(paths.build.fonts));
};

// Сервер
const serve = (done) => {
  server.init({
    server: 'build',
    notify: false,
    open: true,
    cors: true,
  });
  done();
};

// Наблюдатель
const watch = () => {
  gulp.watch(paths.watch.scss, gulp.series(styles, reload));
  gulp.watch(paths.watch.js, gulp.series(scripts, copyScripts, reload));
  gulp.watch(paths.watch.html, gulp.series(html, reload));
  gulp.watch(paths.watch.images, gulp.series(isProduction ? optimizeImages : copyImages, reload));
  gulp.watch(paths.watch.fonts, gulp.series(copyFonts, reload));
};

// Перезагрузка
const reload = (done) => {
  server.reload();
  done();
};

// Сборка: последовательное выполнение (важно для первого запуска)
const build = gulp.series(
  clean,
  styles,           // 1. Сначала компилируем SCSS → CSS
  gulp.parallel(    // 3. Параллельно остальные задачи
    scripts,
    html,
    // copyImages,
    isProduction ? optimizeImages : copyImages,
    copyScripts,
    copyFonts
  )
);

// Дефолтная задача (разработка)
export default gulp.series(
  clean,
  styles,           // 1. Компилируем SCSS
  gulp.parallel(    // 3. Параллельно остальное
    scripts,
    html,
    copyImages,
    copyScripts,
    copyFonts
  ),
  gulp.parallel(serve, watch)
);

// Экспорт отдельных задач
export {
  clean,
  styles,
  scripts,
  html,
  copyImages,
  optimizeImages,
  serve,
  watch,
  build,
  copyScripts,
  copyFonts
};
