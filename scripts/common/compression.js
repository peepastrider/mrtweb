const schema = [
  // upgrades
  ['block', 'uint2', 1],
  ['internals', 'uint2', 1],
  ['brakes', 'uint2', 1],
  ['ecu', 'uint2', 1],
  ['weightreduction', 'uint2', 1],
  ['exhaust', 'uint2', 1],
  ['intake', 'uint2', 1],
  ['injectors', 'uint2', 1],
  ['forcedinduction', 'uint2', 1],
  ['turbo', 'uint2', 1],
  ['supercharger', 'uint2', 1],
  ['sequential', 'uint2', 1],
  // tuning
  ['brakebias', 'uint10', 10], // [0.0, 100.0]
  ['aggressiveness', 'uint9', 1], // [10, 250]
  ['ratio', 'uint9', 10], // [14.0, 30.0]
  ['fdamp', 'uint9', 1], // [50, 500]
  ['rdamp', 'uint9', 1],
  ['fstiff', 'uint14', 1], // [1000, 15000]
  ['rstiff', 'uint14', 1],
  ['fheight', 'int8', 100], // [-0.50, 0.50]
  ['rheight', 'int8', 100],
  ['fcamber', 'int9', 10], // [-20.0, 0.0]
  ['rcamber', 'int9', 10], 
  ['foffset', 'int8', 100], // [-0.50, 0.50]
  ['roffset', 'int8', 100],
  // stupid gears
  ['finaldrive', 'uint10', 100], // [0.10, 6.50]
  ['gear1', 'uint10', 100],
  ['gear2', 'uint10', 100],
  ['gear3', 'uint10', 100],
  ['gear4', 'uint10', 100],
  ['gear5', 'uint10', 100],
  ['gear6', 'uint10', 100],
  ['gear7', 'uint10', 100],
  ['gear8', 'uint10', 100],
  ['gear9', 'uint10', 100],
  ['gear10', 'uint10', 100],
];

const forcedinduction = ['stock', 'turbo', 'sequential', 'supercharger'];

// Base 64 alphabet
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

const bsLength = 258;

function debug() {
  let n = 0;
  for (const [x,format,y] of schema)
    n += getLength(format);
  console.log(`Total format length: ${n}`);
}

function debug2(tune) {
  console.log("==========[Start Debug]=========");
  console.log(tune);
  let bitstring = tuneToBinary(tune);
  console.log(bitstring);
  let code = binaryToCode(bitstring);
  console.log(code);
  let bitstring2 = codeToBinary(code);
  console.log(bitstring2);
  if (bitstring == bitstring2)
    console.log(`Bitstrings match`);
  else
    for (let i = 0; i < bsLength; i++)
      if (bitstring[i] != bitstring2[i])
        console.log(`Incorrect: bit ${i}`);
  let tune2 = binaryToTune(bitstring2);
  console.log(tune2);
  console.log("==========[End Debug]=========");
}

function getLength(format) {
  //console.log(Number(format.split('t')[1]));
  return Number(format.split('t')[1]);
}
// Returns the amount of bits necessary
function getLength2(format) {
  switch(format) {
    case 'uint2':
      return 2;
    case 'uint8':
      return 8;
    case 'uint16': 
    case 'int16':
      return 16;
    default:
      console.error(`Unknown format. Add '${format}' to compression.js/getLength().`);
      return -1;
  }
}

// --------------

export function compressTune(tune) {
  return binaryToCode(tuneToBinary(tune));
}

export function decompressTune(tuneCode) {
  return binaryToTune(codeToBinary(tuneCode));
}

// ---------------

function tuneToBinary(tune) {
  let result = '';
  for (const [key,format,offset] of schema) {
    if (key == 'forcedinduction') {
      result += toBitString(forcedinduction.indexOf(tune[key]),2);
      //console.log(`${key}: ${tune[key]} in ${format} (${toBitString(forcedinduction.indexOf(tune[key]),2)})`); 
    }
    else {
      const value = tune[key]*offset;
      const n = getLength(format);
      //console.log(`${key}: ${value} in ${format} (${toBitString(value,n)})`);
      result += toBitString(value, n);
    }
  }
  return result;
  // result.length = 224
}

function binaryToCode(bitstring) {
  if (bitstring.length !== bsLength)
    throw new Error(`Tunecode must be a ${bsLength}-bit string. Please contact developer if you see this.`);
  let result = '';
  let chunkSize = 6;
  for (let i = 0; i < bsLength; i += chunkSize) {
    const bits = bitstring.slice(i, i+chunkSize);
    const chunkValue = parseInt(bits, 2);
    result += alphabet[chunkValue];
  }
  return result;
}

function toBitString(number, n) {
  let intValue = Math.round(number);
  // Step 2: Define the n-bit signed range and modulus
  const modulus = 1 << n;              // 2^n (total range)
  const maxPositive = (1 << (n - 1)) - 1; // 2^(n-1) - 1 (e.g., 7 for 4 bits)
  const minNegative = -(1 << (n - 1));    // -2^(n-1) (e.g., -8 for 4 bits)

  // Step 3: Wrap the value into the n-bit signed range
  let wrappedValue = intValue % modulus;
  if (wrappedValue > maxPositive) 
    wrappedValue -= modulus; 
  else if (wrappedValue < minNegative) 
    wrappedValue += modulus;  

  // Step 4: Convert to two’s complement binary string
  let binary;
  if (wrappedValue >= 0)
    binary = wrappedValue.toString(2); 
  else {
    // For negative numbers, compute two’s complement within n bits
    const absValue = -wrappedValue;
    binary = ((~absValue + 1) & (modulus - 1)).toString(2);
  }

  // Step 5: Pad to n bits and return
  return binary.padStart(n, "0");
}


function binaryToTune(bitstring) {
  let result = {};
  let index = 0;
  for(const[key,format,offset] of schema) {
    const n = getLength(format);
    let max = index + n;
    const bits = bitstring.slice(index, max);
    if (key == 'forcedinduction')
      result[key] = forcedinduction[parseInt(bits, 2)/offset];
    else if (format[0] !== 'u')
      result[key] = parseSignedBinary(n,bits)/offset;
    else
      result[key] = parseInt(bits, 2)/offset;
    //console.log(`${key}: ${bits} (${result[key]})`);
    index = max;
  }
  return result;
}

function codeToBinary(tuneCode) {
  let result = ''
  for (let i = 0; i < (bsLength/6); i++) {
    const val = tuneCode[i];
    let chunkValue = alphabet.indexOf(val);
    if (chunkValue === -1)
      throw new Error(`Couldn't assign a value to ${val}`);
    //console.log(`${val} in binary: ${chunkValue.toString(2).padStart(6, "0")}`);
    result += chunkValue.toString(2).padStart(6, "0");
  }
  return result;
}

// this function sucks
function parseSignedBinary(n,binaryString) {
  const paddedBinary = binaryString.padStart(n, "0").slice(-n); // Normalize to n bits

  // Convert to unsigned integer
  const unsignedValue = parseInt(paddedBinary, 2);

  // Check if it's negative (MSB is 1)
  if (paddedBinary[0] === "1") {
    // Two’s complement: subtract 2^n and adjust
    const modulus = 1 << n; // 2^n (65536 for 16-bit)
    return unsignedValue - modulus;
  }

  // Positive number, return as-is
  return unsignedValue;
}