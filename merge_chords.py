import json
import re

def normalize_name(name):
    n = name.replace('(', '').replace(')', '')
    n = n.replace('-', 'b').replace('+', '#')
    
    n = re.sub(r'5b', 'b5', n)
    n = re.sub(r'5#', '#5', n)
    n = re.sub(r'9b', 'b9', n)
    n = re.sub(r'9#', '#9', n)
    n = re.sub(r'11#', '#11', n)
    n = re.sub(r'13b', 'b13', n)
    
    # Some common normalizations
    n = n.replace('75b', '7b5')
    n = n.replace('75#', '7#5')
    return n

def format_custom_json(data):
    lines = ["{"]
    keys = list(data.keys())
    for i, key in enumerate(keys):
        lines.append(f'  "{key}": [')
        chords = data[key]
        for j, chord in enumerate(chords):
            frets_str = json.dumps(chord['frets']).replace(' ', '')
            chord_str = f'{{"chordName":"{chord["chordName"]}","frets":{frets_str}}}'
            comma = "," if j < len(chords) - 1 else ""
            lines.append(f'    {chord_str}{comma}')
        comma_key = "," if i < len(keys) - 1 else ""
        lines.append(f'  ]{comma_key}')
    lines.append("}")
    return "\n".join(lines)

def main():
    with open('src/config/cavaquinho-dictionary.json', 'r', encoding='utf-8') as f:
        target = json.load(f)
        
    with open('diagramas/diagramas_the_best/diagramas-the_best.json', 'r', encoding='utf-8') as f:
        source = json.load(f)
        
    target_keys_normalized = {normalize_name(k): k for k in target.keys()}
    
    added_examples = {}
    
    for item in reversed(source): # Reverse so that when we insert at 0, they maintain their original order relative to each other if desired, but actually user says "these should be first". If source has multiple, the first in source should be first in target. So we should insert them normally but at the top? Wait. Let's just collect the ones to add per key, then prepend them.
        pass

    # Better approach:
    to_add_per_key = {}
    
    for item in source:
        orig_name = item['chordName']
        frets = item['frets']
        
        # Replace 'x' with -1
        frets = [-1 if f in ('x', 'X') else f for f in frets]
        
        norm_name = normalize_name(orig_name)
        
        if norm_name in target_keys_normalized:
            target_key = target_keys_normalized[norm_name]
        else:
            target_key = orig_name.replace('-', 'b').replace('+', '#').replace('(', '').replace(')', '')
            target_keys_normalized[norm_name] = target_key
            target[target_key] = []
            
        if target_key not in to_add_per_key:
            to_add_per_key[target_key] = []
            
        # check if it's already in to_add_per_key
        exists_in_new = any(x['frets'] == frets for x in to_add_per_key[target_key])
        
        # check if it exists in target
        exists_in_target = any(x['frets'] == frets for x in target[target_key])
        
        if not exists_in_new and not exists_in_target:
            new_item = {"chordName": target_key, "frets": frets}
            to_add_per_key[target_key].append(new_item)
            
            if target_key not in added_examples:
                added_examples[target_key] = []
            added_examples[target_key].append(new_item)

    # Now prepend
    for key, new_items in to_add_per_key.items():
        if new_items:
            target[key] = new_items + target[key]
            
    # Save target
    with open('src/config/cavaquinho-dictionary.json', 'w', encoding='utf-8') as f:
        f.write(format_custom_json(target))

    with open('added_examples.json', 'w', encoding='utf-8') as f:
        json.dump(added_examples, f, indent=2)

if __name__ == '__main__':
    main()
