import unittest
from libraryBook import Library, Book

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
		print "Test - Top Three Average Rating"
		self.assertEqual(self.EOSC112.findTopThreeAverageRating(), 84)
		print "Test - Lowest Rating"
		self.assertEqual(self.EOSC112.getLowestRating(), 13)
		
if __name__ == '__main__':
	unittest.main(exit=False)