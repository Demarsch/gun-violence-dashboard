
# coding: utf-8

# In[ ]:


from db_schema import engine, Incident, Category, Participant
from sqlalchemy.orm import sessionmaker
from sqlalchemy import func


# In[ ]:


Session = sessionmaker(bind=engine)


# In[ ]:


participant_pivots = { 'victimAge', 'victimGender', 'suspectAge', 'suspectGender' }
incident_pivots = { 'state', 'year', 'yearMonth' }
group_by_selectors = {
    'state': Incident.state,
    'year': func.strftime('%Y', Incident.date),
    'yearMonth': func.strftime('%Y-%m', Incident.date),
    'victimAge': Participant.age,
    'victimGender': Participant.is_male,
    'suspectAge': Participant.age,
    'suspectGender': Participant.is_male
}

participant_status_filters = {
    'incidents': None,
    'killed': (Participant.is_killed, True),
    'injured': (Participant.is_killed, False)
}

participant_type_filters = {
    'victimAge': (Participant.is_victim, True),
    'victimGender': (Participant.is_victim, True),
    'suspectAge': (Participant.is_victim, False),
    'suspectGender': (Participant.is_victim, False),
}


# In[ ]:


def get_data(settings):
    session = Session()
    
    # Extracting values
    inclusive_categories = [value['value'] for value in settings['inclusiveCategories']]
    exclusive_categories = [value['value'] for value in settings['exclusiveCategories']]
    pivots = [value['value'] for value in settings['pivotBy']]
    y_axis = settings['yAxis']['value']
    
    # Check data type
    has_participant_pivot = len(participant_pivots.intersection(pivots)) > 0
    has_incident_pivot = len(incident_pivots.intersection(pivots)) > 0
    has_incident_filter = len(inclusive_categories) > 0 or len(exclusive_categories) > 0
    
    # 1. Add group by selectors 
    group_selectors = []
    for pivot in pivots:
        group_selectors.append(group_by_selectors[pivot])
    # 2. Add aggregate selector
    query_selectors = group_selectors + [func.count()]
    query = session.query(*query_selectors)
    # 3. Add join if both incidents and participants
    if has_participant_pivot and (has_incident_pivot or has_incident_filter):
        query = query.filter(Incident.id == Participant.incident_id)
    # 4. Add participant type filters
    for pivot in pivots:
        is_participant = pivot in participant_pivots
        if is_participant:
            type_filter = participant_type_filters[pivot]
            query = query.filter(type_filter[0] == type_filter[1])
    # 5. Add participant status filters
    if has_participant_pivot:    
        status_filter = participant_status_filters[y_axis]
        if status_filter:
            query = query.filter(status_filter[0] == status_filter[1])
    # 6. Add incident category filters
    if len(inclusive_categories):
        incat_incidents = session.query(Incident.id).            filter(Incident.categories.any(Category.name.in_(inclusive_categories))).            subquery()
        query = query.join(incat_incidents, Incident.id == incat_incidents.c.id)
    if len(exclusive_categories):
        excat_incidents = session.query(Incident.id).            filter(Incident.categories.any(Category.name.in_(exclusive_categories))).            subquery()
        query = query.outerjoin(excat_incidents, Incident.id == excat_incidents.c.id).            filter(excat_incidents.c.id == None)
    # 7. Add filter to ignore items with unknown value
    for group_selector in group_selectors:
        query = query.filter(group_selector != None)
    # 8. Add group by
    query = query.group_by(*group_selectors)
    
    # Executing query and converting it to proper format
    data = query.all()
    result = {}
    result['y_axis'] = settings['yAxis']['display']
    result['pivot'] = [value['display'] for value in settings['pivotBy']]
    result['data'] = {}
    for item in data:
        item_data = result['data']
        for sub_item in item[:-1]:        
            item_data = item_data.setdefault(sub_item, {})
        item_data['y_axis'] = item[-1]
    return result    


# In[ ]:


def get_categories():
    return [c[0] for c in Session().query(Category.name).all()]


# In[ ]:


#!jupyter nbconvert --to Script data_retrieval

