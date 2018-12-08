
# coding: utf-8

# In[1]:


from db_scheme import engine, Incident, Category, Participant
import pandas as pd
from datetime import datetime as dt
from sqlalchemy.orm import sessionmaker
from us_state_abbrev import us_state_abbrev as abr
import time


# In[2]:


Session = sessionmaker(bind=engine)


# In[3]:


session = Session()


# In[4]:


csv_data = pd.read_csv('../data/data-clean.csv', parse_dates=['date'])
csv_data['incident_characteristics'] = csv_data['incident_characteristics'].fillna('')
csv_data['participant_age'] = csv_data['participant_age'].fillna('')
csv_data['participant_gender'] = csv_data['participant_gender'].fillna('').str.lower()
csv_data['participant_status'] = csv_data['participant_status'].fillna('').str.lower()
csv_data['participant_type'] = csv_data['participant_type'].fillna('').str.lower()
csv_data.head()


# In[5]:


all_categories = {}
incidents = []
now = time.time()
for _,row in csv_data.iterrows():
    if _ > 0 and _ % 10000 == 0:
        print(f'{_} records processed')
    incident = Incident(date=row['date'],
                       state=abr[row['state']],
                       n_killed=row['n_killed'],
                       n_injured=row['n_injured'])
    # Categories
    categories = [cat for cat in row['incident_characteristics'].split('|') if cat]
    for cat in categories:
        category = all_categories.get(cat)
        if not category:
            category = Category(name=cat)
            all_categories[cat] = category
        incident.categories.append(category)
    # Participants
    participants = {}
    # - Age
    parts = [p for p in row['participant_age'].split('|') if p]
    for part in parts:
        if not part:
            continue
        i,raw_age = [p for p in part.split(':') if p]
        age = int(raw_age) if raw_age.isdigit() else None
        participant = participants.get(i)
        if not participant:
            participant = Participant(age=age)
            incident.participants.append(participant)
            participants[i] = participant
    # - Gender
    parts = [p for p in row['participant_gender'].split('|') if p]
    for part in parts:
        if not part:
            continue
        i,raw_gender = [p for p in part.split(':') if p]
        is_male=True if raw_gender == 'male' else False if raw_gender == 'female' else None
        participant = participants.get(i)
        if not participant:
            participant = Participant(is_male=is_male)
            incident.participants.append(participant)
            participants[i] = participant
        else:
            participant.is_male = is_male
    # - Status
    parts = [p for p in row['participant_status'].split('|') if p]
    for part in parts:
        if not part:
            continue
        i,raw_status = [p for p in part.split(':') if p]
        is_killed = True if 'killed' in raw_status else False if 'injured' in raw_status else None
        participant = participants.get(i)
        if not participant:
            participant = Participant(is_killed=is_killed)
            incident.participants.append(participant)
            participants[i] = participant
        else:
            participant.is_killed = is_killed
    # - Type
    parts = [p for p in row['participant_type'].split('|') if p]
    for part in parts:
        if not part:
            continue
        i,raw_type = [p for p in part.split(':') if p]
        is_victim = True if 'victim' in raw_type else                     False if 'suspect' in raw_type or 'subject' in raw_type else None
        participant = participants.get(i)
        if not participant:
            participant = Participant(is_victim=is_victim)
            incident.participants.append(participant)
            participants[i] = participant
        else:
            participant.is_victim = is_victim
    incidents.append(incident)
print('Created all incidents. Commiting...')
session.add_all(incidents)
session.commit()
now = int(time.time() - now)
print(f'Importing {len(csv_data)} incidents took {now // 60}:{now % 60:02d}')


# In[6]:


#!jupyter nbconvert --to Script db_import

