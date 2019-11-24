import json

class CodeAnalyzer:
	def __init__(self):
		self.callOccurrence = {}

	def getCallOccurrence(self):
		return self.callOccurrence
	
	def updateCallOccurrence(self, key):
		if not key in self.callOccurrence:
			self.callOccurrence[key] = 1
		else:
			self.callOccurrence[key] += 1

	def createJsonFile(self):
		callAnalysis = {}
		callAnalysis['data'] = []
		for key in self.callOccurrence:
			try:
				callAnalysis['data'].append({
					'caller': key.split('@')[0],
					'callee': key.split('@')[1],
					'occurance': self.callOccurrence[key]
				})
			except:
				continue
		json_data = json.dumps(callAnalysis, indent=4)
		#print json_data
		with open('data.txt', 'w') as outfile:
			json.dump(json_data, outfile)

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
	#codeAnalyzer.createJsonFile() in the end of tests

	#Caller					#Callee
	#inspect.stack()[1][3], inspect.stack()[0][3]