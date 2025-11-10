// Simple test config for React Compiler
module.exports = {
  environment: {
    validateBlocklistedImports: [],
  },
  logger: {
    logEvent(filename, event) {
      if (event.kind === 'CompileError') {
        console.log('\n=== Compilation Error ===');
        console.log('File:', filename);
        console.log('Reason:', event.detail.reason);
        console.log('Description:', event.detail.description);
        console.log('========================\n');
      }
    },
  },
};

