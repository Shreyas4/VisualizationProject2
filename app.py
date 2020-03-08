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


@app.route('/')

@app.route('/screePCA')
def screePCA():
    print(df.shape)
    return render_template('index.html', data=jsonify({'title': 'Scree Plot of PCA Components'}))


@app.route('/screePCALoadings')
def screePCALoadings():
    return render_template('index.html')


@app.route('/scatter2PCA')
def scatter2PCA():
    return render_template('index.html')


@app.route('/mdsEu')
def mdsEu():
    return render_template('index.html')


@app.route('/mdsCo')
def mdsCo():
    return render_template('index.html')


@app.route('/scatterMa')
def scatterMa():
    return render_template('index.html')


if __name__ == '__main__':
    app.run()
