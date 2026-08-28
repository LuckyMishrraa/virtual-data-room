import io
import pytest

def test_audit_logs_list_and_auto_capture(client):
    # Perform upload action
    file_content = b"Audit Trail Test Document"
    file_tuple = ("audit_test.txt", io.BytesIO(file_content), "text/plain")
    client.post(
        "/api/v1/files/upload",
        files={"file": file_tuple},
        data={"parentId": "test-folder-1", "sensitivity": "Internal Only"}
    )

    # Perform rename action
    client.patch("/api/v1/files/test-file-1", json={"name": "Renamed_Report.txt"})

    # Fetch audit logs
    response = client.get("/api/v1/audit-logs")
    assert response.status_code == 200
    logs = response.json()
    assert len(logs) >= 2

    actions = [l["action"] for l in logs]
    assert "Uploaded" in actions
    assert "Renamed" in actions

def test_filter_audit_logs_by_file(client):
    # Trigger an action on test-file-1
    client.patch("/api/v1/files/test-file-1", json={"sensitivity": "Restricted"})

    response = client.get("/api/v1/audit-logs?fileId=test-file-1")
    assert response.status_code == 200
    logs = response.json()
    assert all(l["fileId"] == "test-file-1" for l in logs)

def test_record_manual_audit_log(client):
    payload = {
        "fileId": "test-file-1",
        "fileName": "Quarterly_Report.txt",
        "action": "Viewed",
        "actor": {
            "id": "usr-aud-04",
            "name": "Sarah Chen",
            "role": "Auditor"
        },
        "details": "Auditor conducted quarterly compliance inspection"
    }
    response = client.post("/api/v1/audit-logs", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["action"] == "Viewed"
    assert data["actor"]["role"] == "Auditor"
    assert "id" in data
