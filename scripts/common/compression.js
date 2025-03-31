export function compressTune(tune) {
  const jsonString = JSON.stringify(tune);
  const compressed = btoa(jsonString);
  return compressed;
}

export function decompressTune(tuneCode) {
  const jsonString = atob(tuneCode);   
  const tune = JSON.parse(jsonString);
  return tune;
}

const schema = [
  // upgrades
  ['block', 'uint2'],
  ['internals', 'uint2'],
  ['brakes', 'uint2'],
  ['ecu', 'uint2'],
  ['weightreduction', 'uint2'],
  ['exhaust', 'uint2'],
  ['intake', 'uint2'],
  ['injectors', 'uint2'],
  ['forcedinduction', 'uint2'],
  ['turbo', 'uint2'],
  ['supercharger', 'uint2'],
  ['sequential', 'uint2'],
  // tuning
  ['brakebias', 'uint8'],
  ['aggressiveness', 'uint8'],
  ['ratio', 'uint8'],
  ['fdamp', 'uint16'],
  ['fstiff', 'uint16'],
  ['rdamp', 'uint16'],
  ['rstiff', 'uint16'],
  ['finaldrive', 'float16'],
  /// dunno what to do with gears
  ['fheight', 'float16'],
  ['fcamber', 'float16'],
  ['rheight', 'float16'],
  ['rcamber', 'float16'],
  ['foffset', 'float16'],
  ['roffset', 'float16'],
];

// Returns the amount of bits necessary
function getLength(format) {
  switch(format) {
    case 'uint2':
      return 2;
    case 'uint8':
      return 8;
    case 'uint16': 
    case 'float16':
      return 16;
    case 'string':
      return 256;
    default:
      console.error(`Unknown format. Add '${format}' to compression.js/getLength().`);
      return -1;
  }
}

export function tuneToBinary(tune) {
  let result = '';
  for (const [key,format] of schema) {
    //console.log(`${result}, ${value}`);
    const value = tune[key];
    const n = getLength(format);
    result += toBitString(value, n);
  }
  return result;
  // result.length = 224
}

function toBitString(number, n) {
  let tail = (number >>> 0).toString(2);
  let result = '';
  for (let i = 0; i < (n - tail.length);i++)
    result += '0';
  result += tail;
  return result;
}