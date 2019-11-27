# runtime-visualizer
A visualizer for analyzing Python code.

## Preview
Enter a Python project repository and the command to execute tests, then voila!
![example-app](./images/app.png)

## Design Video
[![Alt text](./images/video.png "DesignVideo")](https://www.youtube.com/watch?v=zkbQfQ-w3ts)

## Visualization Description
1. Our visualization was implemented using react-force-graph-2d
    * On top of this, we created customized rendering for node, and link metadata to display as an overlay 
    * To prevent clutter, we only display data on hover
        * The hovered node and its children are highlighted and their metadata is displayed

## Analysis Description

1. Function Call Graph — base graph shown in visualization
    * Using static syntactic analysis we grabbed all the name of functions
    * Using static lexical analysis, we look for function uses in each function of each file

2. Runtime Analysis — adds hover details and representitive edge widths to graph
    * Using static syntactical analysis, we determined where functions started and saved the name and make a call to our injected code to call our analyzeCode package
    * Using dynamic semantic analysis we ran tests that would trigger the injected lines of code naturally with reasonable inputs and save the data in a .json file to be processed later in JavaScript
    * Made a Python class to store our call information
    * Separate injections were made for test classes to  instantiate our code analyzer per test

3. Memory Analysis — adds node size to graph
    * Using static syntatical analysis, we find function definitions and inject code before each
    * For our dynamic analysis we run tests and lexically analyze the results from memory_profiler, tracking peak memory usage for each function call

## Group members & Work Contributed
1. Johnson Vu
    * Visualization
        * d3 setup
    * Front & Back-end configuration
    * General application data workflow/pipelining
        * integration of everyones' parts
    * Memory analysis
        * Injection into Python files
    * User tests

2. Justin Kwan
    * Call graph generation
    * Run-time injection and analysis
        * Brainstorming dynamic analysis process
        * Analysis of results
        * Injection into Python files
    * User tests
3. Leon Lui (our Python expert 🙂)
    * Run-time injection and analysis
        * Code analysis Python class
        * Injection into Python files
    * Example code mock-up
4. MengXin Zhao
5. Varun Belani
    * Memory analysis
        * Analysis of memory_profiler results
    * Project video
        * Video editing
        * Audio recording

## Running the application
First install `docker` and `docker-compose`

Now run the following command in the main project directory:
```
$ sudo docker-compose up
```


