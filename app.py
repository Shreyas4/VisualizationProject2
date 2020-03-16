from flask import Flask, render_template, jsonify, request
import pandas as pd

import utils

app = Flask(__name__)
df = pd.read_csv('VisData.csv')
df = utils.preprocess(df)


@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':
        task = request.form['task']
        datatype = request.form['datatype']
        process_df = df
        if datatype == 'rn':
            process_df = utils.randomsampler(df)
        elif datatype == 'st':
            process_df = utils.stratsampler(df)

        if task == 'screePCA':
            return jsonify(utils.screePCAHandler(process_df, datatype))
        elif task == 'screePCALoadings':
            return jsonify(utils.screePCALoadingsHandler(process_df, datatype))
        elif task == 'scatter2PCA':
            return jsonify(utils.scatter2PCAHandler(process_df, datatype))
        elif task == 'mdsEu':
            return jsonify(utils.mdsEuHandler(process_df, datatype))
        elif task == 'mdsCo':
            return jsonify(utils.mdsCoHandler(process_df, datatype))
        elif task == 'scatterMa':
            return jsonify(utils.scatterMaHandler(process_df, datatype))
        else:
            return render_template(index.html)
    return render_template('index.html')


if __name__ == '__main__':
    app.run()
