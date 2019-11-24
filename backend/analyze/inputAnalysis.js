const fs = require('fs');

function getInputInfo(pythonFiles){
    pythonFiles.map(pythonFile => extractInfo(pythonFile));
    return null;
}

function extractInfo(pythonFile){
    console.log('Analyzing inputs in ' + pythonFile + '\n');
    let lines = fs.readFileSync(pythonFile, 'utf8').split('\n').map((line)=>line.replace(/    /g, '\t'));
}

module.exports = { getInputInfo: getInputInfo };
