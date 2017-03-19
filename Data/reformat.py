import re
import json

totFile = open("country-import-amount.csv", "r")

coffeeFile = open("coffeetea.csv", "r")
dairyFile = open("dairy.csv", "r")
fishFile = open("fish.csv", "r")
fruitFile = open("fruits.csv", "r")
grainFile = open("grains.csv", "r")
meatFile = open("meats.csv", "r")
nutFile = open("nuts.csv", "r")
otherFile = open("other.csv", "r")
sweetFile = open("sweets.csv", "r")
vegetableFile = open("vegetables.csv", "r")
vegoilFile = open("vegoils.csv", "r")

jsonFile = open("all.json", "w")

fileList = [coffeeFile, dairyFile, fishFile, fruitFile, grainFile, meatFile, nutFile, otherFile, sweetFile, vegetableFile, vegoilFile]
fileNameList = ["coffeetea", "dairy", "fish", "fruits", "grains", "meats", "nuts", "other", "sweets", "vegetables", "vegoils"]

jsonVar = {"name": "top", "children": []}

totFile.readline()
for line in totFile:
    temp = line.split(",")
    if (temp[0] == "Rest of world" or temp[0] == "Total"): break
    jsonVar["children"].append({"name": temp[0], "children": []})

for i in range(1999, 2015):
    for country in jsonVar["children"]:
        temp = []
        for nm in fileNameList:
            temp.append({"name": nm, "children":[]})
        country["children"].append({"children":temp, "name": str(i)})

for i in range(0, len(fileList)):
    header = fileList[i].readline()
    header = re.split(', |\n', header)
    header = header[0].split(",")

    countryCount = 0
    for line in fileList[i]:
        temp = line.split(",")
        curCountry = temp[0]
        index = 2
        while ((2014 - 1999 + index) < len(temp) and (2014 - 1999 + index) < len(header)):
            if (curCountry != "Rest of world" and curCountry != "Total"):
                if (temp[index] != ""):
                    for j in range(1999, 2015):
                        jsonVar["children"][countryCount]["children"][j - 1999]["children"][i]["children"].append({"name":header[j - 1999 + index][5:len(header[j - 1999 + index])],"value": temp[j - 1999 + index]})
            index += 16
        countryCount += 1
    countryCount = 0

json.dump(jsonVar, jsonFile)
jsonFile.close()

