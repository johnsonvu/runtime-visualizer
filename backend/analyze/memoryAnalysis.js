const fs = require("fs");
const shell = require('shelljs');

var fileNameArray = new Array();
// key: module_name.function_name
// value: [peak memory usage accross all calls in MiB][sum of mem usage at end of all calls in MiB]
// module_name is the filename the function resides, with the ".py" removed
var functionMemoryMap = new Map();

// key: module_name.function_name ; value:

// to start fileParser, can delete once memory_profiler output connected
var logfilePath = __dirname + "/repo/logfile.txt";

function analyzeMemoryUsage(pythonFiles, testCommand){
    // reset repo to it's initial state
    const command1 = "cd analyze/repo && " + "git reset --hard" + " &> /dev/null";
    shell.exec(command1);

    let nonTestFiles = findNonTestFiles(pythonFiles);
    nonTestFiles.forEach((file) => injectAnalysisTool(file));
    //execute tests
    const command2 = "cd analyze/repo && " + testCommand + " &> /dev/null";
    shell.exec(command2);
    //get results
    parseLogFile(logfilePath);
    //return results
    return functionMemoryMap;
}

function injectAnalysisTool(filePath){
    console.log('Analyzing memory usage in ' + filePath);
    let contents = fs.readFileSync(filePath, 'utf8').split('\n').map((line)=>line.replace(/    /g, '\t'));
    let modifiedContent = injectReflectionCode(contents);
    fs.writeFileSync(filePath, modifiedContent);
}

function injectReflectionCode(fileContent){
    let modifiedContent = [];
    let curDir = __dirname;
    modifiedContent.push('from memory_profiler import profile\r');
    // log all memory logs into single file
    modifiedContent.push('fp=open(\''+ curDir + '/repo/logfile.txt\',\'w+\')\r');
    for(let i = 0; i <fileContent.length; i++ ){
        let line = fileContent[i];
        if(line.trim().startsWith('def')){
            let numTabs = countTabs(line);
            modifiedContent.push('\t'.repeat(numTabs) + '@profile(precision=7,stream=fp)\r');
        }
        modifiedContent.push(line);
    }
    //console.log(modifiedContent);
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

// Parse memory profiler output file (assuming written file)
// Split .txt file by function by splitting on regex
// Filter out null, empty, or undefined values from each array
function parseLogFile(path) {
    // Split on longer regex to avoid potential errors caused by splitting on strings within LineContents column of the table
    let regexFileNameHeader = RegExp("Filename: .*\n\nLine #    Mem usage    Increment   Line Contents\n================================================", "g");

    let filenames = fs.readFileSync(path, 'utf8').match(regexFileNameHeader).filter(function (e) {
        return e;
    });
    parseAllTableFilenames(filenames);

    let functions = fs.readFileSync(path, 'utf8').split(regexFileNameHeader).filter(function (e) {
        return e;
    });
    parseAllTables(functions);
}

// Read filenames in order
// clean preceding "Filename: " and proceeding ".py" and table header
// push cleaned filenmaes onto fileNameArray
function parseAllTableFilenames(filenames) {
    for(let i = 0; i < filenames.length; i++){
        let f = filenames[i];
        fileNameArray.push(f.substring(f.indexOf(" ")+1,f.indexOf("\n")));
    }
}

// Split each function string by regex to avoid errors caused by splitting on substrings within LineContents column of the table
// Filter out null, empty, or undefined values from the functionLines array
function parseAllTables(functions){
    let regexNewLineAndLineNum = RegExp("\n *[0-9]*(?: |\t)*", "g");
    for(let i = 0; i < functions.length; i++){
        let fn = functions[i];
        let functionLines = fn.split(regexNewLineAndLineNum).filter(function (e) {
            return e;
        });
        parseFunction(functionLines,fileNameArray[i]);
    }
}

// parse each line of the function to get function name, peak memory usage, and memory allocated at end of function
// call insert
function parseFunction(fnLines,filename){
    let regexMemValStart = new RegExp("^\\d+.{0,1}\\d* MiB");
    let fnMemStart = 0;
    let fnMemEnd = 0;
    let fnMemPeak = 0;
    let fnName = "";

    fnLines.forEach(function(line, index, array){
        // if line starts with "def", then it's the function name
        if(line.startsWith("def ")){
            fnName = filename+"."+line.substring(line.indexOf(" ")+1,line.indexOf("("));
        }
        // if line start with memory value, then evaluate
        else if(regexMemValStart.test(line)) {
            let fnMemCurr = parseFloat(line.match(regexMemValStart)[0]);
            if(index==0){
                fnMemStart = fnMemCurr;
            } else if (index==array.length-1){
                fnMemEnd = fnMemCurr-fnMemStart;
            }
            fnMemPeak = Math.max(fnMemPeak, fnMemCurr);
        }
    });
    insertFunctionIntoMaps(fnName,fnMemPeak,fnMemEnd);
}

function insertFunctionIntoMaps(fnName,fnMemPeak,fnMemEnd) {
    // if(functionMemoryMap.get(fnName)){
    //     let setPeakVal = functionMemoryMap.get(fnName)[0];
    //     let setEndVal = functionMemoryMap.get(fnName)[1];
    //     let newVals = [Math.max(setPeakVal,fnMemPeak),setEndVal+fnMemEnd];
    //     functionMemoryMap.set(fnName,newVals);
    // } else {
    //     let setVals = [fnMemPeak,fnMemEnd];
    //     functionMemoryMap.set(fnName,setVals);
    // }
    functionMemoryMap.set(fnName,fnMemPeak);
}

function findNonTestFiles(filePaths){
    return filePaths.filter((filePath) => {
        return !filePath.toLowerCase().includes("test");
    });
}

module.exports = { analyzeMemoryUsage: analyzeMemoryUsage };