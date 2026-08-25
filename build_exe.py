"""Regenera o app Windows (Nativefier) a partir do "Versão Final.html" atualizado.

O app foi originalmente empacotado com `nativefier <file://...html>`, que copia o
HTML para dentro do .exe em vez de referenciar o caminho original — por isso
qualquer alteração no HTML exige refazer o build. Os parâmetros abaixo foram
extraídos de resources/app/nativefier.json do build existente, para reproduzir
o mesmo executável (nome, ícone, versão do Electron, tamanho de janela etc.).
"""
import json
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

if sys.platform != "win32":
    sys.exit("Este build só roda no Windows (gera um .exe win32/x64).")

PROJECT_DIR = Path(__file__).resolve().parent
SOURCE_HTML = PROJECT_DIR / "Versão Final.html"
APP_DIR = PROJECT_DIR / "Simulador de Frota - App Windows"
ICON_PATH = APP_DIR / "resources" / "app" / "icon.ico"

APP_NAME = "Simulador de Frota"
NATIVEFIER_VERSION = "52.0.0"
ELECTRON_VERSION = "25.7.0"
WIN32_METADATA = {
    "ProductName": APP_NAME,
    "InternalName": APP_NAME,
    "FileDescription": APP_NAME,
}


def build() -> None:
    if not SOURCE_HTML.exists():
        sys.exit(f"Fonte não encontrada: {SOURCE_HTML}")
    if not ICON_PATH.exists():
        sys.exit(f"Ícone não encontrado: {ICON_PATH}")

    staging = PROJECT_DIR / "_nativefier_build"
    if staging.exists():
        shutil.rmtree(staging)
    staging.mkdir()

    target_url = SOURCE_HTML.resolve().as_uri()

    cmd = [
        "npx", f"nativefier@{NATIVEFIER_VERSION}",
        target_url,
        str(staging),
        "--name", APP_NAME,
        "--platform", "windows",
        "--arch", "x64",
        "--electron-version", ELECTRON_VERSION,
        "--icon", str(ICON_PATH),
        "--width", "1280",
        "--height", "800",
        "--single-instance",
        "--win32metadata", json.dumps(WIN32_METADATA),
    ]

    print("Executando:", " ".join(cmd))
    result = subprocess.run(cmd, shell=True, cwd=PROJECT_DIR)
    if result.returncode != 0:
        shutil.rmtree(staging, ignore_errors=True)
        sys.exit(f"Build falhou (exit code {result.returncode}).")

    built = list(staging.glob("*"))
    if len(built) != 1:
        sys.exit(f"Esperava 1 pasta gerada em {staging}, encontrei {len(built)}: {built}")
    new_app_dir = built[0]

    if APP_DIR.exists():
        backup_dir = PROJECT_DIR / f"Simulador de Frota - App Windows.backup-{datetime.now():%Y%m%d-%H%M%S}"
        print(f"Fazendo backup do app atual em: {backup_dir}")
        APP_DIR.rename(backup_dir)

    new_app_dir.rename(APP_DIR)
    staging.rmdir()

    print(f"\nApp gerado com sucesso em: {APP_DIR}")
    print(f"Executável: {APP_DIR / (APP_NAME + '.exe')}")


if __name__ == "__main__":
    build()
