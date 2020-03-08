from flask import Flask, render_template, jsonify, request, Response, redirect
import json
import pandas as pd
import numpy as np
from matplotlib import pyplot as plt
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder

app = Flask(__name__)
df = pd.read_csv('VisData.csv')


@app.route('/', methods=['POST', 'GET'])
def index():
    if request.method == 'POST':
        print(request.form['task'], request.form['datatype'])
        return jsonify(df.shape)
    print(df.shape)
    return render_template('index.html', data=jsonify({'title': 'Scree Plot of PCA Components'}))


if __name__ == '__main__':
    app.run()
