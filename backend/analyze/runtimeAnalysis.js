const fs = require('fs');

function analyzeRuntime(pythonFiles, inputInfo){
    pythonFiles.forEach(injectAnalysisTool);
    //injectAnalysisTool('C:\\Users\\Leonl\\OneDrive\\Documents\\cpsc 410\\runtime-visualizer\\backend\\example\\LibraryBook\\libraryBook.py')
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
    modifiedContent.push('from memory_profiler import profile\r');
    modifiedContent.push('import inspect\r');
    modifiedContent.push('from codeAnalyzer import codeAnalyzer\r');
    for(let i = 0; i <fileContent.length; i++ ){
        let line = fileContent[i];
        modifiedContent.push(line);
        if(line.trim().startsWith('def')){
            let numTabs = countTabs(line);
            let functionName = line.split('def')[1].split('(')[0].trim();
            modifiedContent.push('\t'.repeat(numTabs + 1) + 'functionName = "'+ functionName +'"\r');
            modifiedContent.push('\t'.repeat(numTabs + 1) + 'print "{} --> {}".format(inspect.stack()[1][3], functionName)\r');
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