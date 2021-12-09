import csv

# The goal of this programm is to add metadata to all time series we have in here
# Specifically, we want to add the code of the region and departement to all time series

############################################################
########################## Utils ###########################
############################################################
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
			return string.lower()

def boolKeyDepName(key, depString):
	if key == 'loire' and 'loiret' in depString:
		return False
	if key == 'ain' and ('aine' in depString or 'aint' in depString):
		return False
	if key == 'oise' and 'val' in depString:
		return False

	return key in depString and not key+'-' in depString and not '-'+key in depString


def addValuesLinear(row, datesToAddPerIndex, mode='float'):
	result = []
	for i, elt in enumerate(row):
		if datesToAddPerIndex[i] > 0:
			if row[i] != '' and row[i + 1] != '':
				d1 = float(row[i])
				d2 = float(row[i+1])
				n = datesToAddPerIndex[i]
				if mode == 'float':
					toAdd = [d1 + k*(d2-d1)/(n + 1) for k in range(1,n + 1)]
				elif mode =='int':
					toAdd = [int(d1 + k*(d2-d1)/(n + 1)) for k in range(1,n + 1)]
				else:
					raise ValueError("addValuesLinear 'mode' can only be 'float' or 'int'.")
			else:
				toAdd = datesToAddPerIndex[i] * ['']
		else:
			toAdd = []
		result = result + [elt] + toAdd
	return result

def generateDatesToAddPerIndex(row):
	datesToAddPerIndex = []
	for i,elt in enumerate(row):
		try:
			d1 = int(elt)
			d2 = int(row[i+1])
			datesToAddPerIndex.append(max(d2 - d1 - 1, 0))
		except ValueError:
			datesToAddPerIndex.append(0)
		except IndexError:
			datesToAddPerIndex.append(0)
	return datesToAddPerIndex




############################################################
################# Loading names and codes ##################
############################################################
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


############################################################
####################### Population #########################
############################################################

print("\nWorking on data/donnees_brutes/populationBrute.csv")
toWrite = []
with open("data/donnees_brutes/populationBrute.csv", "r") as csv_file:
	csv_reader = csv.reader(csv_file, delimiter=';')
	line_count = 0
	for row in csv_reader:
		if line_count == 0:
			rowToWrite = ['\ufeffCodeReg','Codeinsee'] + row[1:]
			datesToAddPerIndex = generateDatesToAddPerIndex(rowToWrite)
			rowToWrite = addValuesLinear(rowToWrite, datesToAddPerIndex, mode = 'int')

			toWrite.append(rowToWrite)
			line_count += 1
		else:
			try :
				rowToWrite = [depDataCode[clean(row[0])][2]] + row
			except KeyError:
				print(f"KeyError({row[0]})")
				rowToWrite = ["##"] + row

			rowToWrite = addValuesLinear(rowToWrite, datesToAddPerIndex, mode = 'float')
			toWrite.append(rowToWrite)
			line_count += 1

	print(f'Processed {line_count} lines from data/donnees_brutes/populationBrute.csv')

with open('data/donnees_clean/population.csv', mode='w') as outfile:
	writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
	line_count = 0
	for row in toWrite:
		writer.writerow(row[:-2])
		line_count += 1
	print(f'Wrote {line_count} lines in data/donnees_clean/population.csv')





############################################################
########################### PIB ############################
############################################################

print("\nWorking on data/donnees_brutes/pibParHab.csv")
toWrite = []
with open("data/donnees_brutes/pibParHab.csv", "r") as csv_file:
	csv_reader = csv.reader(csv_file, delimiter=';')
	line_count = 0
	for row in csv_reader:
		if line_count == 0:
			rowToWrite = ['\ufeffCodeReg','Région'] + row[1:]
			datesToAddPerIndex = generateDatesToAddPerIndex(rowToWrite)
			rowToWrite = addValuesLinear(rowToWrite, datesToAddPerIndex, mode = 'int')

			toWrite.append(rowToWrite)
			line_count += 1
		else:
			# Cleaning the row itself
			for index, elt in enumerate(row):
				if 'n.d' in elt:
					row[index] = ''
			
			# Adding to 'toWrite'
			try :
				rowToWrite = [regData[clean(row[0])][1]] + row
			except KeyError:
				print(f"KeyError({row[0]})")
				rowToWrite = ["##"] + row

			rowToWrite = addValuesLinear(rowToWrite, datesToAddPerIndex, mode = 'float')
			toWrite.append(rowToWrite)
			line_count += 1
		line_count += 1
	print(f'Processed {line_count} lines from data/donnees_brutes/pibParHab.csv')

