// @validateNoIncompatibleAPIsInHooks
import {useKnownIncompatibleIndirect} from 'ReactCompilerKnownIncompatibleTest';

function useMyForm() {
  const {incompatibleMethod} = useKnownIncompatibleIndirect();
  return incompatibleMethod;
}
