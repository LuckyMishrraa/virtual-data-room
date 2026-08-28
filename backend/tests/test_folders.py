import pytest

def test_create_folder_root(client):
    response = client.post(
        "/api/v1/folders",
        json={"name": "2026 Tax Disclosures", "sensitivity": "Restricted"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "2026 Tax Disclosures"
    assert data["isFolder"] is True
    assert data["parentId"] is None
    assert data["sensitivity"] == "Restricted"

def test_create_folder_nested(client):
    response = client.post(
        "/api/v1/folders",
        json={"name": "Sub-Accounting", "parentId": "test-folder-1", "sensitivity": "Internal Only"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Sub-Accounting"
    assert data["parentId"] == "test-folder-1"

def test_create_duplicate_folder_error(client):
    response = client.post(
        "/api/v1/folders",
        json={"name": "Test Portfolio"} # Already exists at root
    )
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]

def test_get_folder_breadcrumbs(client):
    # Create child folder
    child_res = client.post(
        "/api/v1/folders",
        json={"name": "Nested Level 2", "parentId": "test-folder-1"}
    )
    child_id = child_res.json()["id"]

    response = client.get(f"/api/v1/folders/breadcrumbs/{child_id}")
    assert response.status_code == 200
    crumbs = response.json()
    assert len(crumbs) == 3
    assert crumbs[0]["name"] == "Home"
    assert crumbs[1]["name"] == "Test Portfolio"
    assert crumbs[2]["name"] == "Nested Level 2"

def test_delete_folder_cascade(client):
    response = client.delete("/api/v1/folders/test-folder-1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["deletedCount"] >= 2 # folder + test-file-1

    # Verify children are deleted as well
    get_file_res = client.get("/api/v1/files/test-file-1")
    assert get_file_res.status_code == 404
