#!/usr/bin/python

# Import the book chapters csv
#python bookchapters.py ../data/bookchapters.csv amber11 book

import csv
import sys
import pymongo
from string import capwords, lower, capitalize

def error(no):
	if(no == 1):
		print 'Missing parameters ..'
		print 'Usage: ' + sys.argv[0] + ' input.csv server:port databasename' 

	elif(no == 2):
		print 'Error opening database ' + sys.argv[2] + ' ' + sys.argv[3]

	elif(no == 3):
		print 'Error during IO of input file'

	sys.exit(no)

# Verify the length of the command line	
if len(sys.argv) < 4:
	error(1)

# Open the database

# connect with the database
try:
	conn = pymongo.Connection(sys.argv[2])
	db = conn[sys.argv[3]]
	print 'Connection OK'
except:
	error(2)

#try:	
f = open(sys.argv[1],'rb')

reader = csv.reader(f)
count = 0
title = None
for row in reader:
	if row[0] == '' and row[1] == '':
		# Ignore when first two cols are blank
		if title <> None :
			print '   %d records ..\n'%(count) 
			title = None 
		continue

	if row[0] == '' and row[1] <> '':
		# Set the new title title
		title = row[1]
		count = 0
		print 'Title : ' + title
	
		newt = capwords(lower(title)) 	
		# upload the title and get the id
		tid = db['chapters'].insert({'name': newt})

	if row[0] <> '':
		# This is some slide information
		print '    ' + str(row)
		count = count + 1
		
		try: 
			num = int(row[0])
		except:
			num = 0
		if num:
			# Upload the image
			newn = capitalize(lower(row[1]))
			iid = db['images'].insert({'name': newn, 'title':tid, 'num': num}) 
print 'Done ..'

#except:
#	error(3)
