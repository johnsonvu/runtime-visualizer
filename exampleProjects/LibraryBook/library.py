from book import Book
from collections import namedtuple

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
