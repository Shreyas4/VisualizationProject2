import pandas as pd
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder


def preprocess(df):
    df = df.drop(['State', 'County', 'NO2_Units', 'O3_Units', 'SO2_Units', 'CO_Units'], axis=1)
    for col in ['O3_Mean', 'O3_1st_Max_Value', 'CO_Mean', 'CO_1st_Max_Value']:
        df[col] = df[col].apply(lambda x: x * 1000)
    for col in ['NO2_1st_Max_Hour', 'O3_1st_Max_Hour', 'SO2_1st_Max_Hour', 'CO_1st_Max_Hour']:
        df[col] = df[col].apply(lambda x: int(x / 8) + 1)
    df['Year'] = df['Year'].apply(lambda x: x % 3)
    # df
    cats = ['Year', 'NO2_1st_Max_Hour', 'O3_1st_Max_Hour', 'SO2_1st_Max_Hour', 'CO_1st_Max_Hour']
    for col in cats:
        df[col] = df[col].astype(object)
    df = pd.concat([df, pd.get_dummies(df[cats])], axis=1)
    df = df.drop(cats, axis=1)
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


def screePCAHandler(df):
    return None


def screePCALoadingsHandler(df):
    return None


def scatter2PCAHandler(df):
    return None


def mdsEuHandler(df):
    return None


def mdsCoHandler(df):
    return None


def scatterMaHandler(df):
    return None
