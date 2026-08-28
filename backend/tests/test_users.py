import pytest

def test_get_users(client):
    response = client.get("/api/v1/users")
    assert response.status_code == 200
    users = response.json()
    assert len(users) == 4
    roles = [u["role"] for u in users]
    assert "Admin" in roles
    assert "Compliance Officer" in roles
    assert "Advisor" in roles
    assert "Auditor" in roles

def test_get_current_user_by_role(client):
    response = client.get("/api/v1/users/current?role=Auditor")
    assert response.status_code == 200
    user = response.json()
    assert user["role"] == "Auditor"
    assert user["name"] == "Sarah Chen"
