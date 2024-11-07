#!/usr/bin/env python3
from jobspy import scrape_jobs
import json
import pandas as pd
import sys

search_term = sys.argv[1]
location = sys.argv[2]
jobs = scrape_jobs(
    site_name=["indeed", "linkedin"],
    search_term=f"{search_term}",
    location=f"{location}",
    results_wanted=5,
    country_indeed='Canada',
    # linkedin_fetch_description=True,
    # proxies=["72.10.160.171:16775"]
)

print(f"Found {len(jobs)} jobs")
print(jobs.head())

# Convert all columns to string to avoid serialization issues
jobs = jobs.astype(str)

# Convert jobs DataFrame to a list of dictionaries
jobs_list = jobs.to_dict(orient='records')

# Write to a JSON file
with open("intermediate.json", "a") as json_file:
    json.dump(jobs_list, json_file, indent=4)

print("Jobs data saved to jobs.json")