import unittest
from libraryBook import Library, Book
from timeit import default_timer as timer
from codeAnalyzer import codeAnalyzer


class TestLibrary(unittest.TestCase):
	def setUp(self):
		print "Test setup Libary\n"
		self.library = Library()
		EOSC112 = Book('Geometry', 'Jeff Potter', '0596805888', 22, [92,24,54,54,32,43,53,64,64,34,54,23,76,85,34,23,64,23,54,14,13,52,53])
		MATH315 = Book('Math', 'George Harr', '0594805888', 15, [1,2,3,4,5])
		ENGL112 = Book('English', 'James Odd', '0596225888', 100, [9,8,7,5])
		PHYS304 = Book('Physics', 'Jeff Potter', '0597884512', 120, [1,1,1,1,1,1,1])
		self.library.addBook(EOSC112)
		self.library.addBook(MATH315)
		self.library.addBook(ENGL112)
		self.library.addBook(PHYS304)

	def tearDown(self):
		print "Test tear down\n"

	# def test_librarySearch(self):
	# 	self.assertEquals(self.library.searchBookISBN('0594805888'), 0)
	# 	self.ibrary.searchBookAuthor('George Harr')
	# 	self.library.searchUnderPrice(20)


class TestBook(unittest.TestCase):
	
	def setUp(self):
		print "Books Test Setup\n"
		self.EOSC112 = Book('Geometry', 'Jeff Potter', '0596805888', 22, [92,24,54,54,32,43,53,64,64,34,54,23,76,85,34,23,64,23,54,14,13,52,53])
		self.MATH315 = Book('Math', 'George Harr', '0594805888', 15, [1,2,3,4,5])
		self.ENGL112 = Book('English', 'James Odd', '0596225888', 100, [9,8,7,5])
		self.PHYS304 = Book('Physics', 'Jeff Potter', '0597884512', 120, [1,1,1,1,1,1,1])
		
	def tearDown(self):
		print "\nBooks Test Tear Down"
		
	def test_findTopThreeAverageRating(self):
		codeAnalyzer.appendTestData()
		print "Test - Top Three Average Rating"
		start = timer()
		self.assertEqual(self.EOSC112.findTopThreeAverageRating(), 84)
		end = timer()
		print "Time Elapsed: {}".format(end - start)
		self.assertEqual(self.EOSC112.getLowestRating(), 13)
		
	def test_findTopThreeAverageRating11111111111111111(self):
		print "Test - Top Three Average Rating"
		start = timer()
		self.assertEqual(self.EOSC112.findTopThreeAverageRating(), 84)
		end = timer()
		print "Time Elapsed: {}".format(end - start)
		self.assertEqual(self.EOSC112.getLowestRating(), 13)
		
if __name__ == '__main__':
	unittest.main(exit=False)
	print(codeAnalyzer.getCallOccurrence())
	codeAnalyzer.createJsonFile()