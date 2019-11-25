class CodeAnalyzer:
	def __init__(self):
		self.callOccurrence = {}
		self.JsonData = {}

	def getCallOccurrence(self):
		return self.callOccurrence
	
	def updateCallOccurrence(self, key):
		if not key in self.callOccurrence:
			self.callOccurrence[key] = 1
		else:
			self.callOccurrence[key] += 1

	def appendTestData(self, testName):
		self.JsonData[testName] = []
		for key in self.callOccurrence:
			try:
				self.JsonData[testName].append({
					'caller': key.split('@')[0],
					'callee': key.split('@')[1],
					'occurance': self.callOccurrence[key]
				})
			except:
				continue
		self.callOccurrence = {}

	def createJsonFile(self):
		json_data = json.dumps(self.JsonData, indent=4)
		print json_data
		with open('data.txt', 'w') as outfile:
			json.dump(json_data, outfile)

#Instantiate static class  
codeAnalyzer = CodeAnalyzer()


#Inject calls
	#import inspect
	#from codeAnalyzer import codeAnalyzer
	#codeAnalyzer.updateCallOccurrence(inspect.stack()[1][3])

	#functionName = inspect.stack()[1][3]
	#codeAnalyzer.updateCallOccurrence("{} - For Loop lvl 1".format(inspect.stack()[1][3]))

	#Caller					#Callee
	#inspect.stack()[1][3], inspect.stack()[0][3]