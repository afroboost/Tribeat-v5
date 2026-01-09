"""
Proxy Backend pour Emergent Platform
Redirige les requêtes vers Next.js
"""
import os
import httpx
from fastapi import FastAPI, Request
from fastapi.responses import Response, JSONResponse
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NEXTJS_URL = "http://localhost:3000"

@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok"}

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy(request: Request, path: str):
    """Proxy all other requests to Next.js"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Forward the request to Next.js
            url = f"{NEXTJS_URL}/{path}"
            
            # Get body for non-GET requests
            body = None
            if request.method != "GET":
                body = await request.body()
            
            # Forward headers, but remove host
            headers = dict(request.headers)
            headers.pop('host', None)
            
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                follow_redirects=False,
            )
            
            # Forward response headers, but filter some
            response_headers = {}
            for key, value in response.headers.items():
                if key.lower() not in ('transfer-encoding', 'content-encoding'):
                    response_headers[key] = value
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=response_headers,
            )
    except httpx.TimeoutException:
        return JSONResponse(
            content={"error": "Timeout connecting to Next.js"},
            status_code=504,
        )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500,
        )
