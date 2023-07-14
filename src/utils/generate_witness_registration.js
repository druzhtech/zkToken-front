const wc = require('./witness_calculator.js')
const { readFileSync, writeFile } = require('fs')

WebAssembly.instantiateStreaming(fetch("registration.wasm"), importObject).then(
  (obj) => {
    // Call an exported function:
    obj.instance.exports.exported_func();

    // or access the buffer contents of an exported memory:
    const i32 = new Uint32Array(obj.instance.exports.memory.buffer);

    // or access the elements of an exported table:
    const table = obj.instance.exports.table;
    console.log(table.get(0)());
  },
);

const input = JSON.parse(readFileSync(process.argv[3], 'utf8'))

const buffer = readFileSync(process.argv[2])

wc(buffer).then(async (witnessCalculator) => {
  //    const w= await witnessCalculator.calculateWitness(input,0);
  //    for (let i=0; i< w.length; i++){
  //	console.log(w[i]);
  //    }
  const buff = await witnessCalculator.calculateWTNSBin(input, 0)
  writeFile(process.argv[4], buff, function (err) {
    if (err) throw err
  })
})

