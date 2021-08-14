import path from 'path';
import moduleAlias from 'module-alias';

const pathAliases = {
  '~': path.join(__dirname, '..'),
  '@controllers': path.join(__dirname, '..', 'controllers'),
  '@errors': path.join(__dirname, '..', 'errors'),
  '@helpers': path.join(__dirname, '..', 'helpers'),
  '@lib': path.join(__dirname, '..', 'lib'),
  '@utils': path.join(__dirname, '..', 'utils'),
  '@constants': path.join(__dirname, '..', 'constants'),
  '@config': path.join(__dirname, '..', 'config'),
};

// IIFE to add all path aliases
(() => {
  moduleAlias.addAliases(pathAliases);
})();
