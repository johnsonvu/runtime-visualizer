const fs = require('fs');
const inputAnalyzer = require('./analyze/inputAnalysis.js');
const runtimeAnalyzer = require('./analyze/runtimeAnalysis.js');
const memoryAnalyzer = require('./analyze/memoryAnalysis');

var subFolderDict = {};
// invokes runtime and memory analysis and outputs their results
const doAnalysis = (testCommand) => {
    // 1 is for
    let pythonFiles = findPythonFiles(__dirname + '/analyze/repo', 1);
    // let inputInfo = inputAnalyzer.getInputInfo(pythonFiles);
    let runtimeResult =  runtimeAnalyzer.analyzeRuntime(pythonFiles, subFolderDict, testCommand);
    //let memoryResult = memoryAnalyzer.analyzeMemoryUsage(pythonFiles, testCommand);
    // console.log(memoryResult);
    console.log("Analysis completed.");
    return [null, memoryResult];
}

function findPythonFiles(directory, level){
    let pythonFiles = [];
    fs.readdirSync(directory)
        .forEach((fileName) => {
            let fullFilePath = directory + '/' + fileName
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
