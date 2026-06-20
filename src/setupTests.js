// jest-dom adds custom matchers like toBeInTheDocument(), toHaveValue(), etc.
// CRA automatically loads this file before each test file.
import '@testing-library/jest-dom';

// react-router v7 references TextEncoder/TextDecoder, which CRA's jsdom test
// environment does not expose by default. Polyfill them from Node's util.
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}
