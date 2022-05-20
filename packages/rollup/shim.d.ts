declare module 'unassert' {
  export interface UnassertOptions {
    assertionPatterns?: string[]
    requirePatterns?: string[]
    importPatterns?: string[]
  }

  export const defaultOptions: () => Required<UnassertOptions>
}

declare module 'rollup-plugin-unassert' {
  import { FilterPattern } from '@rollup/pluginutils'
  import { Plugin } from 'rollup'
  import { UnassertOptions as _UnassertOptions } from 'unassert'

  export interface UnassertOptions extends _UnassertOptions {
    sourcemap?: boolean
    include?: FilterPattern
    exclude?: FilterPattern
  }

  const unassert: (options?: UnassertOptions) => Plugin

  export default unassert
}
