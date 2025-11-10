/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Effect, ValueKind} from '..';
import {TypeConfig} from './TypeSchema';

/**
 * Default Module Type Provider - Teaching React Compiler about Incompatible APIs
 * 
 * ## Purpose
 * 
 * This module provides type information for third-party libraries that have APIs incompatible
 * with memoization. It enables React Compiler to detect and warn about these APIs at compile time.
 * 
 * ## Background: The Memoization Problem
 * 
 * Libraries developed before we officially documented the [Rules of React](https://react.dev/reference/rules)
 * implement APIs which cannot be memoized safely, either via manual or automatic memoization.
 *
 * Any non-hook API that is designed to be called during render (not events/effects) should be safe to memoize:
 *
 * ```js
 * function Component() {
 *   const {someFunction} = useLibrary();
 *   // it should always be safe to memoize functions like this
 *   const result = useMemo(() => someFunction(), [someFunction]);
 * }
 * ```
 *
 * However, some APIs implement "interior mutability" — mutating values rather than copying into a new value
 * and setting state with the new value. Such functions (`someFunction()` in the example) could return different
 * values even though the function itself is the same object. This breaks memoization, since React relies on
 * the outer object (or function) changing if part of its value has changed.
 * 
 * ## What is Interior Mutability?
 * 
 * Interior mutability means a function or object maintains internal mutable state that can change
 * between calls, even though the function/object reference remains the same:
 * 
 * ```js
 * const { watch } = useForm(); // watch function reference stays the same
 * 
 * // But watch() reads from internal mutable state:
 * const value1 = watch('name'); // Returns "John"
 * // ... form state changes internally ...
 * const value2 = watch('name'); // Returns "Jane"
 * // Problem: watch === watch (same reference) but different results!
 * ```
 * 
 * This violates React's assumption that:
 * - If a function reference doesn't change, its return value for the same inputs shouldn't change
 * - Memoization relies on this assumption
 * 
 * ## Current Limitation: Custom Hooks
 * 
 * ⚠️ **Important**: Currently, warnings are only shown when these APIs are used directly in components.
 * When used inside custom hooks, the warnings are not surfaced, leading to silent failures.
 * 
 * ```js
 * // ❌ Silent failure - no warning shown
 * function useMyForm() {
 *   const { watch } = useForm(); // Incompatible API
 *   return watch; // Will silently fail to memoize
 * }
 * 
 * // ✅ Shows warning - but works
 * function Component() {
 *   const { watch } = useForm(); // Warning shown here
 *   return <div>{watch('name')}</div>;
 * }
 * ```
 * 
 * See `ValidateNoIncompatibleAPIsInHooks` for the solution.
 *
 * ## Developer Impact
 * 
 * Given that we didn't have the Rules of React precisely documented prior to the introduction of React compiler,
 * it's understandable that some libraries accidentally shipped APIs that break this rule. However, developers
 * can easily run into pitfalls with these APIs. They may manually memoize them, which can break their app. Or
 * they may try using React Compiler, and think that the compiler has broken their code.
 *
 * To help ensure that developers can successfully use the compiler with existing code, this file teaches the
 * compiler about specific APIs that are known to be incompatible with memoization. We've tried to be as precise
 * as possible.
 * 
 * ## How to Add New Incompatible APIs
 * 
 * 1. Add a new case in the switch statement for the module name
 * 2. Define the API structure with `knownIncompatible` field
 * 3. Provide a clear error message explaining why it's incompatible
 * 4. Be as precise as possible (mark only the specific incompatible parts)
 * 
 * Example:
 * ```typescript
 * case 'some-library': {
 *   return {
 *     kind: 'object',
 *     properties: {
 *       useExample: {
 *         kind: 'hook',
 *         returnType: {
 *           kind: 'object',
 *           properties: {
 *             problematicMethod: {
 *               kind: 'function',
 *               // ... other properties ...
 *               knownIncompatible: 'Clear explanation of why this cannot be memoized',
 *             },
 *           },
 *         },
 *       },
 *     },
 *   };
 * }
 * ```
 *
 * ## Collaboration with Library Authors
 * 
 * The React team is open to collaborating with library authors to help develop compatible versions of these APIs,
 * and we have already reached out to the teams who own any API listed here to ensure they are aware of the issue.
 * 
 * @param moduleName - The npm package name (e.g., 'react-hook-form')
 * @returns Type configuration for the module, or null if not a known incompatible module
 */
export function defaultModuleTypeProvider(
  moduleName: string,
): TypeConfig | null {
  switch (moduleName) {
    case 'react-hook-form': {
      return {
        kind: 'object',
        properties: {
          useForm: {
            kind: 'hook',
            returnType: {
              kind: 'object',
              properties: {
                // Only the `watch()` function returned by react-hook-form's `useForm()` API is incompatible
                watch: {
                  kind: 'function',
                  positionalParams: [],
                  restParam: Effect.Read,
                  calleeEffect: Effect.Read,
                  returnType: {kind: 'type', name: 'Any'},
                  returnValueKind: ValueKind.Mutable,
                  knownIncompatible: `React Hook Form's \`useForm()\` API returns a \`watch()\` function which cannot be memoized safely.`,
                },
              },
            },
          },
        },
      };
    }
    case '@tanstack/react-table': {
      return {
        kind: 'object',
        properties: {
          /*
           * Many of the properties of `useReactTable()`'s return value are incompatible, so we mark the entire hook
           * as incompatible
           */
          useReactTable: {
            kind: 'hook',
            positionalParams: [],
            restParam: Effect.Read,
            returnType: {kind: 'type', name: 'Any'},
            knownIncompatible: `TanStack Table's \`useReactTable()\` API returns functions that cannot be memoized safely`,
          },
        },
      };
    }
    case '@tanstack/react-virtual': {
      return {
        kind: 'object',
        properties: {
          /*
           * Many of the properties of `useVirtualizer()`'s return value are incompatible, so we mark the entire hook
           * as incompatible
           */
          useVirtualizer: {
            kind: 'hook',
            positionalParams: [],
            restParam: Effect.Read,
            returnType: {kind: 'type', name: 'Any'},
            knownIncompatible: `TanStack Virtual's \`useVirtualizer()\` API returns functions that cannot be memoized safely`,
          },
        },
      };
    }
    case 'ReactCompilerKnownIncompatibleTest': {
      // Test module for incompatible API validation
      return {
        kind: 'object',
        properties: {
          useKnownIncompatible: {
            kind: 'hook',
            positionalParams: [],
            restParam: Effect.Read,
            returnType: {kind: 'type', name: 'Any'},
            knownIncompatible: `useKnownIncompatible is known to be incompatible`,
          },
          useKnownIncompatibleIndirect: {
            kind: 'hook',
            returnType: {
              kind: 'object',
              properties: {
                incompatibleMethod: {
                  kind: 'function',
                  positionalParams: [],
                  restParam: Effect.Read,
                  calleeEffect: Effect.Read,
                  returnType: {kind: 'type', name: 'Any'},
                  returnValueKind: ValueKind.Mutable,
                  knownIncompatible: `incompatibleMethod cannot be memoized`,
                },
              },
            },
          },
        },
      };
    }
  }
  return null;
}
