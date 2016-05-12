from flask import Flask, render_template, jsonify, request, Response
import DB
import datetime
import json

app = Flask(__name__)

@app.route('/')
def template():
	return render_template('index.html')

@app.route('/api/item', methods=['GET', 'POST', 'DELETE'])
def manage_item():
	'''
		Examples:
		-------------------
			Example for GET: 	/api/item?start_date=2015-12-20&end_date=2015-12-30&categories=Food,Fun&page=2&limit=10
			Example for POST: 	/api/item
				{
					date: Date, 
					category: String,
					title: String,
					price: Float
				}
			Example for DELETE: /api/item?id=1234567889
			
		Description:
		-------------------
			Returns list of certain spents, according to filter, 
			Supports GET,POST,DELETE methods

		Response:
		-------------------
		GET response format:
			{"data": 
				[{
					"category": String, 
					"date": Date,
					"id": String,
					"price": Float,
					"title": String
				},
				 ...]
			}
	'''

	if request.method == 'POST':
		data = request.json

		if 'date' in data:
			data['date'] = datetime.datetime.strptime(data['date'][:10], '%Y-%m-%d')

		item = DB.Item(**data)
		item.save()
		return Response({"status": "ok"})
	elif request.method == 'GET':
		d = request.args

		limit = 10
		page = None

		query_dict = {}

		if 'start_date' in d and 'end_date' in d:
			start_date = datetime.datetime.strptime(d['start_date'],'%Y-%m-%d')
			end_date = datetime.datetime.strptime(d['end_date'],'%Y-%m-%d')
			query_dict['date__lte']=end_date
			query_dict['date__gt']=start_date

		if 'categories' in d:
			query_dict['category__in'] = d['categories'].split(',')
		
		if 'page' in d:
			page = d['page']

		if 'limit' in d:
			limit = d
		
		if 'nopagination' in d:
			limit = None
			page = None

		query = DB.Item.objects(**query_dict)[page:limit]

		# START: Solution of http://stackoverflow.com/questions/16586180/typeerror-objectid-is-not-json-serializable
		query = map(lambda o: o.to_json(),query)
		# end: Solution of http://stackoverflow.com/questions/16586180/typeerror-objectid-is-not-json-serializable

		return jsonify(**{"data":list(query)})
	elif request.method == 'DELETE':
		id = request.json['id']

		a = DB.Item.objects.get(id=id).delete()
		return Response({"status": "ok"})

@app.route('/api/item/graph')
def get_graph():
	'''
		Examples:
		-------------------
			Example: /api/item/graph?start_date=2015-12-20&end_date=2015-12-30
	
		Description:
		-------------------
			Returns data formated specially for charts. Allows filtering by
			date and categories

		Response :
		-------------------
		{
			data:[{
				name: String,
				values: [
					{x:Date, y:value}, ...
				]
			}, ...]
		}
	'''

	d = request.args

	matcher = {}
	
	if 'start_date' in d and 'end_date' in d:
		start_date = datetime.datetime.strptime(d['start_date'],'%Y-%m-%d')
		end_date = datetime.datetime.strptime(d['end_date'],'%Y-%m-%d')

		matcher['date']	= {
			'$gte': start_date,
			'$lte': end_date	
		}
	else:

		start_date, end_date = datetime.datetime.today()-(datetime.datetime.today()-DB.Item.objects.order_by('date')[0]['date']), datetime.datetime.today()

		matcher['date'] = {
			'$gte': start_date,
			'$lte': end_date
		}

	dates = [(start_date+datetime.timedelta(days=i)).date() for i in range((end_date-start_date).days) ]

	query = DB.Item.objects.aggregate(*[
			{'$match': matcher},
			{'$group': {
				'_id': {'date':'$date','category':'$category'},
				'total': {'$sum':'$price'}
			}},
			{'$group': {
				'_id': '$_id.category',
				'values': {'$push': {'x': '$_id.date', 'y':'$total'}}
			}}, 
			{'$project': {
				'values':1,
				'_id':0,
				'name': '$_id'
			}}
		])

	data = list(query)
	res = list() 

	# Resolving 0- y values for categories with no pays for certain days
	for d in data:
		present_dates = map(lambda date : date['x'].date(), d['values'])
		print d, present_dates, dates
		d['values'] = map(lambda date: {'x':date.strftime('%Y-%m-%d'),'y': d['values'][present_dates.index(date)]['y']} if date in present_dates else {'x':date.strftime('%Y-%m-%d'), 'y':0}, dates)
		res.append(d)
		d['start_date'] = start_date
		d['end_date'] = end_date

	return jsonify(**{'data':list(res)})

if __name__ == '__main__':
	app.run(debug=True)