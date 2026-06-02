from fastapi.testclient import TestClient

ADMIN_EMAIL = "admin@cddpro.com"
ADMIN_PASS = "supersecretpassword"

def _create_admin_user(client: TestClient):
    """Create an admin user via POST /api/users."""
    resp = client.post("/api/users", json={
        "name": "Admin",
        "surname": "",
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASS,
        "centers": [],
        "roles": ["Superadmin"],
    })
    # May fail if user already exists; that's fine
    return resp

def test_read_root(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "CDD Pro API is running"}

def test_login_admin(client: TestClient):
    _create_admin_user(client)
    response = client.post(
        "/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "access_token" in data
    assert data["user"]["roles"] == "Superadmin"

def test_list_admin_modules(client: TestClient):
    response = client.get("/api/admin/modules")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert isinstance(data["data"], list)

def get_auth_headers(client: TestClient):
    _create_admin_user(client)
    response = client.post(
        "/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_documents_list_root(client: TestClient):
    response = client.get("/api/documents/list?path=")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert type(data["data"]) == list

def test_documents_path_traversal(client: TestClient):
    response = client.get("/api/documents/list?path=../")
    assert response.status_code == 403
    assert "Path traversal detectado" in response.json()["detail"]
