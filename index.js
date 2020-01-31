#!/usr/bin/env node

// TODO make nx init.js build arg console.log/build
// TODO ensure build step uses production flag.

const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const process = require('process')

var args = process.argv.slice(2)
var projectName = 'new-site'

if (args.length != 0) {
  projectName = args[0]
}

console.log(chalk.blue('==>') + ' nx: creating new site, ' + projectName)

var dir = process.cwd() + '/' + projectName

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
} else {
  console.error(chalk.red('! ') + 'the directory, ' + dir + ' already exists')
  process.exit(0)
}

if (!fs.existsSync(dir + '/src')) fs.mkdirSync(dir + '/src')

// Templates {{{

var packageJson =
`{
  "name": "${projectName}",
  "version": "1.0.0",
  "main": "index.js",
  "license": "MIT",
  "scripts": {
    "build": "babel-node init.js build",
    "build:css": "postcss ./src/style.css -o ./public/style.css",
    "dev": "npm start",
    "ensure:css": "[ ! -f ./public/style.css ] && npm run build:css",
    "ensure:lib": "[ ! -d node_modules ] && npm install --prefer-offline; true",
    "prestart": "npm run ensure:lib; npm run ensure:css",
    "start": "[ ! -d node_modules ] && npm i; babel-node init.js"
  },
  "dependencies": {
    "@babel/core": "^7.8.3",
    "@babel/node": "^7.8.3",
    "@babel/preset-env": "^7.8.3",
    "@babel/preset-react": "^7.8.3",
    "@babel/runtime": "^7.8.3",
    "@fullhuman/postcss-purgecss": "^2.0.5",
    "autoprefixer": "^9.7.4",
    "chokidar": "^3.3.1",
    "cssnano": "^4.1.10",
    "express": "^4.17.1",
    "postcss": "^7.0.26",
    "postcss-cli": "^7.1.0",
    "react": "^16.12.0",
    "react-dom": "^16.12.0",
    "tailwindcss": "^1.1.4",
    "ws": "^7.2.1"
  },
  "babel": {
    "presets": [
      "@babel/preset-env",
      "@babel/preset-react"
    ]
  }
}`

var init =
`import express from 'express'
import fs from 'fs'
import WebSocket from 'ws'
import chokidar from 'chokidar'
import process from 'process'

var args = process.argv.splice(2)

var devServer = () => {
  var server = express()
  var reloadingSocket = new WebSocket.Server({port: 7777})
  var fileWatcher = chokidar.watch('./src')

  reloadingSocket.on('connection', () => console.log('browser connected'))
  fileWatcher.on('ready', () => {
    fileWatcher.on('all', () => {
      console.log('file changed')
      Object.keys(require.cache).forEach((id) => {
        if (/[\\\/\\\\]src[\\\/\\\\]/.test(id)) delete require.cache[id]
        reloadingSocket.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send('reload!')
          }
        })
      })
    })
  })

  server.get('/', (req, res, next) => require('./src/index')(req, res, next))
  server.get('/style.css', (req, res) =>
    res.type('css') && res.sendFile(__dirname + '/public/style.css'))
  server.get('/status.json', (req, res, next) => res.json({"status": "started"}))
  server.listen(8080, '0.0.0.0', () => console.log('server started on 8080'))
}

var build = () => {
  console.log('building content.. writing to ./public')
  if (!fs.existsSync('./public')) fs.mkdirSync('./public')
  fs.writeFileSync('public/index.html', 'something.')
}

if (args.length != 0 && args[0] === 'build') {
  build()
} else {
  devServer()
}
`

var postcssConfig =
`const purgecss = require('@fullhuman/postcss-purgecss')
const cssnano = require('cssnano')

module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    process.env.NODE_ENV === 'production'
      ? cssnano({ preset: 'default' })
      : null,
    process.env.NODE_ENV === 'production' && purgecss({
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

const Sun = () =>
 <svg class="inline-block h-5 w-5 fill-current text-gray-400">
  <circle cx="10" cy="10" r="10" strokeWidth="2"/>
</svg> 

const reloadScript =
\`<script>
  var port = 7777
  var ws = new WebSocket(\\\`ws://\\\${window.location.hostname}:\\\${port}\\\`)
  ws.onopen = function() {
    console.log(\\\`connected to the development server: \\\${window.location.hostname}:\\\${port}\\\`)
  }
  ws.onmessage = function() {
    console.log('refreshing page')
    ws.close()
    location.reload()
  }
</script>\`

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
    \${reloadScript}
  </body>
  </html>\`

class Index extends React.Component {
  render() {
    return <div class="bg-gray-100 text-gray-900 antialiased min-h-screen">
      <nav class="p-5 bg-gray-900 text-gray-100 flex justify-between text-lg shadow-md">
        <div class="flex items-center">
          <Sun/><span class="ml-2">Dawn of a new site</span>
        </div>
        <div>some menu items</div>
      </nav>
      <div class="m-5">Welcome.</div>
    </div>
  }
}

var staticContent = ReactDOMServer.renderToStaticMarkup(<Index/>)
module.exports = (req, res) => res.send(Page(staticContent)) 
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

console.log(dir)

write('init.js', dir, init)
write('package.json', dir, packageJson)
write('postcss.config.js', dir, postcssConfig)
write('tailwind.config.js', dir, tailwindConfig)
write('src/style.css', dir, style)
write('src/index.js', dir, index)

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
// TODO logging timestamps for server?
// console.log(path.dirname('./'))
//
// # Live reloading strategies
//
// 1. nodemon/live-server
//    we know it works.. bit manual + uses 2 globally installed utils but.. it works.
//
//  2. filewatch and reload?
//     a. not sure how this looks.. chokidar => reload .js file and => render all the files?
//
//  3. Express/chokidar/middleware?
//     web sockets to the browser and initiates refresh
//     - SSE (server sent events?)
//     - websockets? ws npm looks nice.
//     - WebSocket is provided in firefox.. what is the official name for this?
