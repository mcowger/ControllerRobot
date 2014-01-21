import logging
import json

from flask import Flask, request
from flask import render_template
from hammock import Hammock


app = Flask(__name__)
app.config.from_object('ControllerRobot.settings')

spark = Hammock('https://api.spark.io/v1')
access_token = '7498b9430afdcd646a26ace97fe851eacfa35c0b'
device_id = '48ff72065067555031521187'

logger = logging.getLogger()
#logger.config.fileConfig("%s/%s" % (os.getcwd(), "log.cfg"))



@app.route('/')
def index():
    return render_template('index.html', site_name=app.config['SITE_NAME'])


@app.route('/about')
def about():
    return render_template('about.html', site_name=app.config['SITE_NAME'])


@app.route('/test')
def test():
    return render_template('test.html', site_name=app.config['SITE_NAME'])


@app.route('/contact')
def contact():
    return render_template('about.html', site_name=app.config['SITE_NAME'])


@app.route('/drive', methods=['POST'])
def drive():
    mydata = json.loads(request.data)
    if int(mydata['Y']) > 50:
        logger.info("Setting PIN HIGH")
        spark.devices(device_id).digitalwrite.POST(data={'access_token': access_token, 'args': 'D7,HIGH'})
    else:
        logger.info("Setting PIN LOW")
        spark.devices(device_id).digitalwrite.POST(data={'access_token': access_token, 'args': 'D7,LOW'})
    return json.dumps({"status": "OK"})


@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404