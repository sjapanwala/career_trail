#!/usr/bin/env python3
import json
import sys
import re
from datetime import date
import json

def clean_data(json_data, output_file="jobs.json"):
    files_appended = 0
    # Try to open the output file and load existing data
    try:
        with open(output_file, "r") as json_file:
            existing_data = json.load(json_file)
    except (FileNotFoundError, json.JSONDecodeError):
        # If the file doesn't exist or is empty, initialize an empty list
        existing_data = []

    # Create a set of existing ids to easily check for duplicates
    existing_ids = {job["id"] for job in existing_data}

    # Initialize a list for the cleaned new data
    cleannew_data = []

    # Iterate through each job in the input data
    for job in json_data:
        job_id = job["id"]
        # get job source
        job_site = job["site"]
        job_url = job["job_url"]
        job_url_direct = job["job_url_direct"]
        # get job information
        job_title = job["title"]
        job_company = job["company"]
        job_location = job["location"]
        job_type = job["job_type"]
        job_date_posted = job["date_posted"]
        job_salary_source = job["salary_source"]
        job_interval = job["interval"]
        # job keywords
        keywords = keywordize(json_data)  # Assuming keywordize is defined elsewhere
        thedate = date.today()
        new_data = {
            "id": f"{job_id}",
            "job_source": {
                "site": f"{job_site}",
                "job_url": f"{job_url}",
                "job_url_direct": f"{job_url_direct}"
            },
            "job_information": {
                "title": f"{job_title}",
                "company": f"{job_company}",
                "location": f"{job_location}",
                "job_type": f"{job_type}",
                "date_posted": f"{job_date_posted}",
                "date_found": f"{thedate}",
                "salary_source": f"{job_salary_source}",
                "interval": f"{job_interval}",
            },
            "job_keywords": {
                "keywords": f"{list(keywords)}",
            },
            "user_information": {
                "applied": "False",
                "applied_date": "nan",
                "responsded": "False",
                "status": "nan",
                "user_notes": "",
                }
        }
        
        # Only append if the id is not already in existing_ids
        if job_id not in existing_ids:
            files_appended += 1
            cleannew_data.append(new_data)
            existing_ids.add(job_id)  # Add the job_id to the set to track it

    # Write the updated data back to the file
    updated_data = existing_data + cleannew_data
    with open(output_file, "w") as json_file:
        json.dump(updated_data, json_file, indent=4)
    print(f"{files_appended} files appended to {output_file}")

def keywordize(json_data):
    keywords = []
    cleaned_keywords = []
    removed_keywords = ['nan','None','False','True', "and", "or", "if", "the", "to", "is", "in", "for", "of", "a", "an", "on", 
    "at", "by", "with", "as", "from", "it", "this", "that", "not", "be", "are", 
    "was", "were", "have", "has", "had", "will", "shall", "may", "might", "could", 
    "must", "should", "can", "cannot", "else", "then", "because", "which", "who", 
    "whom", "whose", "where", "when", "how", "why"
    ]
    for job in json_data:
        keywords.extend([
            job.get("title", ""),
            job.get("company", ""),
            job.get("location", ""),
            job.get("job_type", ""),
            job.get("currency", ""),
            job.get("is_remote", ""),
            job.get("job_level", ""),
            job.get("job_function", ""),
            job.get("listing_type", ""),
            job.get("site", ""),
        ])
        keywords = [keyword.split() if isinstance(keyword, str) else keyword for keyword in keywords]
        for i in keywords:
            for j in i:
                if j not in removed_keywords:
                    if j.isalnum() == True:
                        cleaned_keywords.append(j.lower())
        return cleaned_keywords
        
def main():
    with open("intermediate.json", "r") as json_file:
        json_data = json.load(json_file)
    #keywordize
    clean_data(json_data)

if __name__ == "__main__":
    main()