import csv

# The goal of this programm is to add metadata to all time series we have in here
# Specifically, we want to add the code of the region and departement to all time series

# Utils
def clean(string):
	"""returns a cleaner string for code:
	06 =>6
	12 => 12
	2A => 2A"""
	try:
		return str(int(string))
	except ValueError:
		if string == "2A" or string == "2B":
			return string
		else :
			return string.lower().replace(' ','').replace('-','')

# Loading the names and codes of regions / departements
print(f"Working on data/donnees_brutes/correspondanceDepRegion.csv")
depDataName = dict()
depDataCode = dict()
regData = dict()
toWrite = []
with open("data/donnees_brutes/correspondanceDepRegion.csv", "r") as csv_file:
	csv_reader = csv.reader(csv_file, delimiter=';')
	line_count = 0
	for row in csv_reader:
		if line_count == 0:
			toWrite.append(row)
			line_count += 1
		else:
			if not clean(row[3])in depDataName :
				regData[clean(row[1])] = (row[1], clean(row[0]))
				depDataName[clean(row[3])] = (row[3], clean(row[2]), clean(row[0]))
				depDataCode[clean(row[2])] = (clean(row[2]), clean(row[3]), clean(row[0]))
				toWrite.append(row)
			line_count += 1
	print(f'Processed {line_count} lines from data/donnees_brutes/correspondanceDepRegion.csv')


with open('data/donnees_clean/correspondanceRegDep.csv', mode='w') as outfile:
	writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
	line_count = 0
	for row in toWrite:
		writer.writerow(row)
		line_count += 1
	print(f'Wrote {line_count} lines in data/donnees_clean/correspondanceRegDep.csv')

## Proceeding population
print("\nWorking on data/donnees_brutes/populationBrute.csv")
toWrite = []
with open("data/donnees_brutes/populationBrute.csv", "r") as csv_file:
	csv_reader = csv.reader(csv_file, delimiter=';')
	line_count = 0
	for row in csv_reader:
		if line_count == 0:
			toWrite.append(['\ufeffCodeReg','Codeinsee'] + row[1:])
			line_count += 1
		else:
			try :
				toWrite.append([depDataCode[clean(row[0])][2]] + row)
			except KeyError:
				print(f"KeyError({row[0]})")
				toWrite.append(["##"] + row)
			line_count += 1
	print(f'Processed {line_count} lines from data/donnees_brutes/populationBrute.csv')

with open('data/donnees_clean/population.csv', mode='w') as outfile:
	writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
	line_count = 0
	for row in toWrite:
		writer.writerow(row[:-2])
		line_count += 1
	print(f'Wrote {line_count} lines in data/donnees_clean/population.csv')



## Processing PIB
print("\nWorking on data/donnees_brutes/pibParHab.csv")
toWrite = []
with open("data/donnees_brutes/pibParHab.csv", "r") as csv_file:
	csv_reader = csv.reader(csv_file, delimiter=';')
	line_count = 0
	for row in csv_reader:
		if line_count == 0:
			toWrite.append(['\ufeffCodeReg','Région'] + row[1:])
			line_count += 1
		else:
			try :
				toWrite.append([regData[clean(row[0])][1]] + row)
			except KeyError:
				print(f"KeyError({clean(row[0])})")
				toWrite.append(["##"] + row)
		line_count += 1
	print(f'Processed {line_count} lines from data/donnees_brutes/pibParHab.csv')

with open('data/donnees_clean/pibParHab.csv', mode='w') as outfile:
	writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
	line_count = 0
	for row in toWrite:
		writer.writerow(row)
		line_count += 1
	print(f'Wrote {line_count} lines in data/donnees_clean/pibParHab.csv')

