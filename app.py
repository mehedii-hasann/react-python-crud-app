from flask import Flask, json, jsonify, render_template, request
from flask_cors import CORS
import pyodbc
import mysql.connector


app = Flask(__name__)
CORS(app)  # Allows cross-origin requests from React

db_config = {
    'user': 'root',
    'password': '',
    'host': 'localhost',
    'database': ''
}

# 'database': 'trades'

file_path = 'static/stock_market_data.json'

table_name = 'trades' # in my case



@app.route('/', methods=['GET'])
def home_page():
    data=[]
    
    if not db_config.get('database'):
        file_path = 'static/stock_market_data.json'
        with open(file_path, 'r') as file:
            data = json.load(file)
        for index, item in enumerate(data):
            item['id'] = index
        with open(file_path, 'w') as file:
            json.dump(data, file)
        return render_template('index.html',data=data,db_config=False)
    else:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT * FROM "+table_name
        cursor.execute(query)
        data = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return render_template('index.html',data=data,db_config=True)


@app.route('/delete-data', methods=['POST'])
def delete_data():
    trade_id = request.json.get('id')
    if db_config.get('database'):
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Delete the trade from the database
        query = "DELETE FROM " + table_name +" WHERE id = %s"
        cursor.execute(query, (trade_id,))

        # Commit the changes and close the connection
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Deleted successfully","success":'true'})
    else:
        data=''
        new_data=[]
        with open(file_path, 'r') as file:
            data = json.load(file)
        for item in data:
            if item.get('id') != trade_id:
                new_data.append(item)
        with open(file_path, 'w') as file:
            json.dump(new_data, file)
        return jsonify({"success":'false'})


@app.route('/update-data', methods=['POST'])
def update_data():
    id = request.json.get('id')
    type = request.json.get('type')
    value = request.json.get('value')
    if db_config.get('database'):
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        query = "UPDATE "+ table_name + " SET "+type+" = %s WHERE id = %s"
        cursor.execute(query, (value, id))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Updated successfully", "success": 'true'})
    else:
        data=''
        with open(file_path, 'r') as file:
            data = json.load(file)
        for item in data:
            if item.get('id') == id:
                item[type]=value
                break
        with open(file_path, 'w') as file:
            json.dump(data, file)
        return jsonify({"success":'false'})


@app.route('/insert-data', methods=['POST'])
def insert_data():
    data = request.json
    if db_config.get('database'):
        trade_code = data.get("trade_code")
        date = data.get("date")
        high = data.get("high")
        low = data.get("low")
        open_price = data.get("open")
        close = data.get("close")
        volume = data.get("volume")

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        query = "INSERT INTO "+ table_name +" (date, trade_code, high, low, open, close, volume) VALUES (%s, %s, %s, %s, %s, %s, %s)"
        cursor.execute(query, (date,trade_code, high, low, open_price, close, volume))

        trade_id = cursor.lastrowid
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": "Inserted successfully", "success": "true","trade_id":trade_id})
    else:
        new_data=''
        with open(file_path, 'r') as file:
            new_data = json.load(file)
        new_data.append(data)
        with open(file_path, 'w') as file:
            json.dump(new_data, file)
        return jsonify({"success":'false'})

    





if __name__ == '__main__':
    app.run(debug=True)
