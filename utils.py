import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler, LabelEncoder, MinMaxScaler
import numpy as np

data_type = {
    'og': 'original data',
    'rn': 'random sampled data',
    'st': 'stratified sampled data'
}


def preprocess(df):
    # df = df.drop(['State', 'County', 'NO2_Units', 'O3_Units', 'SO2_Units', 'CO_Units'], axis=1)
    df = df.drop(['State', 'County', 'NO2_Units', 'O3_Units', 'SO2_Units', 'CO_Units'], axis=1)
    le = LabelEncoder()
    for col in df.columns.values:
        if df[col].dtype == object:
            df[col] = le.fit_transform(df[col])
    for col in ['O3_Mean', 'O3_1st_Max_Value', 'CO_Mean', 'CO_1st_Max_Value']:
        df[col] = df[col].apply(lambda x: x * 1000)
    # for col in ['NO2_1st_Max_Hour', 'O3_1st_Max_Hour', 'SO2_1st_Max_Hour', 'CO_1st_Max_Hour']:
    #     df[col] = df[col].apply(lambda x: int(x / 8) + 1)
    # df['Year'] = df['Year'].apply(lambda x: x % 3)
    # # df
    # cats = ['Year', 'NO2_1st_Max_Hour', 'O3_1st_Max_Hour', 'SO2_1st_Max_Hour', 'CO_1st_Max_Hour']
    # for col in cats:
    #     df[col] = df[col].astype(object)
    # df = pd.concat([df, pd.get_dummies(df[cats])], axis=1)
    # df = df.drop(cats, axis=1)
    kmeans = KMeans(n_clusters=4, init='k-means++', max_iter=300, n_init=10, random_state=0)
    pred_y = kmeans.fit_predict(df)
    df['Cluster'] = pred_y
    return df


def randomsampler(df):
    return df.sample(frac=0.30, replace=True, random_state=1)


def stratsampler(df):
    needed_len = int(df.shape[0] * 0.30)
    points_from_one_cluster = int(needed_len / 4)
    firstDf = df[df['Cluster'] == 0].sample(n=points_from_one_cluster, replace=True, random_state=1)
    for i in range(1, 4):
        firstDf = pd.concat(
            [firstDf, df[df['Cluster'] == i].sample(n=points_from_one_cluster, replace=True, random_state=1)],
            ignore_index=True)
    return firstDf


def screePCAHandler(df, datatype):
    pca = PCA(n_components=df.shape[1])
    x = MinMaxScaler().fit_transform(df)
    principalComponents = pca.fit_transform(x)
    limit = 0
    sum_ = 0
    for i in range(0, df.shape[1]):
        if sum_ <= 0.75:
            sum_ = sum_ + pca.explained_variance_ratio_[i]
            limit = i
        else:
            break
    columns = ['PC' + str(x) for x in range(1, df.shape[1]+1)]

    percent_variance = np.round(pca.explained_variance_ratio_ * 100, decimals=2)

    running_sum = [round(list(percent_variance)[i]+ sum(list(percent_variance)[:i]), 2) for i in range(0, len(list(percent_variance)))]

    data = {'Chart Title': 'Scree Plot of PCA Vectors for '+data_type[datatype], 'xlabel': 'PCA Vectors', 'ylabel': 'Percentage of explained '
                                                                                           'variance',
            'xticks': columns[:15], 'yticks': list(percent_variance)[:15], 'threshold-x':columns[limit],
            'threshold': list(percent_variance)[limit], 'Acceptable variance explained':
                round(sum_*100, 2), 'running_sum': running_sum[:15], 'limit':limit+1
            }
    return data


def screePCALoadingsHandler(df, datatype):
    pca = PCA(n_components=df.shape[1])
    x = MinMaxScaler().fit_transform(df)
    principalComponents = pca.fit_transform(x)
    limit = 0
    sum_ = 0
    for i in range(0, df.shape[1]):
        if sum_ <= 0.75:
            sum_ = sum_ + pca.explained_variance_ratio_[i]
            limit = i
        else:
            break
    columns = ['PC' + str(x) for x in range(1, limit + 2)]
    pcaComponents = pd.DataFrame(data=abs(pca.components_[:, :limit + 1]), columns=columns)
    pcaComponents['Features'] = df.columns.values
    pcaComponents['SumSquared'] = 0
    l = []
    for i, r in pcaComponents.iterrows():
        l.append(round(sum(x * x for x in r['PC1':'PC' + str(limit + 1)].values), 4))
    pcaComponents['SumSquared'] = l
    pcaComponents = pcaComponents.sort_values(by='SumSquared', ascending=False)
    # pca highest loadings
    data = {'Chart Title': 'Top 3 attributes with highest PCA loadings for '+data_type[datatype], 'xlabel': 'Attributes', 'ylabel': 'Sum of squared loadings'
                                                                                                                   'variance',
            'xticks': list(pcaComponents['Features'])[:15],'threshold-x':list(pcaComponents['Features'])[2], 'threshold':list(pcaComponents['SumSquared'])[2], 'yticks': list(pcaComponents['SumSquared'])[:15]}
    return data


def scatter2PCAHandler(df, datatype):
    return None


def mdsEuHandler(df, datatype):
    return None


def mdsCoHandler(df, datatype):
    return None


def scatterMaHandler(df, datatype):
    return None
