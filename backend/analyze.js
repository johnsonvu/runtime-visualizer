const fs = require('fs');
const callGraphGenerator = require('./analyze/callGraph.js');
const runtimeAnalyzer = require('./analyze/runtimeAnalysis.js');
const memoryAnalyzer = require('./analyze/memoryAnalysis');

// invokes runtime and memory analysis and outputs their results
const doAnalysis = (testCommand) => {
    let pythonFiles = findPythonFiles(__dirname + '/analyze/repo');
    // let inputInfo = inputAnalyzer.getInputInfo(pythonFiles);
    let callGraph = callGraphGenerator.makeCallGraph(pythonFiles);
    let johnsonGraph = callGraphGenerator.toJohnsonGraph(callGraph);
    // let runtimeResult =  runtimeAnalyzer.analyzeRuntime(pythonFiles, testCommand);
    console.log("Runtime analysis completed.")
    // let memoryResult = memoryAnalyzer.analyzeMemoryUsage(pythonFiles, testCommand); 
    console.log("Memory analysis completed.")
    // console.log(memoryResult);
    console.log("Analysis completed.");

    // return [null, memoryResult];
    
    // runtimeAnalyzer.analyzeRuntime(pythonFiles, subFolderDict);

    // console.log(JSON.stringify(johnsonGraph));
    return johnsonGraph;
}

function findPythonFiles(directory){
    let pythonFiles = [];
    fs.readdirSync(directory)
        .forEach((fileName) => {
            let fullFilePath = directory + '/' + fileName
            // excludes any tests files from injection
            if(fullFilePath.endsWith('.py') && !fullFilePath.toLowerCase().includes("test")){
                pythonFiles.push(fullFilePath);
            }
            else if(fs.statSync(fullFilePath).isDirectory()){
                let subPythonFiles = findPythonFiles(fullFilePath);
                pythonFiles = pythonFiles.concat(subPythonFiles);
            }
        });

    return pythonFiles;
}

module.exports = doAnalysis;
