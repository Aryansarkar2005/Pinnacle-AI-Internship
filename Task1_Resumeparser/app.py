import os
from flask import Flask, request, jsonify, render_template
from parser import parse_resume, extract_skills

app = Flask(__name__)

# Route for the main UI
@app.route('/')
def index():
    return render_template('index.html')

# API Route for evaluation
@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file uploaded'}), 400
        
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    hr_prompt = request.form.get('hr_prompt', '')
    
    try:
        # Parse the resume directly from the uploaded file stream
        result = parse_resume(file)
        
        # Determine desired skills from HR prompt
        # We can reuse extract_skills to find what the HR is looking for
        desired_skills = [s.lower() for s in extract_skills(hr_prompt)]
        
        # If the HR prompt is completely random text not in our skill bank, 
        # we can also just split by commas as a fallback
        if not desired_skills and hr_prompt:
            desired_skills = [s.strip().lower() for s in hr_prompt.split(',') if s.strip()]
            
        candidate_skills = [s.lower() for s in result.get('skills', [])]
        
        # Calculate match
        matched_skills = []
        for ds in desired_skills:
            # simple match, if desired skill is in candidate skill
            if ds in candidate_skills:
                matched_skills.append(ds)
                
        # Calculate Score
        score = "N/A"
        percentage = 0
        if desired_skills:
            percentage = (len(matched_skills) / len(desired_skills)) * 100
            if percentage >= 90:
                score = "Best"
            elif percentage >= 70:
                score = "Good"
            elif percentage >= 40:
                score = "Fair"
            else:
                score = "Not Best"
        elif candidate_skills:
            score = "Good" # Default if no specific HR prompt given but candidate has skills
        else:
            score = "Fair"
            
        response_data = {
            'success': True,
            'name': result.get('name', 'Unknown'),
            'email': result.get('email', 'Not Found'),
            'phone': result.get('phone', 'Not Found'),
            'candidate_skills': result.get('skills', []),
            'desired_skills': desired_skills,
            'matched_skills': matched_skills,
            'score': score,
            'match_percentage': round(percentage, 1)
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
