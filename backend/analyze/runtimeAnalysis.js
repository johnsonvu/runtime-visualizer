const fs = require('fs');
const shell = require('shelljs');
const { spawnSync } = require('child_process');

function analyzeRuntime(pythonFiles, testCommand){
    pythonFiles.forEach(injectAnalysisTool);
    // injectAnalysisTool('C:\\Users\\Leonl\\OneDrive\\Documents\\cpsc 410\\runtime-visualizer\\backend\\example\\LibraryBook\\libraryBook.py');

    let testFiles = findTestFiles(pythonFiles);
    testFiles.forEach(runUnitTests);
    //execute tests
    const command = "cd analyze/repo && " + testCommand + " &> /dev/null";
    shell.exec(command);
    //get results
    //return results
    return new Map();
}

function injectAnalysisTool(filePath){
    console.log('Analyzing runtime in ' + filePath + '\n');
    let contents = fs.readFileSync(filePath, 'utf8').split('\n').map((line)=>line.replace(/    /g, '\t'));
    let modifiedContent = injectReflectionCode(contents);
    fs.writeFileSync(filePath, modifiedContent);
}

function injectReflectionCode(fileContent){
    let modifiedContent = [];
    let numTabs = 0;
    let functionName = null;
    let prevfunctionName = null;
    let forCount = 1;
    // modifiedContent.push('from memory_profiler import profile\r');
    modifiedContent.push('import inspect\r');
    modifiedContent.push('from codeAnalyzer import codeAnalyzer\r');
    for(let i = 0; i <fileContent.length; i++ ){
        let line = fileContent[i];
        modifiedContent.push(line);

        // Caller to callee relationship
        if(line.trim().startsWith('def')){
            numTabs = countTabs(line);
            functionName = line.split('def')[1].split('(')[0].trim();
            modifiedContent.push('\t'.repeat(numTabs + 1) + 'functionName = "'+ functionName +'"\r');
            modifiedContent.push('\t'.repeat(numTabs + 1) + 'codeAnalyzer.updateCallOccurrence(inspect.stack()[1][3]+ "@" + functionName)\r');
        }

        // For Loop inside a function
        let forRegex = new RegExp('[\t|| +]for +');
        if(forRegex.test(line) && functionName != null){
            numTabs = countTabs(line);
            if(prevfunctionName == functionName){
                forCount++;
            }else{
                forCount = 1;
                prevfunctionName = functionName;
            }
            modifiedContent.push('\t'.repeat(numTabs + 1) + 'codeAnalyzer.updateCallOccurrence(functionName + "@For'+ forCount +'")');
        }
    }
    let stringContent = '';
    for(let i = 0; i <modifiedContent.length; i++ ){
        console.log(modifiedContent[i]);
        // if(modifiedContent[i].indexOf('unittest.main()') !== -1) {
        //     console.log("here");
        //     stringContent = stringContent.concat('\tprint("LMAO")\n'); 
        // }
        stringContent = stringContent.concat(modifiedContent[i]+'\n');
    }
    return stringContent;
}


function countTabs(line){
    let i = 0;
    let count = 0;
    while(line.charAt(i++) === '\t'){
      count++;
    }
    return count;
}

function findTestFiles(filePaths){
    let hasUnitTestsRegExp = /import[^\n]+unittest/;
    return filePaths.filter((filePath) => {
        let content = fs.readFileSync(filePath, 'utf8');
        return hasUnitTestsRegExp.test(content);
    });
}

function runUnitTests(filePath){
    console.log('start');
    let test = spawnSync('python', ["C:/Users/Justin Kwan/Desktop/cs410/runtime-visualizer/backend/justintest.py"]);
    test.stdout.on('data', (data) => {
        console.log("data is: " + data);
    });
    test.stderr.on('data', (data) => {
        console.log("data is: " + data);
    });
    console.log('done');
}

module.exports = { analyzeRuntime: analyzeRuntime };