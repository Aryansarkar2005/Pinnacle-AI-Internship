import os
import re
from flask import Flask, request, jsonify, render_template
from autocorrect import suggest_correction

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/correct', methods=['POST'])
def correct_text():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
        
    sentence = data['text']
    words = sentence.split()
    tokens = []
    
    for w in words:
        clean = re.sub(r'[^\w]', '', w.lower())
        corrected = suggest_correction(clean)
        
        # Determine if it was changed
        changed = (clean != corrected) and bool(clean)
        
        punc = w[len(clean):] if clean else w
        prefix = w[:len(w)-len(clean)-len(punc)] if clean else ""
        
        # Build the final corrected word with punctuation
        final_corrected = prefix + corrected + punc
        
        tokens.append({
            'original': w,
            'corrected': final_corrected,
            'clean_original': clean,
            'clean_corrected': corrected,
            'changed': changed
        })
        
    return jsonify({
        'original': sentence,
        'tokens': tokens
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001) # Running on 5001 to avoid clash with Resume Parser
