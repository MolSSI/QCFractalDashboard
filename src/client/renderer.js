// IPC Test C.
let input = document.querySelector('#input')
let result = document.querySelector('#result')
let btn = document.querySelector('#btn')


function sendToPython() {

    // IPC Test A..
    var python = require('child_process').spawn('python', ['../server/calc.py', input.value]);

    // IPC Test B.
    var { PythonShell } = require('python-shell');

    let options = {
      mode: 'text',
      // args: [input.value]   // comment out for IPC Text C.
    };

    // IPC Test A.
    python.stdout.on('data', function(data) {
        console.log("Python response: ", data.toString('utf8'));
        result.textContent = data.toString('utf8');
    });

    python.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    python.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

    // IPC Test B.
    PythonShell.run('../server/calc.py', options, function (err, results) {
      if (err) throw err;
      // results is an array consisting of messages colected during execution.
      console.log('results: ', results);
      // result.textCOntent =results[0];   // comment out for IPC Text C.
    });
}

// IPC Text C.
function onClick() {
  fetch(`http://127.0.0.1:5001/${input.value}`).then((data) => {
    return data.text();
  }).then((text) => {
    console.log("data: ", text);
    result.textContent = text;
  }).catch(e => {
    console.log(e);
  })
}
sendToPython();


btn.addEventListener('click', () => {
    // sendToPython();   // comment out for IPC Text C.

    // IPC Test C.
    onclick();
});

btn.dispatchEvent(new Event('click'));
