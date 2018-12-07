import pandas as pd

from flask import Flask, jsonify, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/categories')
def categories():
    return jsonify([
        'Suicide',
        'Officer Involved',
        'Self Defense',
        'Armed Robbery',
        'Drugs Involved',
        'Gangs Involved',
        'Terrorism',
        'Accidental',
    ])

@app.route('/statistics')
def statistics():
    return jsonify([
        { 'id': 1, 'name': 'Population' },
        { 'id': 2, 'name': 'Number of Gun Owned' },
        { 'id': 3, 'name': 'Gun Friendliness Rating' },
        { 'id': 4, 'name': 'Median Income' }
    ])

@app.route('/data', methods=['POST'])
def data():
    return jsonify({
        'y_axis': 'Incidents',
        'pivot': ['State'],
        'data': {
            'CA': {
                'y_axis': 1000
            },
            'PA': {
                'y_axis': 2000
            },
            'TX': {
                'y_axis': 1500
            }
        }
    })
    #data = request.get_json()
    # incidents, killed, injured
    #y_axis = data['yAxis']['value']
    # one of the supplementary stats
    #x_axis = data.get('xAxis')
    #x_axis = int(xAxis['id']) if xAxis else None
    # one of the supplementary stats
    #z_axis = data.get('zAxis')
    #z_axis = int(zAxis['id']) if zAxis else None
    # pivots
    #pivots = [item['value'] for item in data['pivotBy']]
    #inc_cat = data['includeCategories']
    #inc_cat = data['excludeCategories']

    # 1.Apply filter to the incidents by inclusive and exclusive categories
    # SELECT i.* FROM incidents i
    # INNER JOIN (SELECT incident_id FROM incident_categories ) incident_categories ic on ic.incident_id = i.id
    
    # These are the incidents that should be included (INC)
    # SELECT ic.incident_id FROM incident_categories ic INNER JOIN categories c on ic.category_id = c.id where c.name in (<inc cat list>) group by ic.incident_id

    # These are the incidents that should be excluded (EXC)
    # SELECT ic.incident_id FROM incident_categories ic INNER JOIN categories c on ic.category_id = c.id where c.name in (<exc cat list>) group by ic.incident_id

    # Filtered incidents (FIL)
    # SELECT i.id FROM incidents i
    # INNER JOIN INC inc ON i.id == inc.incident_id
    # LEFT  JOIN EXC exc ON i.id == exc.incident_id
    # WHERE exc.incident_id IS NULL

    # 2. Pivot (examples)
    # Incidents by victim age
    # SELECT p.age, COUNT(p.age) FROM participants p 
    # INNER JOIN FIL on FIL.incident
    # WHERE p.type = 'Victim'
    # GROUP BY p.age
    
    # Killed by victim age
    # SELECT p.age, COUNT(p.age) FROM participants p 
    # INNER JOIN FIL on FIL.incident
    # WHERE p.type = 'Victim' AND p.status LIKE 'Killed' 
    # GROUP BY p.age
    
    # Injured by victim age
    # SELECT p.age, COUNT(p.age) FROM participants p 
    # INNER JOIN FIL on FIL.incident
    # WHERE p.type = 'Victim' AND p.status LIKE 'Injured'
    # GROUP BY p.age

    #By State

if __name__ == '__main__':
    app.run(debug=True)
