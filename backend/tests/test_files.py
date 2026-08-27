import io
import pytest

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_list_files_root(client):
    response = client.get("/api/v1/files")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Test Portfolio"
    assert data[0]["isFolder"] is True

def test_list_files_in_folder(client):
    response = client.get("/api/v1/files?parentId=test-folder-1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Quarterly_Report.txt"
    assert data[0]["sensitivity"] == "Confidential"
    assert len(data[0]["complianceFlags"]) == 1

def test_search_files(client):
    response = client.get("/api/v1/files?search=Quarterly")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Quarterly_Report.txt"

def test_filter_sensitivity(client):
    response = client.get("/api/v1/files?sensitivity=Confidential")
    assert response.status_code == 200
    data = response.json()
    assert all(f["sensitivity"] == "Confidential" for f in data)

def test_sort_files(client):
    response = client.get("/api/v1/files?sortBy=name&sortOrder=desc")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_file_tree(client):
    response = client.get("/api/v1/files/tree")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Test Portfolio"
    assert len(data[0]["children"]) == 1
    assert data[0]["children"][0]["name"] == "Quarterly_Report.txt"

def test_get_file_detail(client):
    response = client.get("/api/v1/files/test-file-1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "test-file-1"
    assert "Admin" in data["permissions"]
    assert data["permissions"]["Admin"]["canEdit"] is True

def test_upload_file(client):
    file_content = b"Mock Fund Disclosure Agreement\nSection 1: Assets"
    file_tuple = ("fund_agreement.txt", io.BytesIO(file_content), "text/plain")
    
    response = client.post(
        "/api/v1/files/upload",
        files={"file": file_tuple},
        data={"parentId": "test-folder-1", "sensitivity": "Restricted"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "fund_agreement.txt"
    assert data["sensitivity"] == "Restricted"
    assert data["parentId"] == "test-folder-1"
    assert data["sizeBytes"] == len(file_content)

def test_get_file_content(client):
    response = client.get("/api/v1/files/test-file-1/content")
    assert response.status_code == 200
    assert "This is test report content." in response.text

def test_get_download_url(client):
    response = client.get("/api/v1/files/test-file-1/download-url")
    assert response.status_code == 200
    data = response.json()
    assert "downloadUrl" in data
    assert data["fileName"] == "Quarterly_Report.txt"

def test_update_file_rename_and_sensitivity(client):
    response = client.patch(
        "/api/v1/files/test-file-1",
        json={"name": "Audited_Quarterly_Report.txt", "sensitivity": "Restricted"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Audited_Quarterly_Report.txt"
    assert data["sensitivity"] == "Restricted"

def test_batch_tag_files(client):
    response = client.post(
        "/api/v1/files/batch-tag",
        json={"fileIds": ["test-file-1"], "sensitivity": "Public"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["affectedCount"] == 1

def test_delete_file(client):
    response = client.delete("/api/v1/files/test-file-1")
    assert response.status_code == 200
    assert response.json()["success"] is True

    # Verify not found afterwards
    get_res = client.get("/api/v1/files/test-file-1")
    assert get_res.status_code == 404
