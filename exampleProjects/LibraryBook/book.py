from memory_profiler import profile

class Book:
	def __init__(self, subject, author, ISBN, price, ratings):
		self.subject = subject
		self.author = author
		self.ISBN = ISBN
		self.price = price
		self.ratings = ratings
		
	@profile
	def findTopThreeAverageRating(self):
		largest = None
		largest2 = None
		largest3 = None
		index1 = None
		index2 = None
		index3 = None
		mylist = self.ratings
		for i in range(len(mylist)):
			if largest <= mylist[i] and i != index1 and i != index2 and i != index3:
				largest = mylist[i]
				index1 = i
		
			for j in range(i+1, len(mylist)):
				if largest2 <= mylist[j] and j != index1 and j != index2 and j != index3:
					largest2 = mylist[j]
					index2 = j
				
				for k in range(j+1, len(mylist)):
					if largest3 <= mylist[k] and k != index1 and k != index2 and k != index3:
						largest3 = mylist[k]
						index3 = k
		
		#print "largest: {}".format(largest)
		#print "largest2: {}".format(largest2)		
		#print "largest3: {}".format(largest3)
		return (largest + largest2 + largest3)/3