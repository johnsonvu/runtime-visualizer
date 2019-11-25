const fs = require('fs');
const inputAnalyzer = require('./analyze/inputAnalysis.js');
const runtimeAnalyzer = require('./analyze/runtimeAnalysis.js');

var subFolderDict = {};

const doAnalysis = () => {
    let pythonFiles = findPythonFiles(__dirname + '/analyze', 0);
    // let inputInfo = inputAnalyzer.getInputInfo(pythonFiles);
    runtimeAnalyzer.analyzeRuntime(pythonFiles, subFolderDict);
}

function findPythonFiles(directory, level){
    let pythonFiles = [];
    fs.readdirSync(directory)
        .forEach((fileName) => {
            let fullFilePath = directory + '/' + fileName;
            if(fullFilePath.endsWith('.py')){
                pythonFiles.push(fullFilePath);
                subFolderDict[fullFilePath] = level;
            }
            else if(fs.statSync(fullFilePath).isDirectory()){
                let subPythonFiles = findPythonFiles(fullFilePath, level+1);
                pythonFiles = pythonFiles.concat(subPythonFiles);
            }
        });

    return pythonFiles;
}

module.exports = doAnalysis;
