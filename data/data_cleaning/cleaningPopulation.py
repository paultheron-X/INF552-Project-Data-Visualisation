with open("../donnees_brutes/populationBrute.csv","r") as infile :
	content = infile.read()

content = content.split("\n")
content = [line.split(";") for line in content]
n = len(content)

for k in range(1,n):
	pass