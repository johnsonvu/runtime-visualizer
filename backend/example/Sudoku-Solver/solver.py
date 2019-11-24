"""
 sudoku model and solver.

 author: Daniel Nephin
"""

import re
from itertools import ifilterfalse, chain, ifilter
import logging
from copy import deepcopy
from memory_profiler import profile

log = logging
fp=open('logfile.txt','w+')

class Square(object):
	""" 
	A square on the board.
	This object is used so that there is a reference to the area, and i can 
	index by both rows and columns. It evaluates to the number it holds to 
	simplify checks for complete games, and possible moves.
	"""
	@profile(precision=7,stream=fp)
	def __init__(self, num):
		self.value = int(num)
		self.options = set() if self.value else set(range(1,10))
		
	@profile(precision=7,stream=fp)
	def __eq__(self, other):
		if hasattr(other, 'value'):
			return self.value == other.value
		return self.value == other
	@profile(precision=7,stream=fp)
	def __ne__(self, other):
		return not self.__eq__(other)
	@profile(precision=7,stream=fp)
	def __hash__(self):
		return self.value
	@profile(precision=7,stream=fp)
	def __nonzero__(self):
		return bool(self.value)
	@profile(precision=7,stream=fp)
	def __repr__(self):
		return "%r" % (self.value) if self.value else "_"
	@profile(precision=7,stream=fp)
	def set(self, options):
		self.options = options
		return self.check()
	@profile(precision=7,stream=fp)
	def check(self):
		if len(self.options) == 1:
			self.value = self.options.pop() 
			return True
		return False
		

class SudokuBoard(object):
	" Model of a Sudoku board, with convenience functions "

	@profile(precision=7,stream=fp)
	def __init__(self, initial_state=None):
		self.rows = self.load_board(initial_state)

		if not self.rows:
			self.rows = [[Square(int(0)) for s in range(9)] for row in range(9)]

		# index cols
		self.cols = []
		for c in range(9):
			self.cols.append([])
			for r in range(9):
				self.cols[c].append(self.rows[r][c])


	@profile(precision=7,stream=fp)
	def load_board(self, board):
		"""
		Load a board from a list of strings.
		"""
		if not board:
			return None
		if len(board) < 9:
			return None

		sboard = []
		for r in range(9):
			sboard.append([Square(s) for s in re.sub('\s+', '', board[r])])
		return sboard

	@profile(precision=7,stream=fp)
	def __repr__(self):
		" return the board as a string "
		s = ""
		for r in range(9):
			s += ("%s%s%s " * 3) % tuple("%s" % s for s in self.rows[r]) + "\n"
			if r % 3 == 2:
				s += "\n"
		return s


	@profile(precision=7,stream=fp)
	def show_options(self):
		" return a representation of the board based on the options per square "
		s = ""
		row_string = "[%9s] [%9s] [%9s]   " * 3 + "\n"
		for i in range(9):
			r = self.rows[i]
			s += row_string % tuple(
					[("%s" * len(s.options)) % tuple(s.options) for s in r])
			if i % 3 ==  2:
				s += "\n"
		return s

	@profile(precision=7,stream=fp)
	def find_options_for(self, r, c, index):
		"""
		Return a list of possible options for a square on the board. Checks
		the row, column, and cube for existing numbers. 
		"""
		
		other_index = self.cols if index == self.rows else self.rows

		options = index[r][c].options
		options -= set(index[r])
		options -= set(other_index[c])
		options -= set(self.get_cube(r, c, index))
		return options


	@profile(precision=7,stream=fp)
	def identify_only_possibility(self, r, c):
		"""
		Determines if one of the options for this square is the only possibility
		for that option in a row, column, or cube. Making it the correct option.
		"""
		target = self.rows[r][c]

		for related_list in (self.rows[r], self.cols[c], 
				self.get_cube(r, c, self.rows)):
			others_options = set()
			for square in ifilterfalse(lambda s: s is target, related_list):
				others_options |= set(square.options)
			options = target.options - others_options
			if len(options) == 1:
				return options
		return False


	@profile(precision=7,stream=fp)
	def find_isolation_lines(self, row_min, col_min):
		"""
		Given a coordinate in a cube, find any isolated rows or column which 
		restrict an option to that row or column.  Then remove that number as 
		an option from any other cubes that are aligned with this cube.
		"""
		solitary_rows = set()
		solitary_cols = set()

		solved_count = 0

		for r in range(row_min, row_min+3):
			for c in range(col_min, col_min+3):
				if not self.rows[r][c]:	
					solitary_rows.add(r)
					solitary_cols.add(c)
			
		if len(solitary_rows) == 1:
			solved_count += self._update_options(self.rows, self.cols, 
					solitary_rows.pop(), row_min, col_min)
			
		if len(solitary_cols) == 1:
			solved_count += self._update_options(self.cols, self.rows, 
					solitary_cols.pop(), col_min, row_min)

		return solved_count


	@profile(precision=7,stream=fp)
	def _update_options(self, pri_dir, sec_dir, selected, pri_min, sec_min):
		"""
		Helper function for find_isolated_lines.  Updates the options for other
		rows/cols aligned with the isolated row/col that was identified by
		find_isolated_lines.
		"""
		solved_count = 0

		restricted_options = set()
		for sec_index in range(sec_min,sec_min+3):
			restricted_options |= self.find_options_for(
					selected, sec_index, pri_dir)

		# get the other (row/col) of cubes that share this cubes (row/col)
		log.debug("Current state of game board:\n%s", self)
		for p in ifilter(lambda i: i < sec_min or i > sec_min+2, range(9)):
			square = sec_dir[p][selected]
			if not square:
				d =  "cols" if (pri_dir == self.rows) else "rows"
				log.debug("Removing %s from %s %d" % (
						restricted_options, d, selected))
				square.options -= restricted_options
				if square.check():
					solved_count += 1
		return solved_count


	@profile(precision=7,stream=fp)
	def get_cube(self, r, c, index):
		" Return the local cube of 9 squares for a given row and column, as a list. "
		row_min = r / 3 * 3
		col_min = c / 3 * 3
		cube = list(chain(
			*(r[col_min:col_min+3] for r in index[row_min:row_min+3])))
		return cube


	@profile(precision=7,stream=fp)
	def solved(self):
		" Returns true when the puzzle is complete "
		good_set = set(range(1,10))
		for r in self.rows:
			if set(r) != good_set:
				return False
		for c in self.cols:
			if set(c) != good_set:
				return False
		for r in range(0,9,3):
			for c in range(0,9,3):
				if set(self.get_cube(r,c, self.rows)) != good_set:
					return False
		return True

	@profile(precision=7,stream=fp)
	def get_status(self):
		"""
		Return a status tuple which represents the current state of the board
		being solved. The tuple is in the form (num_solved_squares, num_options).
		"""
		total_solved = 0
		total_options = 0
		
		for r in self.rows:
			for s in r:
				total_solved += int(bool(s))
				total_options += len(s.options)
		return (total_solved, total_options)


	@profile(precision=7,stream=fp)
	def check_board(self):
		"""
		Check all squares for completion.
		"""
		((s.check() for s in r) for r in self.rows)


	@profile(precision=7,stream=fp)
	def find_number_pairs_in_cube(self, row_min, col_min):
		"""
		If two numbers are options in only two places within a cube, then all
		other options in that square should be removed, and other items checked.
		"""
		options = []
		pairs = []
		log.debug("Current state of game board:\n%s\n%s", 
				self, self.show_options())
		for square in self.get_cube(row_min, col_min, self.rows):
			if len(square.options) != 2:
				continue

			for option_square in options:
				if square.options == option_square.options:
					log.debug("Adding %s to pairs." % (square.options))
					pairs.append((square, option_square))
					break
			else:
				log.debug("Adding %s to options." % (square.options))
				options.append(square)

		# now remove this options from other squares in the cube
		for items in pairs:
			remove_options = items[0].options
			for square in self.get_cube(row_min, col_min, self.rows):
				if square or square is items[0] or square is items[1]:
					continue
				log.debug("Removing %s from square in cube (%d,%s)" % (
							remove_options, row_min, col_min))
				square.options -= remove_options
			
				
	@profile(precision=7,stream=fp)
	def all_squares(self):
		"""
		Generator which returns tuples of all the squares on the board
		with their row id and col id (r, c, square)
		"""
		for r in range(9):
			for c in range(9):
				yield (r, c, self.rows[r][c])

	@profile(precision=7,stream=fp)
	def all_cubes(self):
		"""
		Generator which returns tuples of the first row/col in each
		cube.
		"""
		for cube_r in range(3):
			for cube_c in range(3):
				yield (cube_r * 3, cube_c * 3)