## Processing Âge de la femme à l'accouchement
print("\nWorking on data/donnees_brutes/ageFemmeAccouchement.csv")
toWrite = []
with open("data/donnees_brutes/ageFemmeAccouchement.csv", "r") as csv_file:
	csv_reader = csv.reader(csv_file, delimiter=';')
	line_count = 0
	for row in csv_reader:
		if line_count == 0:
			toWrite.append(['\ufeffCodeReg', 'CodeDep', 'Accouchement'] + row[1:])
			line_count += 1
		else:
			found = False
			for key in depDataName:
				if key in clean(row[0]):
					# Cleaning the row itself
					for index, elt in enumerate(row):
						if '(O)' in elt:
							row[index] = ''
						if '(A)' in elt or '(P)' in elt:
							row[index] = row[index][:-4].replace(',','.')
					
					# Saving 
					toWrite.append([depDataName[key][1], depDataName[key][2]] + row)
					found = True
					break
			if not found:
				print(f"NotFound({clean(row[0])})")
				toWrite.append(["##","##"] + row)
		line_count += 1
	print(f'Processed {line_count} lines from data/donnees_brutes/ageFemmeAccouchement.csv')

with open('data/donnees_clean/ageFemmesAccouchement.csv', mode='w') as outfile:
	writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
	line_count = 0
	for row in toWrite:
		writer.writerow(row)
		line_count += 1
	print(f'Wrote {line_count} lines in data/donnees_clean/ageFemmeAccouchement.csv')


## Processing Espérance de Vie
print("\nWorking on data/donnees_brutes/esperanceDeVie.csv")
toWrite = []
with open("data/donnees_brutes/esperanceDeVie.csv", "r") as csv_file:
	csv_reader = csv.reader(csv_file, delimiter=';')
	line_count = 0
	for row in csv_reader:
		if line_count == 0:
			toWrite.append(['\ufeffCodeReg', 'CodeDep', 'Esperance'] + row[1:])
			line_count += 1
		else:
			found = False
			for key in depDataName:
				if key in clean(row[0]):
					# Cleaning the row itself
					for index, elt in enumerate(row):
						if '(O)' in elt:
							row[index] = ''
						if '(A)' in elt or '(P)' in elt:
							row[index] = row[index][:-4].replace(',','.')
					
					# Saving 
					toWrite.append([depDataName[key][1], depDataName[key][2]] + row)
					found = True
					break
			if not found:
				print(f"NotFound({clean(row[0])})")
				toWrite.append(["##","##"] + row)
		line_count += 1
	print(f'Processed {line_count} lines from data/donnees_brutes/esperanceDeVie.csv')

with open('data/donnees_clean/esperanceDeVie.csv', mode='w') as outfile:
	writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
	line_count = 0
	for row in toWrite:
		writer.writerow(row)
		line_count += 1
	print(f'Wrote {line_count} lines in data/donnees_clean/esperanceDeVie.csv')


## Processing Taux de natalité
print("\nWorking on data/donnees_brutes/tauxNatalite.csv")
toWrite = []
with open("data/donnees_brutes/tauxNatalite.csv", "r") as csv_file:
	csv_reader = csv.reader(csv_file, delimiter=';')
	line_count = 0
	for row in csv_reader:
		if line_count == 0:
			toWrite.append(['\ufeffCodeReg', 'CodeDep', 'Natalité'] + row[1:])
			line_count += 1
		else:
			found = False
			for key in depDataName:
				if key in clean(row[0]):
					# Cleaning the row itself
					for index, elt in enumerate(row):
						if '(O)' in elt:
							row[index] = ''
						if '(A)' in elt or '(P)' in elt:
							row[index] = row[index][:-4].replace(',','.')
					
					# Saving 
					toWrite.append([depDataName[key][1], depDataName[key][2]] + row)
					found = True
					break
			if not found:
				print(f"NotFound({clean(row[0])})")
				toWrite.append(["##","##"] + row)
		line_count += 1
	print(f'Processed {line_count} lines from data/donnees_brutes/tauxNatalite.csv')

with open('data/donnees_clean/tauxNatalite.csv', mode='w') as outfile:
	writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
	line_count = 0
	for row in toWrite:
		writer.writerow(row)
		line_count += 1
	print(f'Wrote {line_count} lines in data/donnees_clean/tauxNatalite.csv')