import requests

response = requests.post(
    "https://apifreellm.com/api/v1/chat",
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer apf_ydj4nej5fanuc6h2hinoykrt"
    },
    json={
        "message": "Hello, how are you?"
    }
)

print(response.json())