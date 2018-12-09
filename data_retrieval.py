
# coding: utf-8

# In[1]:


from db_schema import engine, Incident, Category, Participant, Statistics, StatisticsValue
from sqlalchemy.orm import sessionmaker
from sqlalchemy import func, extract


# In[2]:


Session = sessionmaker(bind=engine)


# In[3]:


participant_pivots = { 'victimAge', 'victimGender', 'suspectAge', 'suspectGender' }
incident_pivots = { 'state', 'year', 'yearMonth' }

stat_group_by_selectors = {
    'state': StatisticsValue.state,
    'year': StatisticsValue.year
}

group_by_converters = {
    'year': lambda x: int(x),
    'victimGender': lambda x: 'Male' if x else 'Female',
    'suspectGender': lambda x: 'Male' if x else 'Female'
}

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

incident_aggregate_selectors = {
    'incidents': func.count(),
    'killed': func.sum(Incident.n_killed),
    'injured': func.sum(Incident.n_injured)
}
# If we group by year then we need to sum values across all states
# If we group by state then we need to get average value across all years
stat_aggregate_selectors = {
    'state': func.round(func.avg(StatisticsValue.value), 1),
    'year': func.sum(StatisticsValue.value)
}


# In[4]:


session = Session()


# In[5]:


def _get_statistic(session, settings, axis):
    # Extract data
    axis_label = 'x_axis' if axis == 'xAxis' else 'z_axis'
    id = int(settings[axis]['value'])   
    pivot_by = settings['pivotBy']
    pivots = [value['value'] for value in pivotBy] if isinstance(pivot_by, list) else [pivot_by['value']]
    years = [int(value['value']) for value in settings['years']]
    states = [value['value'] for value in settings['states']]
    # 1. Add group by selectors
    group_selectors = []
    aggregate_selector = None
    for pivot in pivots:
        group_selectors.append(stat_group_by_selectors[pivot])
        aggregate_selector = stat_aggregate_selectors[pivot]
    # 2. Create query
    query = session.query(*group_selectors, aggregate_selector).        filter(StatisticsValue.statistics_id == id).        group_by(*group_selectors)
    # 3. Filter by year
    if len(years):
        query = query.filter(StatisticsValue.year.in_(years))
    # 4. Filter by state
    if len(states):
        query = query.filter(StatisticsValue.state.in_(states))
    # Executing query and converting it to proper format
    data = query.all()
    result = {}
    result['axis_label'] = axis_label
    result[axis_label] = settings[axis]['display']
    result['data'] = {}
    for item in data:
        item_data = result['data']
        for sub_item in item[:-1]:        
            item_data = item_data.setdefault(sub_item, {})
        item_data[axis_label] = item[-1]
    return result


# In[6]:


def _get_incidents(session, settings):
    # Extracting values
    inclusive_categories = [value['value'] for value in settings['inclusiveCategories']]
    exclusive_categories = [value['value'] for value in settings['exclusiveCategories']]
    years = [int(value['value']) for value in settings['years']]
    states = [value['value'] for value in settings['states']]    
    pivot_by = settings['pivotBy']
    pivots = [value['value'] for value in pivotBy] if isinstance(pivot_by, list) else [pivot_by['value']]
    y_axis = settings['yAxis']['value']
    
    # Check data type
    has_participant_pivot = len(participant_pivots.intersection(pivots))
    has_incident_pivot = len(incident_pivots.intersection(pivots))
    has_incident_filter = len(inclusive_categories) or len(exclusive_categories) or len(years)
    
    # 1. Add group by selectors 
    group_selectors = []
    group_converters = []
    for pivot in pivots:
        group_selectors.append(group_by_selectors[pivot])
        group_converters.append(group_by_converters.get(pivot))
    # 2. Add aggregate selector
    aggregate_selector = func.count() if has_participant_pivot else incident_aggregate_selectors[y_axis]
    query_selectors = group_selectors + [aggregate_selector]
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
    # 8. Add filter by years
    if len(years):
        query = query.filter(extract('year', Incident.date).in_(years))  
    # 9. Filter by state
    if len(states):
        query = query.filter(Incident.state.in_(states))
    # 10. Add group by
    query = query.group_by(*group_selectors)
    
    # Executing query and converting it to proper format
    data = query.all()
    result = {}
    result['y_axis'] = settings['yAxis']['display']
    result['pivot'] = [value['display'] for value in pivotBy] if isinstance(pivot_by, list) else [pivot_by['display']]
    result['data'] = {}
    for item in data:
        item_data = result['data']
        for i,sub_item in enumerate(item[:-1]):
            item_data = item_data.setdefault(group_converters[i](sub_item) if group_converters[i] else sub_item, {})
        item_data['y_axis'] = item[-1]
    return result 


# In[7]:


def get_data(settings):
    session = Session()
    result = _get_incidents(session, settings)
    x_axis = None
    if 'xAxis' in settings:
        x_axis = _get_statistic(session, settings, 'xAxis')
        result['x_axis'] = settings['xAxis']['display']
    z_axis = None
    if 'zAxis' in settings:
        z_axis = _get_statistic(session, settings, 'zAxis')
        result['z_axis'] = settings['zAxis']['display']
    for axis in [x_axis, z_axis]:
        if not axis:
            continue
        axis_label = axis['axis_label']
        result
        # This algorithm treats the both incident dictionary and x- or z-axis dictionary as n-ary trees which 
        # structures are mirrored, so it matches
        stack = []
        stack.append((result['data'], axis['data']))
        while len(stack):
            inc_data, axis_data = stack.pop()
            
            if axis_label in axis_data:
                inc_data[axis_label] = axis_data[axis_label]
                if 'y_axis' not in inc_data:
                    inc_data['y_axis'] = 0
            else:
                for k in axis_data:                    
                    stack.append((inc_data.setdefault(k, {}), axis_data[k]))
    return result


# In[8]:


def get_categories():
    return [c[0] for c in Session().query(Category.name).all()]


# In[9]:


def get_statistics():
    return [ { 'id':c[0], 'name':c[1] } for c in Session().query(Statistics.id, Statistics.name).all()]


# In[13]:


#!jupyter nbconvert --to Script data_retrieval

