import re
from collections import Counter

# --- 1. THE BRAIN (Data Loading) ---
def read_book(file_name):
    try:
        # Using utf-8 to handle Sherlock Holmes characters
        with open(file_name, 'r', encoding='utf-8') as file:
            content = file.read().lower()
            return re.findall(r'\w+', content)
    except FileNotFoundError:
        return []

# Knowledge Setup
vocabulary = read_book('word.txt')
word_memory = Counter(vocabulary)

# --- 2. THE EDIT LOGIC ---
def get_edits(word):
    letters = 'abcdefghijklmnopqrstuvwxyz'
    splits = [(word[:i], word[i:]) for i in range(len(word) + 1)]
    
    deletes = [L + R[1:] for L, R in splits if R]
    transposes = [L + R[1] + R[0] + R[2:] for L, R in splits if len(R) > 1]
    replaces = [L + c + R[1:] for L, R in splits if R for c in letters]
    inserts = [L + c + R for L, R in splits for c in letters]
    
    return set(deletes + transposes + replaces + inserts)

# --- 3. THE SMART CORRECTION ---
def suggest_correction(word):
    # Keep punctuation/original word if it's already correct
    clean_word = re.sub(r'[^\w]', '', word.lower())
    if not clean_word or clean_word in word_memory:
        return word

    # Level 1 Search
    c1 = get_edits(clean_word)
    r1 = [w for w in c1 if w in word_memory]
    if r1:
        return max(r1, key=word_memory.get)
    
    # Level 2 Search (for deeper typos)
    if len(clean_word) > 4:
        c2 = set(e2 for e1 in c1 for e2 in get_edits(e1))
        r2 = [w for w in c2 if w in word_memory]
        if r2:
            return max(r2, key=word_memory.get)
            
    return word

