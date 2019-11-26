const fs = require('fs');
const shell = require('shelljs');
const { spawnSync } = require('child_process');

let subFolderDict;

function analyzeRuntime(pythonFiles, subFolderDictionary, testCommand){
    subFolderDict = subFolderDictionary;
    // console.log(JSON.stringify(subFolderDict));
    let pythonFilesWithExclusions = findPythonFilesWithExclusions(pythonFiles);
    // console.log(pythonFilesWithExclusions);
    pythonFilesWithExclusions.forEach(injectAnalysisTool);
    //injectAnalysisTool('C:\\Users\\Leonl\\OneDrive\\Documents\\cpsc 410\\runtime-visualizer\\backend\\example\\LibraryBook\\libraryBook.py');

    let testFiles = findTestFiles(pythonFiles);
    // console.log(testFiles);
    //injectCodeAnalyzer("C:\\Users\\Leonl\\OneDrive\\Documents\\cpsc 410\\runtime-visualizer\\backend\\example\\LibraryBook\\tests.py")
    testFiles.forEach(injectCodeAnalyzer);
    //testFiles.forEach(runUnitTests);
    //execute tests
    const command = "cd analyze/repo && " + testCommand; //+ " &> /dev/null";
    console.log("command is: " + command);
    //console.log("HELLLLLLLLLLOOOOOOOOOOOOOOOOO LEOOOOOOOOOOOOOOOOOOOOONSOOOOOOOOOOOOOOOOON1111111111");
    shell.exec(command);
    //console.log("HELLLLLLLLLLOOOOOOOOOOOOOOOOO LEOOOOOOOOOOOOOOOOOOOOONSOOOOOOOOOOOOOOOOON2222222222");
    //get results
    // console.log("my dir name is: " + __dirname);
    let stringData = fs.readFileSync(__dirname + '/repo/data.txt', 'utf8');
    // console.log("HELLLLLLLLLLOOOOOOOOOOOOOOOOO LEOOOOOOOOOOOOOOOOOOOOONSOOOOOOOOOOOOOOOOON3333333333");
    let results = JSON.parse(stringData);
    // let results = JSON.parse(JSON.parse(stringData));
    //return results
    return results;
}

function injectAnalysisTool(filePath){
    console.log('Analyzing runtime in ' + filePath);
    let contents = fs.readFileSync(filePath, 'utf8').split('\n').map((line)=>line.replace(/    /g, '\t'));
    let modifiedContent = injectReflectionCode(contents, filePath ,subFolderDict[filePath]);
    fs.writeFileSync(filePath, modifiedContent);
}

function injectReflectionCode(fileContent, filePath ,fileDepth){
    let modifiedContent = [];
    let numTabs = 0;
    let functionName = null;
    let prevfunctionName = null;
    let forCount = 1;
    modifiedContent.push('import sys\r');
    modifiedContent.push('sys.path.append("' + numDoubleDots(fileDepth) + 'codeAnalyzer")\r');
    modifiedContent.push('from codeAnalyzer import codeAnalyzer\r');
    modifiedContent.push('import inspect\r');
    
    for(let i = 0; i <fileContent.length; i++ ){
        let line = fileContent[i];
        modifiedContent.push(line);

        // Caller to callee relationship
        if(line.trim().startsWith('def')){
            numTabs = countTabs(line);
            functionName = line.split('def')[1].split('(')[0].trim();
            modifiedContent.push('\t'.repeat(numTabs + 1) + 'functionName = "'+ functionName +'"\r');
            modifiedContent.push('\t'.repeat(numTabs + 1) + 'codeAnalyzer.updateCallOccurrence(inspect.stack()[1][3]+ "@" + functionName + "@'+ filePath +'")\r');
        }

        // For Loop inside a function
        let forRegex = new RegExp('\t*for\s+');
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
        // console.log(modifiedContent[i]);
        stringContent = stringContent.concat(modifiedContent[i]+'\n');
    }
    return stringContent;
}

function numDoubleDots(num){
    let dots = '';
    for(let i=0; i<num; i++){
        dots += '../';
    }
    return dots;
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
    return filePaths.filter((filePath) => {
        return filePath.toLowerCase().includes("test");
    });
}

function findPythonFilesWithExclusions(filePaths){
    return filePaths.filter((filePath) => {
        return !filePath.toLowerCase().includes("test") && !filePath.includes("codeAnalyzer.py");
    });
}

function injectCodeAnalyzer(filePath){
    let contents = fs.readFileSync(filePath, 'utf8').split('\n').map((line)=>line.replace(/    /g, '\t'));
    let modifiedContent = writeCodeAnalyzer(contents, subFolderDict[filePath]);
    fs.writeFileSync(filePath, modifiedContent);
}

function writeCodeAnalyzer(contents, fileDepth){
    let modifiedContent = [];
    modifiedContent.push('import sys\r');
    modifiedContent.push('sys.path.append("' + numDoubleDots(fileDepth) + 'codeAnalyzer")\r');
    modifiedContent.push('from codeAnalyzer import codeAnalyzer\r');
    let defTab = 0;
    for(let i = 0; i <contents.length; i++ ){
        let line = contents[i];
        modifiedContent.push(line);
        
        let forRegex = /\t*def\s+test/;
        if(forRegex.test(line)){
            functionName = line.split('def')[1].split('(')[0].trim();
            defTab = countTabs(line);
            let numTab = defTab+1;
            i++;            
            while(i < contents.length){
                let functionContent = contents[i]
                modifiedContent.push(functionContent);
                numTab = countTabs(functionContent);
                if(numTab <= defTab || functionContent.trim() === ''){
                    break;
                }
                i++;
            }
            modifiedContent.push('\t'.repeat(defTab + 1) + 'codeAnalyzer.appendTestData(\"'+ functionName +'\")\r');
        }
        let mainRegex = /\t*if\s*__name__\s*==\s*['"]__main__["']:\s*/;
        if(mainRegex.test(line)){
            maintab = countTabs(line);
            let unitTestMain = /unittest.main\(/g;
            let exitFalse = /exit\s*=\s*False/;
            i++;
            while(i< contents.length){
                line = contents[i];
                if(unitTestMain.test(line)){
                    if(exitFalse.test(line)){
                        modifiedContent.push(line);
                    }else{
                        modifiedContent.push('\t'.repeat(maintab + 1) + 'unittest.main(exit=False)\r');
                    }
                    modifiedContent.push('\t'.repeat(maintab + 1) + 'codeAnalyzer.createJsonFile()\r');
                    break;
                }
                i++
            }
        }
    }
    let stringContent = '';
    for(let i = 0; i <modifiedContent.length; i++ ){
        //console.log(modifiedContent[i]);
        stringContent = stringContent.concat(modifiedContent[i]+'\n');
    }
    return stringContent;
}

module.exports = { analyzeRuntime: analyzeRuntime };
