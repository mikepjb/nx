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

if (!fs.existsSync(projectDirectory + '/src')) {
  fs.mkdirSync(projectDirectory + '/src')
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
  },
  "babel": {
    "presets": [
      "@babel/preset-env",
      "@babel/preset-react"
    ]
  }
}`

var postcssConfig =
`const purgecss = require('@fullhuman/postcss-purgecss')
const cssnano = require('cssnano')

module.exports = {
  plugins: [
    require('tailwindcss'),
    process.env.NODE_ENV === 'production' ? require('autoprefixer') : null,
    process.env.NODE_ENV === 'production'
      ? cssnano({ preset: 'default' })
      : null,
    purgecss({
      content: ['./layouts/**/*.html', './src/**/*.vue', './src/**/*.jsx'],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    })
  ]
}
`

var tailwindConfig =
`module.exports = {
  theme: {
    extend: {}
  },
  variants: {},
  plugins: []
}
`

var style =
`@tailwind base;
@tailwind components;
@tailwind utilities;
`

var index =
`import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Express from 'express'
import fs from 'fs'

const routes = {
  '/': 'page',
  '/lore': 'lore',
}

const Page = (content) =>
  \`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <link rel="stylesheet" href="style.css" media="all">
    <title></title>
  </head>
  <body>
    \${content}
  </body>
  </html>\`

class Index extends React.Component {
  render() {
    return <div class="bg-gray-100 text-gray-900 antialiased min-h-screen">
      <nav class="p-5 bg-gray-900 text-gray-100 flex justify-between text-lg shadow-md">
        <div>Dawn of a new site</div>
        <div>some menu items</div>
      </nav>
      <div class="m-5">Welcome.</div>
    </div>
  }
}

var staticContent = ReactDOMServer.renderToStaticMarkup(<Index/>)

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public')
}
fs.writeFileSync('public/index.html', Page(staticContent))
`

// }}}

// seems to print path of the index.js that is being executed..
// console.log(path.dirname(__filename))

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

write('package.json', projectDirectory, packageJson)
write('postcss.config.json', projectDirectory, postcssConfig)
write('tailwind.config.json', projectDirectory, tailwindConfig)
write('src/style.css', projectDirectory, tailwindConfig)
write('src/index.js', projectDirectory, index)

// TODO src/index.js
// TODO initial yarn dev/build commands
//  - build must:
//    - postcss PRODUCTION + gen static files
// TODO provide basic route object
// TODO check if yarn is on path
// TODO run yarn
// TODO check if git is on path
// TODO git init
// TODO write initial commit
// TODO resolve invalid DOM element class warning (from babel?)
//
// TODO potentially move index.js file to file from var with:
// console.log(path.dirname('./'))