@profile(precision=7,stream=fp)
def find_unsolved_square(board):
	"""
	Find a square that has not been solved.
	"""
	for (r, c, square) in board.all_squares():
		if square:
			continue
		return (r, c) 


@profile(precision=7,stream=fp)
def solve(board, print_cycle=10, guess=False):
	" Solve the puzzle "

	prev_status = None
	saved_board = None

	counter = 0

	while True:
		for (r, c, square) in board.all_squares():
			# skip solved squares
			if square:
				continue
			if square.set(board.find_options_for(r, c, board.rows)):
				log.info("found %s,%s through find_options" % (r,c))
				continue
			option = board.identify_only_possibility(r, c)
			if option:
				log.info("found %s,%s through identify_only" % (r,c))
				square.set(option)

		for (r, c) in board.all_cubes():
			solved = board.find_isolation_lines(r, c)
			if solved:
				log.debug("Current state of game board:\n%", board)
				log.debug(board.show_options())
				log.info("found %d using find_isolation_lines." % solved)

		for (r, c) in board.all_cubes():
			board.find_number_pairs_in_cube(r, c)
	
		board.check_board()

		counter += 1
		if board.solved():
			print "Solved in %d rounds." % counter
			return board

		status = board.get_status()
		if status == prev_status:
			if guess:
				return None

			# time to guess
			(r, c) = find_unsolved_square(board)
			for choice in board.rows[r][c].options:
				log.info("Guessing %d for %d,%d" % (choice, r, c))
				new_board = deepcopy(board)
				new_board.rows[r][c].set(set([choice]))
				if solve(new_board, guess=True):
					return new_board
			print new_board
			print new_board.show_options()
			return None

		prev_status = status

		if counter % print_cycle == print_cycle - 1:
			print board
			print board.show_options()



if __name__ == "__main__":
	import boards
	import sys
	logging.basicConfig(level=logging.INFO)

	board = solve(SudokuBoard(boards.board_easy))
	print board
	print "Game won!" if board else "Lost!"

