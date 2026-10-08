import os
import zipfile

dist_dir = 'dist'
zip_filename = 'finfacil-hostinger.zip'

if not os.path.exists(dist_dir):
    print("Pasta dist não encontrada. Execute 'npm run build' primeiro.")
    exit(1)

# Remove any accidental zip files from dist
for f in os.listdir(dist_dir):
    if f.endswith('.zip'):
        try:
            os.remove(os.path.join(dist_dir, f))
        except OSError:
            pass

# Remove old zip in root if exists
if os.path.exists(zip_filename):
    os.remove(zip_filename)

included_files = []

with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            # Never include zip files or hidden OS junk
            if file.endswith('.zip') or file.startswith('.DS_Store'):
                continue
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, dist_dir)
            zipf.write(file_path, arcname)
            included_files.append(arcname)

file_size_kb = os.path.getsize(zip_filename) / 1024
print(f"✅ Pacote gerado com sucesso: '{zip_filename}' ({file_size_kb:.1f} KB)")
print(f"📦 Total de {len(included_files)} arquivos limpos e organizados prontos para a Hostinger:")
for f in sorted(included_files):
    print(f"   • {f}")
