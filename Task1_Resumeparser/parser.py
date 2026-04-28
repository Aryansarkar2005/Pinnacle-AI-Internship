import docx
import spacy
import pymongo
import re
from datetime import datetime  # New: For the Timestamp

# 1. Load the AI Brain
nlp = spacy.load("en_core_web_sm")

# 2. Connect to the Database
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["Internship_DB"]
collection = db["Resumes"]

import phonenumbers # Add this at the top with your other imports

def extract_contact_info(text):
    # 1. Email Pattern (remains the same)
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    emails = re.findall(email_pattern, text)
    
    # 2. Global Phone Logic
    phone_to_return = "Not Found"
    
    # phonenumbers.PhoneNumberMatcher finds numbers in a block of text
    # 'IN' is the default region, but it will find +44, +1, etc. automatically
    matches = phonenumbers.PhoneNumberMatcher(text, "IN")
    
    for match in matches:
        # This formats the number into a standard international format (+91 98765 43210)
        phone_to_return = phonenumbers.format_number(
            match.number, 
            phonenumbers.PhoneNumberFormat.INTERNATIONAL
        )
        break # Take the first valid number found
        
    return {
        "email": emails[0] if emails else "Not Found",
        "phone": phone_to_return
    }

def extract_skills(text):
    # Updated skill bank with your MERN and ML expertise
    skill_bank = [
        'Python', 'C', 'SQL', 'HTML', 'MongoDB', 'Express', 'React', 
        'Node', 'Machine Learning', 'Neural Networks', 'UI/UX', 'DSA', 'MERN'
    ]
    found_skills = []
    text_upper = text.upper()
    
    for skill in skill_bank:
        if skill.upper() in text_upper:
            found_skills.append(skill)
            
    return found_skills

def parse_resume(file_path):
    doc = docx.Document(file_path)
    full_text = [para.text.strip() for para in doc.paragraphs if para.text.strip()]
    text = "\n".join(full_text)

    # NAME STRATEGY: Focus only on the top of the document
    top_lines = full_text[:5] 
    top_text = "\n".join(top_lines)
    doc_top = nlp(top_text)

    final_name = "Unknown"
    noise = ['UNIVERSITY', 'INSTITUTE', 'INDIA', 'TECHNOLOGY', 'COLLEGE']

    for ent in doc_top.ents:
        if ent.label_ == "PERSON":
            if not any(word in ent.text.upper() for word in noise):
                final_name = ent.text
                break
    
    if final_name == "Unknown" and full_text:
        final_name = full_text[0]

    # Run the sub-extractors
    skills = extract_skills(text)
    contact = extract_contact_info(text)

    return {
        "name": final_name,
        "email": contact["email"],
        "phone": contact["phone"],
        "skills": skills,
        "date_processed": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), # TIMESTAMP
        "content": text
    }

# 3. Main Execution
filename = "Gul_Afsha_Resume.docx"
try:
    result = parse_resume(filename)
    
    # Save it to MongoDB
    collection.insert_one(result)
    
    print("\n" + "="*40)
    print("      🚀 RESUME PARSED SUCCESSFULLY")
    print("="*40)
    print(f"Name:      {result['name']}")
    print(f"Email:     {result['email']}")
    print(f"Phone:     {result['phone']}")
    print(f"Skills:    {', '.join(result['skills'])}")
    print(f"Processed: {result['date_processed']}")
    print("="*40)
    print("Saved to MongoDB: Internship_DB > Resumes")

except Exception as e:
    print(f"Error occurred: {e}")