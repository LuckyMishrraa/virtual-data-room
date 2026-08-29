
def test_get_permissions(client):
    response = client.get("/api/v1/files/test-file-1/permissions")
    assert response.status_code == 200
    data = response.json()
    assert "Admin" in data
    assert "Compliance Officer" in data
    assert "Advisor" in data
    assert "Auditor" in data
    assert data["Admin"]["canEdit"] is True
    assert data["Auditor"]["canEdit"] is False

def test_update_permissions(client):
    updated_matrix = {
        "Admin": {"canView": True, "canEdit": True, "canShare": True},
        "Compliance Officer": {"canView": True, "canEdit": True, "canShare": True},
        "Advisor": {"canView": True, "canEdit": True, "canShare": True}, # promoted
        "Auditor": {"canView": True, "canEdit": False, "canShare": False}
    }
    response = client.put(
        "/api/v1/files/test-file-1/permissions",
        json={"permissions": updated_matrix}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["permissions"]["Advisor"]["canEdit"] is True

    # Verify persistent
    get_res = client.get("/api/v1/files/test-file-1/permissions")
    assert get_res.json()["Advisor"]["canEdit"] is True
