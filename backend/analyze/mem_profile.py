import sys
import os

def main():
    filepath = sys.argv[1]

    if not os.path.isfile(filepath):
        print("File {} path does not exist. Exiting the program".format(filepath))
        sys.exit()

    with open(filepath) as fp:
        for i, line in enumerate(fp, start=1):
            linePart = line.partition(' ')
            firstWord = linePart[0]
            if firstWord == 'def':
                print("function def %s on line %d " % (linePart[2].rstrip("\n"),i))

if __name__ == "__main__":
    main()