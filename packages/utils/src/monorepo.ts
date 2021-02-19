import path from 'path'

import { tryGlob, tryRequirePkg } from './helpers'

const pkg =
  tryRequirePkg<{ workspaces?: string[] }>(path.resolve('package.json')) || {}

const lernaConfig =
  tryRequirePkg<{ packages?: string[] }>(path.resolve('lerna.json')) || {}

const pkgsPath = lernaConfig.packages || pkg.workspaces || []

export const isMonorepo = Array.isArray(pkgsPath) && pkgsPath.length > 0

export const monorepoPkgs = isMonorepo ? tryGlob(pkgsPath) : []