with open('data/donnees_clean/pibParHab.csv', mode='w') as outfile:
	writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
	line_count = 0
	for row in toWrite:
		writer.writerow(row)
		line_count += 1
	print(f'Wrote {line_count} lines in data/donnees_clean/pibParHab.csv')




############################################################
####################### Accouchement #######################
############################################################

print("\nWorking on data/donnees_brutes/ageFemmeAccouchement.csv")
toWrite = []
with open("data/donnees_brutes/ageFemmeAccouchement.csv", "r") as csv_file:
	csv_reader = csv.reader(csv_file, delimiter=';')
	line_count = 0
	for row in csv_reader:
		if line_count == 0:
			rowToWrite = ['\ufeffCodeReg', 'CodeDep', 'Accouchement'] + row[1:]
			datesToAddPerIndex = generateDatesToAddPerIndex(rowToWrite)
			rowToWrite = addValuesLinear(rowToWrite, datesToAddPerIndex, mode = 'int')

			toWrite.append(rowToWrite)
			line_count += 1
		else:
			found = False
			# Cleaning the row itself
			for index, elt in enumerate(row):
				if '(O)' in elt:
					row[index] = ''
				if '(A)' in elt or '(P)' in elt:
					row[index] = row[index][:-4].replace(',','.')

			for key in depDataName:
				if boolKeyDepName(key, clean(row[0])):
					# Saving 
					rowToWrite = [depDataName[key][2], depDataName[key][1]] + row
					found = True
					break
			if not found:
				print(f"NotFound({clean(row[0])})")
				rowToWrite = ["##","##"] + row

			rowToWrite = addValuesLinear(rowToWrite, datesToAddPerIndex, mode = 'float')
			toWrite.append(rowToWrite)
			line_count += 1
	print(f'Processed {line_count} lines from data/donnees_brutes/ageFemmeAccouchement.csv')

with open('data/donnees_clean/ageFemmesAccouchement.csv', mode='w') as outfile:
	writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
	line_count = 0
	for row in toWrite:
		writer.writerow(row)
		line_count += 1
	print(f'Wrote {line_count} lines in data/donnees_clean/ageFemmeAccouchement.csv')





############################################################
#################### Esperance de vie ######################
############################################################

# Pas besoin de rajouter des dates !!!!

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
			# Cleaning the row itself
			for index, elt in enumerate(row):
				if '(O)' in elt:
					row[index] = ''
				if '(A)' in elt or '(P)' in elt:
					row[index] = row[index][:-4].replace(',','.')

			for key in depDataName:
				if boolKeyDepName(key, clean(row[0])):
					# Saving 
					toWrite.append([depDataName[key][2], depDataName[key][1]] + row)
					found = True
					break
			if not found:
				print(f"NotFound({clean(row[0])})")
				toWrite.append(["##","##"] + row)
		line_count += 1
	print(f'Processed {line_count} lines from data/donnees_brutes/esperanceDeVie.csv')


# Dealing with the difference between males and females - we only want the mean
newToWrite = [toWrite.copy()[0]]
alreadyAdded = set()
for row in toWrite[1:]:
	if row[1] != '##' and not row[1] in alreadyAdded:
		target = row[1]
		mean = row.copy()[:6] + [0 for k in range(6, len(row))]
		count = 0
		for row2 in toWrite:
			if row2[1] == target:
				for k in range(6, len(mean)):
					try:
						mean[k] = float(row2[k]) + float(mean[k])
					except ValueError:
						mean[k] = row2[k]
				count += 1
		
		for k in range(len(mean)):
			try:
				mean[k] = mean[k] / count
			except TypeError:
				pass
		
		alreadyAdded.add(target)
		newToWrite.append(mean)

toWrite = newToWrite.copy()

with open('data/donnees_clean/esperanceDeVie.csv', mode='w') as outfile:
	writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
	line_count = 0
	for row in toWrite:
		writer.writerow(row)
		line_count += 1
	print(f'Wrote {line_count} lines in data/donnees_clean/esperanceDeVie.csv')




############################################################
##################### Taux de natalité #####################
############################################################

# Pas besoin de rajouter des dates !!!!

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
			# Cleaning the row itself
			for index, elt in enumerate(row):
				if '(O)' in elt:
					row[index] = ''
				if '(A)' in elt or '(P)' in elt:
					row[index] = row[index][:-4].replace(',','.')

			for key in depDataName:
				if boolKeyDepName(key, clean(row[0])):
					# Saving 
					toWrite.append([depDataName[key][2], depDataName[key][1]] + row)
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