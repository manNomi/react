// @validateNoIncompatibleAPIsInHooks
import {useKnownIncompatible} from 'ReactCompilerKnownIncompatibleTest';

function useMyCustomHook() {
  const data = useKnownIncompatible();
  return data;
}
