import json

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
				keys = key.split('@')
				self.JsonData[testName].append({
					'caller': keys[0],
					'callee': keys[1],
					'fileName': keys[2],
					'params': keys[3::],
					'occurance': self.callOccurrence[key]
				})
			except:
				continue
		self.callOccurrence = {}

	def createJsonFile(self):
		json_data = json.dumps(self.JsonData, indent=4)
		#print json_data
		with open('data.json', 'w') as f:
			f.write(json_data)

#Instantiate static class  
codeAnalyzer = CodeAnalyzer()


#Inject calls
	#import inspect
	#from codeAnalyzer import codeAnalyzer

	#functionName = functionname  					
	#caller = inspect.stack()[1][3]

	# Need to implement this
	#caller = inspect.stack()[1][3]
	#codeAnalyzer.updateCallOccurrence("{}@{}".format(caller, functionName))
		#OR for Loops 
	#codeAnalyzer.updateCallOccurrence("{}@For-1".format(functionName))

	#Need to inject 	
	#Caller					#Callee
	#inspect.stack()[1][3], inspect.stack()[0][3]