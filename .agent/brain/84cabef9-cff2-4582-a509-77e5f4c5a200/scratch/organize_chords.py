import json
import os

path = r'c:\Projects\appChords\src\config\cavaquinho-dictionary.json'

def organize_dictionary():
    if not os.path.exists(path):
        print(f"Erro: Arquivo não encontrado em {path}")
        return

    with open(path, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except Exception as e:
            print(f"Erro ao ler JSON: {e}")
            return

    output = '{\n'
    keys = list(data.keys())

    for i, key in enumerate(keys):
        variations = data[key]
        # Ordena as variações pelo array de frets (comparação léxica)
        # Ex: [1, 0, 1, 2] < [5, 5, 5, 5]
        variations.sort(key=lambda x: x['frets'])
        
        output += f'  "{key}": [\n'
        for j, var in enumerate(variations):
            # Formata o objeto em uma única linha
            line = json.dumps(var, ensure_ascii=False)
            comma = ',' if j < len(variations) - 1 else ''
            output += f'    {line}{comma}\n'
        
        comma_outer = ',' if i < len(keys) - 1 else ''
        output += f'  ]{comma_outer}\n'

    output += '}'

    with open(path, 'w', encoding='utf-8') as f:
        f.write(output)
    print("Sucesso: Dicionário organizado e formatado.")

if __name__ == "__main__":
    organize_dictionary()
