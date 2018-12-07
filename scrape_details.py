
# coding: utf-8

# In[22]:


from bs4 import BeautifulSoup
import requests
import pandas as pd

def scrape_details(url, n_killed, n_injured):
    response = requests.get(url)

    soup = BeautifulSoup(response.text, 'lxml')
    
    results = soup.find_all('div', class_="region region-content")
    
    # Loop through returned results
    incedent_scrap = {"date" : "", "state" : "", "n_killed" : 0, "n_injured" : 0, "incident_characteristics" : "",
                      "participant_age" : "", "participant_gender" : "", "participant_status" : "",
                      "participant_type" : ""}



    for result in results:
        incedent = result.h1.text
        #print(incedent)

        incedent_scrap["date"] = result.h3.text
        #print("---------------------------")
        #print(date)

        #addresses = result.find_all('span')
        #for address in addresses:
            #print(address.text)

        results2 = soup.select('div#block-system-main div')
        for div in results2:
            if div.h2 and div.h2.text == 'Location':
                locations = div.find_all('span')
                for i,location in enumerate(reversed(locations)):
                    if location.text.startswith("Geolocation"):
                        continue
                    if "," in location.text:
                        citystate = location.text.split(", ")
                        incedent_scrap["state"] += f"{citystate[1]}"
                #print(incedent_scrap["state"])

        divs = result.select('div > div')
        for div in divs:
            if not div.h2:
                continue

                #print(div.h2.text)

            if (div.h2.text == 'Participants'):
                participants = div.find_all('ul')
                for i,participant in enumerate(participants):
                    participant_dic = {}
                    demograpics = participant.find_all('li')                    
                    pass
                    for demo in demograpics:
                        demosplit = demo.text.split(": ")                    
                        if demosplit[0]== "Name":
                            continue
                        if demosplit[0]== "Age Group":
                            continue
                        participant_dic[demosplit[0]]=demosplit[1]
                    if "Type" in participant_dic:
                        incedent_scrap["participant_type"] += f"{i}::{participant_dic['Type']}||"
                    else:
                        incedent_scrap["participant_type"] += f"{i}::Unknown||"

                    if "Age" in participant_dic:
                        incedent_scrap["participant_age"] += f"{i}::{participant_dic['Age']}||"
                    else:
                        incedent_scrap["participant_age"] += f"{i}::Unknown||"

                    if "Gender" in participant_dic:
                        incedent_scrap["participant_gender"] += f"{i}::{participant_dic['Gender']}||"
                    else:
                        incedent_scrap["participant_gender"] += f"{i}::Unknown||"

                    if "Status" in participant_dic:
                        incedent_scrap["participant_status"] += f"{i}::{participant_dic['Status']}||"
                    else:
                        incedent_scrap["participant_status"] += f"{i}::Unknown||"
                #print(incedent_scrap["participant_type"])
                #print(incedent_scrap["participant_age"])
                #print(incedent_scrap["participant_gender"])
                #print(incedent_scrap["participant_status"])

            if (div.h2.text == 'Incident Characteristics'):
                characteristics = div.find_all('ul')
                for characteristic in characteristics:
                    catagorys = characteristic.find_all('li')
                    pass
                    for catagory in catagorys:
                        incedent_scrap["incident_characteristics"] += f"{catagory.text}||"
                #print(incedent_scrap["incident_characteristics"])
    return incedent_scrap

