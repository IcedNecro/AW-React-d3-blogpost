from mongoengine import *
import datetime

connect('react_training')

class Item(Document):
	price = FloatField(default=0)
	title = StringField(required=True)
	date = DateTimeField(default=datetime.datetime.now)
	category = StringField(required=True)
	
	# START: Solution of http://stackoverflow.com/questions/16586180/typeerror-objectid-is-not-json-serializable
	def to_json(self):
		return {
			'id': str(self.id),
			'date': self.date,
			'title': self.title,
			'category': self.category,
			'price': self.price
		}
	# END: Solution of http://stackoverflow.com/questions/16586180/typeerror-objectid-is-not-json-serializable
		
