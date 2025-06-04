from flask import Flask
import mysql.connector
import configparser

app = Flask(__name__)

# Load configuration
config = configparser.ConfigParser()
config.read('/opt/webapp/config.ini')

@app.route('/')
def hello():
    try:
        conn = mysql.connector.connect(
            host=config['DATABASE']['host'],
            user=config['DATABASE']['user'],
            password=config['DATABASE']['password'],
            database=config['DATABASE']['database']
        )
        cursor = conn.cursor()
        cursor.execute("SELECT message FROM test_table")
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return f"Web App Running! DB Message: {result[0]}"
    except Exception as e:
        return f"Error connecting to DB: {str(e)}"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)