#!/usr/bin/env python
# coding: utf-8

# In[22]:


from sqlalchemy import create_engine, Table, ForeignKey, Column, Boolean, Integer, String, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship


# In[23]:


engine = create_engine('sqlite:///../data/data.sqlite')
Base = declarative_base()


# In[24]:


incident_categories = Table('incident_categories', Base.metadata,
    Column('incident_id', Integer, ForeignKey('incidents.id')),
    Column('category_id', Integer, ForeignKey('categories.id')))


# In[25]:


class Incident(Base):
    __tablename__ = 'incidents'
    
    id = Column(Integer, primary_key=True)
    date = Column(Date)
    state = Column(String(2))
    n_killed = Column(Integer)
    n_injured = Column(Integer)  
    
    categories = relationship('Category',
                            secondary=incident_categories,
                            backref='incidents')    


# In[26]:


class Category(Base):
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200))  
    
    incidents = relationship('Incident',
                            secondary=incident_categories,
                            backref='categories')


# In[27]:


class Participant(Base):
    __tablename__ = 'participants'
    
    id = Column(Integer, primary_key=True)
    incident_id = Column(Integer, ForeignKey('incidents.id'))
    age = Column(Integer)
    gender = Column(String(1))
    is_killed = Column(Boolean)
    is_victim = Column(Boolean)
    
    incident = relationship('Incident')


# In[28]:


Base.metadata.create_all(engine)

