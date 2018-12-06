import pandas as pd
import numpy as np

file = '../data/data-dirty.csv'

df = pd.read_csv(file, encoding='UTF-8')
df = df.loc[:,['date', 
          'state',
          'n_killed',
          'n_injured',
          'participant_age',
          'participant_gender', 
          'participant_status',
          'participant_type']]
df.to_csv('../data/data-clean.csv')

