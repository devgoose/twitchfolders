const { src, dest, series } = require("gulp");
const del = require("del");
const concat = require("gulp-concat");
const ts = require("gulp-typescript");
const sourcemaps = require("gulp-sourcemaps");
const tsProject = ts.createProject("./tsconfig.json");
const uglify = require("gulp-uglify");
const mergeStream = require("merge-stream");
const GulpClient = require("gulp");

const project = ts.createProject("tsconfig.json");

function typescript() {
  return src("src/*.ts")
    .pipe(concat("scripts.ts"))
    .pipe(sourcemaps.init())
    .pipe(project())
    .pipe(sourcemaps.write(".", { includeContent: false }))
    .pipe(dest("dist"));
}

function clean() {
  return del("dist/**", { force: true });
}

function styles() {
  return src("styles/*").pipe(dest("./dist/"));
}

function images() {
  return src("images/*").pipe(dest("./dist/images/"));
}

function extension() {
  return src(["manifest.json", "background.js", "popup.html", "popup.js"]).pipe(
    dest("./dist/")
  );
}

// func docs?

exports.default = series(clean, typescript, styles, images, extension);
