const fs = require('fs');
const inputAnalyzer = require('./analyze/inputAnalysis.js');
const runtimeAnalyzer = require('./analyze/runtimeAnalysis.js');

const injectPythonCode = () => {
    let pythonFiles = findPythonFiles(__dirname + '/analyze');
    let inputInfo = inputAnalyzer.getInputInfo(pythonFiles);
    // runtimeAnalyzer.analyzeRuntime(pythonFiles, inputInfo);
}

function findPythonFiles(directory){
    let pythonFiles = [];
    fs.readdirSync(directory)
        .forEach((fileName) => {
            let fullFilePath = directory + '/' + fileName
            if(fullFilePath.endsWith('.py')){
                pythonFiles.push(fullFilePath);
            }
            else if(fs.statSync(fullFilePath).isDirectory()){
                let subPythonFiles = findPythonFiles(fullFilePath);
                pythonFiles = pythonFiles.concat(subPythonFiles);
            }
        });

    return pythonFiles;
}

module.exports = { injectPythonCode: injectPythonCode };
