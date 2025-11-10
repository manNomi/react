/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  CompilerError,
  CompilerErrorDetail,
  ErrorCategory,
} from '../CompilerError';
import {HIRFunction} from '../HIR/HIR';
import {eachInstructionLValue} from '../HIR/visitors';

/*
 * Validates that known incompatible APIs are not used inside custom hooks.
 *
 * Some third-party APIs cannot be safely memoized because they implement "interior mutability"
 * (they return different values even though the function/object reference stays the same).
 *
 * When these APIs are used directly in components, the compiler can detect them and show warnings.
 * However, when they're wrapped in custom hooks, the warnings are not surfaced, leading to
 * silent failures that are difficult to debug.
 *
 * This validation enforces that incompatible APIs must be used directly in components,
 * not wrapped in custom hooks. This prevents silent failures by failing at compile time.
 */
export function validateNoIncompatibleAPIsInHooks(fn: HIRFunction): void {
  /*
   * Only validate custom hooks (functions starting with 'use').
   * Skip components and regular functions.
   */
  const functionName = fn.id;
  if (functionName == null || !functionName.startsWith('use')) {
    return;
  }

  // Skip built-in React hooks
  const reactBuiltInHooks = new Set([
    'useState',
    'useEffect',
    'useContext',
    'useReducer',
    'useCallback',
    'useMemo',
    'useRef',
    'useImperativeHandle',
    'useLayoutEffect',
    'useDebugValue',
    'useDeferredValue',
    'useTransition',
    'useId',
    'useSyncExternalStore',
    'useInsertionEffect',
    'useOptimistic',
    'useFormStatus',
    'useFormState',
    'useActionState',
  ]);

  if (reactBuiltInHooks.has(functionName)) {
    return;
  }

  for (const [, block] of fn.body.blocks) {
    for (const instr of block.instructions) {
      const {value} = instr;

      switch (value.kind) {
        case 'CallExpression':
        case 'MethodCall': {
          const callee =
            value.kind === 'CallExpression' ? value.callee : value.property;
          const calleeType = callee.identifier.type;

          if (calleeType?.kind === 'Function') {
            const signature = fn.env.getFunctionSignature(calleeType);

            if (signature != null && signature.knownIncompatible != null) {
              const errors = new CompilerError();
              errors.pushErrorDetail(
                new CompilerErrorDetail({
                  category: ErrorCategory.IncompatibleLibrary,
                  reason: 'Incompatible API used in custom hook',
                  description:
                    `Custom hook \`${functionName}()\` uses an incompatible API. ${signature.knownIncompatible}\n\n` +
                    `This API should be used directly in components, not wrapped in custom hooks. ` +
                    `When used in a custom hook, React Compiler cannot optimize it properly, ` +
                    `leading to silent failures in production`,
                  loc: instr.loc,
                  suggestions: null,
                }),
              );
              throw errors;
            }
          }
          break;
        }
        case 'PropertyLoad':
        case 'Destructure': {
          // Note: PropertyLoad and Destructure detection are currently not implemented
          // due to type inference limitations. When accessing properties like:
          //   const result = useKnownIncompatibleIndirect();
          //   return result.incompatibleMethod;
          //
          // The objectType refers to the variable's type, not the source hook's return type.
          // getPropertyType() returns null because the type information chain is incomplete
          // at this validation phase.
          //
          // Proper implementation would require:
          // 1. Data flow analysis to trace variables back to their source
          // 2. Running after InferMutationAliasingEffects (but that causes other issues)
          // 3. Or integrating into InferMutationAliasingEffects itself
          //
          // For now, we only detect direct CallExpression usage, which catches the most
          // common cases where hooks are called directly in custom hooks.
          break;
        }
      }
    }
  }
}
