const fs = require("fs");

const injectPythonCode = () => {
    let pythonFiles = findPythonFiles(__dirname + "/analyze");
    console.log(JSON.stringify(pythonFiles));
    pythonFiles.forEach(injectRefelctions);
}

function findPythonFiles(directory){
    let pythonFiles = [];
    fs.readdirSync(directory)
        .forEach((fileName) => {
            let fullFilePath = directory + "/" + fileName
            if(fullFilePath.endsWith(".py")){
                pythonFiles.push(fullFilePath);
            }
            else if(fs.statSync(fullFilePath).isDirectory()){
                let subPythonFiles = findPythonFiles(fullFilePath);
                pythonFiles = pythonFiles.concat(subPythonFiles);
            }
        });

    return pythonFiles;
}

function injectRefelctions(filePath){
    let contents = fs.readFileSync(filePath, 'utf8').split('\n').map((line)=>line.replace(/    /g, '\t'));
    let modifiedContent = injectReflectionCode(contents);
    fs.writeFileSync(filePath, modifiedContent);
}

function numOfTabs(line){
    let i = 0;
    let count = 0;
    while(line.charAt(i++) === '\t'){
      count++;
    }

    return count;
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
            let numTabs = numOfTabs(line);
            modifiedContent.push('\t'.repeat(numTabs + 1) + 'functionName = inspect.stack()[0][3]\r');
            // modifiedContent.push('\t'.repeat(numTabs + 1) + 'print "{} --> {}".format(inspect.stack()[1][3], functionName)\r');
        }
    }
    //console.log(modifiedContent);
    let stringContent = "";
    for(let i = 0; i <modifiedContent.length; i++ ){
        stringContent = stringContent.concat(modifiedContent[i]);
    }
    return stringContent
}

  
module.exports = { injectPythonCode: injectPythonCode };
