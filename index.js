#!/usr/bin/env node

const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const process = require('process')

console.log(chalk.blue('==>') + ' nx: creating new site')

var projectDirectory = process.cwd() + '/new-site'

if (!fs.existsSync(projectDirectory)) {
  fs.mkdirSync(projectDirectory)
}

// Templates {{{

var packageJson =
`{
  "name": "js-sandbox",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "start": "babel-node src",
    "build": "yarn start",
    "dev": "babel-node src serve"
  },
  "dependencies": {
    "@babel/preset-env": "^7.8.3",
    "@fullhuman/postcss-purgecss": "^2.0.5",
    "autoprefixer": "^9.7.4",
    "cssnano": "^4.1.10",
    "express": "^4.17.1",
    "react": "^16.12.0",
    "tailwindcss": "^1.1.4"
  },
  "devDependencies": {
    "@babel/core": "^7.8.3",
    "@babel/node": "^7.8.3",
    "@babel/preset-react": "^7.8.3",
    "@babel/runtime": "^7.8.3",
    "react-dom": "^16.12.0"
  }
}`

// fs.writeFileSync

// seems to print path of the index.js that is being executed..
// console.log(path.dirname(__filename))

// console.log(path.dirname('./'))

function write(name, dir, content) {
  var filepath = `${dir}/${name}`
  console.log(chalk.yellow('  ->') + ` writing ${name}`)
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, content)
  } else {
    console.log(chalk.red('!!') + `  ${name} already exists, skipping..`)
  }
}

console.log(projectDirectory)

// }}}

write('package.json', projectDirectory, packageJson)
