import pytest

def test_add_compliance_flag(client):
    response = client.post(
        "/api/v1/files/test-file-1/flags",
        json={
            "lineOrSection": "Section 4 - Derivative Exposure",
            "severity": "high",
            "reason": "Missing secondary compliance sign-off"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["lineOrSection"] == "Section 4 - Derivative Exposure"
    assert data["severity"] == "high"
    assert "id" in data

    # Verify file now has 2 flags
    file_res = client.get("/api/v1/files/test-file-1")
    flags = file_res.json()["complianceFlags"]
    assert len(flags) == 2

def test_remove_compliance_flag(client):
    response = client.delete("/api/v1/files/test-file-1/flags/test-flag-1")
    assert response.status_code == 200
    assert response.json()["success"] is True

    # Verify flag was removed
    file_res = client.get("/api/v1/files/test-file-1")
    assert len(file_res.json()["complianceFlags"]) == 0
