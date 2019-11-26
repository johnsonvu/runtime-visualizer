#!/usr/bin/env bash
FILE=$1
#FILE="../../example/LibraryBook/libraryBook.py"

# Load function information
cat ${FILE} | sed -n "/def/p" > test.txt
sed -i "" "s/def \(.*\)(.*/\1/" test.txt
FUNC_SIZE=$(wc -l < test.txt)
LOOP="for while"
LOOP_FUNC="";
FUNC=" "
FUNC+=$(cat test.txt)
FUNC+=" "

CLASS=$(cat ${FILE} | sed -n "/class/p" | cut -d ' ' -f 2 | cut -d '(' -f 1 | sed "s/://")

for c in ${CLASS}; do
     FUNC=$(echo ${FUNC} | sed "s/__init__/${c}.init/")
done;

LINES=$(cat ${FILE} | sed -n "/def/=")

# Locate function to generate call graph
locFunc() {
    GOAL=${1}
    LOC=-1
    index=1
    for i in ${FUNC}; do
        if [[ ${i} == ${GOAL} ]]; then
            LOC=${index}
            break;
        fi
        ((index++))
    done;
}

getFunc() {
    FNAME=${1}

    locFunc ${FNAME}
    if [[ LOC -eq -1 ]]; then
        echo "function name does not exist"
        exit 3
    fi
    START=$(echo ${LINES} | cut -d " " -f ${LOC})
    ((START++))
    ((LOC++))
    if [[ ${LOC} -gt $FUNC_SIZE ]]; then
        END=$(sed -n "/__main__/=" ${FILE})
    else
        END=$(echo ${LINES} | cut -d " " -f ${LOC})
        ((END--))
    fi

    #FUNCDEF=$(sed -n "$START, $END p" ${FILE})
}


cat -t ${FILE} | sed "s/\^I/_/g" > file.txt
FILE=file.txt
rm test.txt


for f in ${FUNC}; do
    getFunc ${f}
    LOOP_STARTED=false
    TAB=""
    LOOP_NAMES=""
    LOOP_NO=1

    ACC=${START}

    while [[ ${ACC} -le ${END} ]]; do
        CODE=$(sed -n "${ACC} p" ${FILE})

        FIRST=$(echo ${CODE} | sed "s/\([\w]*\)[ .(].*/\1/" | sed "s/^[_]*//g")
        CUR_TAB=$(echo ${CODE} | sed "s/\(_*\).*/\1/" | wc -m)


        if [[ ${LOOP_STARTED} == true ]]; then
            LAST_TAB=$(echo ${TAB} | sed "s/.* //")

            if [[ ${CUR_TAB} -eq ${LAST_TAB} ]]; then
                TAB=${TAB%_*}
                LOOP_NAMES=${LOOP_NAMES% *}
            fi

            if [[ -z ${LOOP_NAMES} ]]; then
                LOOP_STARTED=false
                TAB=""
                LOOP_NAMES=""
            fi
        fi

        if [[ ! -z ${FIRST} && ! -z $(echo ${LOOP} | sed -n "/${FIRST}/p") ]]; then
            LOOP_STARTED=true
            TAB+=" ${CUR_TAB}"
            LOOP_NAMES+=" ${f}_${FIRST}${LOOP_NO}"
            echo "${f}.${f}_${FIRST}${LOOP_NO}" >> test.txt
            LOOP_FUNC+=" ${f}_${FIRST}${LOOP_NO}"
            ((LOOP_NO++))
         fi

        CALL=$(echo ${CODE} | cut -d "(" -s -f 1)
        while [[ ! -z ${CALL} ]]; do
            CALL=$(echo ${CALL} | sed "s/\[/\\\[/g")
            CALL=$(echo ${CALL} | sed "s/\]/\\\]/g")

            CODE=$(echo ${CODE} | sed "s/${CALL}(//")
            FUNC_NAME=$(echo ${CALL} | sed "s/.*[ .]//")
            if [[ ! -z $(echo ${FUNC} | sed -n "/ ${FUNC_NAME} /p") ]]; then
                if [[ ${LOOP_STARTED} == true ]]; then
                    echo "$(echo ${LOOP_NAMES} | sed "s/.* //").${FUNC_NAME}" >> test.txt
                else
                    echo "${f}.${FUNC_NAME}" >> test.txt
                fi
            fi

            CALL=$(echo ${CODE} | cut -d "(" -s -f 1)
        done
        ((ACC++))
    done
done

if [[ -e output.json ]]; then
    rm output.json
fi

echo "{\"node\": [" >> output.json
INIT=true
for i in ${FUNC}; do
if [[ ${INIT} == true ]]; then
   INIT=false
else
    echo "," >> output.json
fi
    echo "{
    \"id\": \"${i}\",
    \"name\": \"${i}\",
    \"color\": \"red\",
    \"val\": 50,
    \"metadata\": {
    \"lines\": 1,
    \"variables\": 1,
    \"calls\": 1
    }
}" >> output.json
done

for i in ${LOOP_FUNC}; do
    echo "," >> output.json
    echo "{
    \"id\": \"${i}\",
    \"name\": \"${i}\",
    \"color\": \"red\",
    \"val\": 50,
    \"metadata\": {
    \"lines\": 1,
    \"variables\": 1,
    \"calls\": 1
    }
}" >> output.json
done

echo "]," >> output.json

echo "\"links\": [" >> output.json
id=1
CONTENT=$(cat test.txt)
for e in ${CONTENT}; do
if [[ ${id} -ne 1 ]]; then
    echo "," >> output.json
fi
    CALLER=${e%%.*}
    CALLEE=${e#*.}
    echo "{
    \"id\": \"${id}\",
    \"source\": \"${CALLER}\",
    \"target\": \"${CALLEE}\",
    \"width\": 5,
    \"color\": \"#999\",
    \"distance\": 100,
    \"name\": \"\"
}" >> output.json
((id++))
done
echo "]}" >> output.json

rm file.txt
rm test.txt