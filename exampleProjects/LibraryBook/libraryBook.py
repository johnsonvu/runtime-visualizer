from collections import namedtuple
from tabulate import tabulate
from memory_profiler import profile

class Library(object):
    def __init__(self):
        self.books = []

    def addBook(self, book):
        self.books.append(book)

    def searchBookISBN(self, ISBN):
        for book in self.books:
            if book.ISBN == ISBN:
                return book

    def searchBookAuthor(self, author):
        written_by_author = []
        for book in self.books:
            if book.author == author:
                written_by_author.append(book)
        return written_by_author

    def searchUnderPrice(self, price):
        books_under_price = []
        for book in self.books:
            if book.price < price:
                books_under_price.append(book)
        return books_under_price
		
    def getBookInformation(self):
        myList = []
        for book in self.books:
            entry = [book.subject, book.author, book.findTopThreeAverageRating(), book.findBottomThreeAverageRating(), book.getAverageRatings()]
            myList.append(entry)
        return myList
			
	

class Book:
	def __init__(self, subject, author, ISBN, price, ratings):
		self.subject = subject
		self.author = author
		self.ISBN = ISBN
		self.price = price
		self.ratings = ratings
        
	def getRatings(self):
		return self.ratings
        
	def getAverageRatings(self):
		average = 0
		for rating in self.ratings:
			average += rating
		return average/ len(self.ratings)
	
	def getLowestRating(self):
		lowest = 100
		for rating in self.ratings:
			if rating <= lowest:
				lowest = rating
		return lowest

	def findTopThreeAverageRating(self):
		largest, largest2, largest3, index1,index2, index3 = None,None,None,None,None,None
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
		return (largest + largest2 + largest3)/3

	def findBottomThreeAverageRating(self):
		smallest = 100
		smallest2 = 100
		smallest3 = 100
		for i in range(len(self.ratings)):
			val = self.ratings[i]
			if val < smallest:
				smallest3 = smallest2
				smallest2 = smallest
				smallest = val
				continue
			if val < smallest2:
				smallest3 = smallest2
				smallest2 = val
				continue
			if val < smallest3:
				smallest3 = val

		return (smallest+smallest2+smallest3)/3
	
	def changeRatingstoTopThreeAverage(self):
		average = self.findTopThreeAverageRating()
		for i in range(len(self.ratings)):
			self.ratings[i] = average
		
	

if __name__ == '__main__':
	EOSC112 = Book('Geometry', 'Jeff Potter', '0596805888', 22, [92,24,54,54,32,43,53,64,64,34,54,23,76,85,34,23,64,23,54,14,13,52,53])
	library = Library()
	MATH315 = Book('Math', 'George Harr', '0594805888', 15, [1,2,3,4,5])
	ENGL112 = Book('English', 'James Odd', '0596225888', 100, [9,8,7,5])
	PHYS304 = Book('Physics', 'Jeff Potter', '0597884512', 120, [1,1,1,1,1,1,1])
	library.addBook(EOSC112)
	library.addBook(MATH315)
	library.addBook(ENGL112)
	library.addBook(PHYS304)
	print(tabulate(library.getBookInformation(), headers=['Subject', 'Author', 'Average High Rating', 'Average Low Rating', 'Average Rating']))