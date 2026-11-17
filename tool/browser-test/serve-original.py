from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

ROOT=Path(r'E:\02.Games\AI\pelican-campus-quest')
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def translate_path(self,path):
        resolved=super().translate_path(path)
        if path.startswith('/assets/glb/') and path.endswith('.glb'):
            candidate=ROOT/'public'/'assets'/'glb'/Path(resolved).name
            if candidate.is_file():return str(candidate)
        return resolved
ThreadingHTTPServer(('127.0.0.1',3000),Handler).serve_forever()
