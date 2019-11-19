#Method
	def mysteriousMethod(self):
		largest = 0
		largest2 = 0
		largest3 = 0
		for i in range(len(self.ratings)):
			val = self.ratings[i]
			if val > largest:
				largest3 = largest2
				largest2 = largest
				largest = val
				continue
			if val > largest2:
				largest3 = largest2
				largest2 = val
				continue
			if val > largest3:
				largest3 = val

		return (largest+largest2+largest3)/3


#Test
	def test_msyeriousMethoid(self):
		print "Myster\n"
		start = timer()
		self.assertEqual(self.EOSC112.mysteriousMethod(), 84)
		end = timer()
		print(end - start) # Time in seconds, e.g. 5.38091952400282
		

