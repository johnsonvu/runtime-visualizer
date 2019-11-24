const fs = require('fs');

function analyzeRuntime(pythonFiles, inputInfo){
    //pythonFiles.forEach(injectAnalysisTool);
    injectAnalysisTool('C:\\Users\\Leonl\\OneDrive\\Documents\\cpsc 410\\runtime-visualizer\\backend\\example\\LibraryBook\\libraryBook.py')
    //execute tests
    //get results
    //return results
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
    modifiedContent.push('from memory_profiler import profile\r');
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
    console.log(modifiedContent);
    let stringContent = '';
    for(let i = 0; i <modifiedContent.length; i++ ){
        stringContent = stringContent.concat(modifiedContent[i]+'\n');
    }
    return stringContent
}


function countTabs(line){
    let i = 0;
    let count = 0;
    while(line.charAt(i++) === '\t'){
      count++;
    }
    return count;
}

module.exports = { analyzeRuntime: analyzeRuntime };