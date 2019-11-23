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
#Instantiate static class  
codeAnalyzer = CodeAnalyzer()


#Inject calls
	#import inspect
	#from codeAnalyzer import codeAnalyzer

	#functionName = functionname  					#using JS read function name instead of inspectStack
	#caller = inspect.stack()[1][3]
	#codeAnalyzer.updateCallOccurrence(functionName)
		#OR for Loops 
	#codeAnalyzer.updateCallOccurrence("{} - For Loop lvl 1".format(functionName)

	#Caller					#Callee
	#inspect.stack()[1][3], inspect.stack()[0][3]