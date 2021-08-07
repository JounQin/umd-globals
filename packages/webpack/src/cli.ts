#!/usr/bin/env node
import { createRequire } from 'module'

import { __DEV__, openBrowser } from '@pkgr/utils'
import { program } from 'commander'
import debug from 'debug'
// @ts-expect-error
import { JSOX } from 'jsox'
import { pick } from 'lodash-es'
import webpack, { Compiler, StatsCompilation } from 'webpack'
import WebpackDevServer from 'webpack-dev-server'

import config, { ConfigOptions } from './config.js'

const info = debug('w:info')

const cjsRequire =
  typeof require === 'undefined' ? createRequire(import.meta.url) : require

program
  .version((cjsRequire('../package.json') as { version: string }).version)
  .option('-e, --entry <filename>', 'input entry file path')
  .option(
    '-t, --type <enum>',
    'app type, could be angular, react, vue currently',
  )
  .option('-o, --output-dir [output]', 'output destination directory')
  .option(
    '-x, --externals <JSOX>',
    'extra external packages, peerDependencies, and dependencies for node by default',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    JSOX.parse,
  )
  .option(
    '-g, --globals <JSOX>',
    'JSON string to be parsed as umd globals map',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    JSOX.parse,
  )
  .option(
    '-c, --copies <JSOX>',
    'targets setting or whole CopyOptions for copy-webpack-plugin, could be array or object',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    JSOX.parse,
  )
  .option('--preferCssModules <boolean>', 'prefer css modules or global styles')
  .option(
    '-p, --prod [boolean]',
    'whether to enable production(.min.js for lib) bundle together at the same time',
  )
  .parse(process.argv)

const options = pick(
  program.opts(),
  'entry',
  'type',
  'outputDir',
  'externals',
  'globals',
  'copies',
  'preferCssModules',
  'prod',
) as ConfigOptions

info('options: %O', options)

const DEFAULT_PROT = 8080
const port = Number(process.env.PORT) || DEFAULT_PROT

const startWatcher = (compiler: Compiler) => {
  const devServer = new WebpackDevServer(compiler, compiler.options.devServer)
  devServer.listen(port)
  let isFirstCompile = true
  compiler.hooks.done.tap('@pkgr/webpack watcher', () => {
    if (!isFirstCompile) {
      return
    }
    isFirstCompile = false
    openBrowser(`http://localhost:${port}`)
  })
}

const webpackConfig = config(options)

const compiler = webpack(webpackConfig)

const handlerError = (error: Error | StatsCompilation) => {
  console.error(error)
  process.exitCode = 1
}

if (__DEV__ && !options.prod) {
  startWatcher(compiler)
} else {
  compiler.run((error, stats) => {
    if (error) {
      return handlerError(error)
    }

    if (stats?.hasErrors()) {
      return handlerError(stats.toJson())
    }
  })
}
